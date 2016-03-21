<?php
return array(
   'id'          => '企业标准内容模型',
   'category'    => '内容数据源',
   'class'       => 'CompanyStdContentModelDs',
   'namespace'   => 'ContentModel',
   'description' => '系统标准内容模型数据源标签， 支持所有内容模型数据的获取',
   'attributes'  => array(
      'itemId' => array(
         'dataType'    => \Cntysoft\INTEGER,
         'name'        => '信息的ID',
         'require'     => false,
         'description' => '指定数据源要查询的信息ID',
      )
   )
);
