<?php
/**
 * Cntysoft Cloud Software Team
 * 
 * @author Arvin <cntyfeng@163.com>
 * @copyright Copyright (c) 2010-2016 Cntysoft Technologies China Inc. <http://www.sheneninfo.com>
 * @license http://www.cntysoft.com/license/new-bsd     New BSD License
*/
namespace App\ZhuChao\Product;
use Cntysoft\Kernel\App\AbstractLib;
use App\ZhuChao\Product\Model\Product as ProductModel;
use App\ZhuChao\Product\Model\ProductDetail as DetailModel;
use App\ZhuChao\Product\Model\Product2Group as PGModel;
use Cntysoft\Kernel;
use App\ZhuChao\CategoryMgr\Constant as CATEGORY_CONST;
use Cntysoft\Framework\Core\FileRef\Manager as RefManager;

class ProductMgr extends AbstractLib
{
   /**
    * 获取指定筛选条件的产品列表
    * 
    * @param array $cond
    * @param boolean $total
    * @param string $orderBy
    * @param integer $offset
    * @param integer $limit
    */
   public function getProductList(array $cond = array(), $total = false, $orderBy = 'id DESC', $offset = 0, $limit = \Cntysoft\STD_PAGE_SIZE)
   {
      $query = array(
         'order' => $orderBy,
         'limit' => array(
            'offset' => $offset,
            'number' => $limit
         )
      );
      
      if(!empty($cond)){
         $query += $cond;
      }
      
      $items = ProductModel::find($query);
      
      if($total){
         return array($items, ProductModel::count($cond));
      }
      
      return $items;
   }
   
   /**
    * 添加一个产品
    * 
    * @param integer $providerId
    * @param integer $companyId
    * @param array $params
    * @return boolean
    */
   public function addProduct($providerId, $companyId, array $params)
   {
      $product = new ProductModel();
      $detail = new DetailModel();
      $dfields = $detail->getRequireFields(array('id'));
      foreach(array('imgRefMap', 'fileRefs') as $val){
         array_push($dfields, $val);	
      }
      $this->checkRequireFields($params, $dfields);
      $pfields = $product->getRequireFields(array('id', 'providerId', 'companyId', 'number', 'hits', 'defaultImage', 'star', 'grade', 'searchAttrMap', 'indexGenerated', 'inputTime', 'updateTime', 'detailId'));
      foreach(array('price') as $val){
         array_push($pfields, $val);	
      }
      $this->checkRequireFields($params, $pfields);
      $ddata = $this->filterData($params, $dfields);
      $pdata = $this->filterData($params, $pfields);

      $db = Kernel\get_db_adapter();
      try{
         $db->begin();
         if(!empty($ddata['fileRefs'])){
            $fileRefs = is_array($ddata['fileRefs']) ? $ddata['fileRefs'] : array($ddata['fileRefs']);
            $refManager = new RefManager();
            foreach($fileRefs as $ref){
               $refManager->confirmFileRef($ref);
            }
         }

         $detail->assignBySetter($ddata);
         $detail->create();
         
         $pdata['providerId'] = $providerId;
         $pdata['companyId'] = $companyId;
         $pdata['number'] = $this->getProductNumber($params['categoryId']);
         $pdata['hits'] = 0;
         $pdata['defaultImage'] = $ddata['images'][0][0];
         $pdata['star'] = 5;
         $pdata['grade'] = 1;
         $pdata['searchAttrMap'] = '';
         $pdata['indexGenerated'] = 0;
         $pdata['inputTime'] = time();
         $pdata['updateTime'] = 0;
         $pdata['detailId'] = $detail->getId();
         
         $product->assignBySetter($pdata);
         
         if(isset($params['group']) && !empty($params['group'])){
            $group = $params['group'];
            if(!is_array($group)){
               $group = array($group);
            }
            $productId = $product->getId();
            foreach($group as $one){
               $join = new PGModel();
               $join->setProductId($productId);
               $join->setGroupId($one);
               $join->create();
               unset($join);
            }
         }
         $product->create();
         return $db->commit();
      } catch (Exception $ex) {
         $db->rollback();
         
         Kernel\throw_exception($ex, $this->getErrorTypeContext());
      }
   }
   
   /**
    * 
    * @param integer $productId
    * @param array $params
    * @return type修改一个产品的信息
    * 
    * @param integer $productId
    * @param array $params
    */
   public function updateProduct($productId, array $params)
   {
      $product = $this->getProductById($productId);
      $detail = $product->getDetail();
      $dfields = $detail->getRequireFields(array('id'));
      foreach(array('imgRefMap', 'fileRefs') as $val){
         array_push($dfields, $val);	
      }
      $pfields = $product->getRequireFields(array('id', 'providerId', 'categoryId', 'companyId', 'number', 'hits', 'defaultImage', 'star', 'grade', 'searchAttrMap', 'indexGenerated', 'inputTime', 'updateTime', 'detailId'));
      foreach(array('price') as $val){
         array_push($pfields, $val);	
      }
      $ddata = $this->filterData($params, $dfields);
      $pdata = $this->filterData($params, $pfields);
      
      $db = Kernel\get_db_adapter();
      try{
         $db->begin();
         if(!empty($ddata['fileRefs'])){
            $oldRefs = $detail->getFileRefs();
            $nowRefs = is_array($ddata['fileRefs']) ? $ddata['fileRefs'] : array($ddata['fileRefs']);
            $deleteRefs = array_diff($oldRefs, $nowRefs);
            $newRefs = array_diff($nowRefs, $oldRefs);
            $refManager = new RefManager();
            foreach($deleteRefs as $ref){
               $refManager->removeFileRef($ref);
            }
            foreach($newRefs as $ref){
               $refManager->confirmFileRef($ref);
            }
         }
         
         $detail->assignBySetter($ddata);
         $detail->update();
         $product->assignBySetter($pdata);
         $product->update();
         
         if(isset($params['group']) && !empty($params['group'])){
            $group = $params['group'];
            if(!is_array($group)){
               $group = array($group);
            }
            
            foreach($group as $one){
               $join = new PGModel();
               $join->setProductId($productId);
               $join->setGroupId($one);
               $join->create();
               unset($join);
            }
         }
         return $db->commit();
      } catch (Exception $ex) {
         $db->rollback();
         
         Kernel\throw_exception($ex, $this->getErrorTypeContext());
      }
      
   }
   
   /**
    * 获取指定id的产品信息
    * 
    * @param integer $productId
    */
   public function getProductById($productId)
   {
      return ProductModel::findFirst($productId);
   }
   
   /**
    * 获得产品的编号
    * 
    * @param integer $categoryId
    * @param string $prefix
    * @return string
    */
   public function getProductNumber($categoryId = 0, $prefix = 'CNC1')
   {
      $number = $prefix;
      $len = strlen($categoryId);
      for($i = $len; $i < 3; $i++){
         $number.='0';
      }
      $number .= $categoryId;
      $number.=time();
      
      for ($i = 0; $i < 3; $i++) {
         $number .= rand(0, 9);
      }
      if($this->checkNumberExist($number)){
         return $this->getProductNumber($categoryId, $prefix);
      }else{
         return $number;
      }
   }
   
   /**
    * 获取数据中需要字段的数据
    * 
    * @param array $data
    * @param array $fields
    * @return array
    */
   public function filterData(array $data, array $fields)
   {
      $ret = array();
      foreach($data as $key => $val){
         if(in_array($key, $fields)){
            $ret[$key] = $val;
         }
      }
      
      return $ret;
   }
   
   /**
    * 检查产品编号是否已经存在
    * 
    * @param type $number
    * @return type
    */
   public function checkNumberExist($number)
   {
      return ProductModel::count(array(
         'number=?0',
         'bind' => array(
            0 => $number
         )
      )) > 0 ? true : false;
   }
   
   /** 
    * @return \App\ZhuChao\CategoryMgr\Mgr
    */
   public function getGoodsCategoryAppObject()
   {
      return $this->getAppCaller()->getAppObject(
         CATEGORY_CONST::MODULE_NAME, 
         CATEGORY_CONST::APP_NAME, 
         CATEGORY_CONST::APP_API_MGR
      );
   }
}