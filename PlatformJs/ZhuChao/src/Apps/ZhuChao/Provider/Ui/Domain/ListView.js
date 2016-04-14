/*
 * Cntysoft Cloud Software Team
 *
 * @author Chanwang <chenyongwang1104@163.com>
 * @copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * @license    http://www.cntysoft.com/license/new-bsd     New BSD License
 */
/**
 * 供应商列表
 */
Ext.define('App.ZhuChao.Provider.Ui.Domain.ListView', {
    extend : 'Ext.grid.Panel',
    requires : [
        'App.ZhuChao.Provider.Const'
    ],
    mixins : {
        langTextProvider : 'WebOs.Mixin.RunableLangTextProvider'
    },
    /**
     * {@link WebOs.Mixin.RunableLangTextProvider#property-runableLangKey}
     *
     * @property {String} runableLangKey
     */
    runableLangKey : 'App.ZhuChao.Provider',
    /**
     * @inheritdoc
     */
    panelType : 'ListView',
    currentPhone : null,
    /**
     * @property Ext.menu.Menu
     */
    contextMenuRef : null,
    statics : {
        A_CODES : {
            MODIFY : 1
        }
    },
    /**
     * 构造函数
     * 
     * @param {Object} config
     */
    constructor : function (config)
    {
        config = config || {};
        this.LANG_TEXT = this.GET_LANG_TEXT('DOMAIN.LIST_VIEW');
        this.applyConstraintConfig(config);
        this.callParent([config]);
    },
    applyConstraintConfig : function (config)
    {
        Ext.apply(config, {
            border : true,
            autoScroll : true,
            title : this.LANG_TEXT.TITLE,
            emptyText : this.LANG_TEXT.EMPTY_TEXT
        });
    },
    initComponent : function ()
    {
        var COLS = this.LANG_TEXT.COLS;
        var store = this.createDataStore();
        Ext.apply(this, {
            columns : [
                {text : COLS.ID, dataIndex : 'id', width : 80, resizable : false, menuDisabled : true},
                {text : COLS.NAME, dataIndex : 'name', flex : 1, resizable : false, sortable : false, menuDisabled : true},
                {text : COLS.SITENAME, dataIndex : 'siteName', width : 400, resizable : false, sortable : false, menuDisabled : true},
                {text : COLS.DOMAIN, dataIndex : 'domain', width : 300, resizable : false, sortable : false, menuDisabled : true},
                {text : COLS.STATUS, dataIndex : 'status', width : 140, resizable : false, sortable : false, menuDisabled : true, renderer : Ext.bind(this.statusRenderer, this)}
            ],
            store : store,
            bbar : Ext.create('Ext.PagingToolbar', {
                store : store,
                displayInfo : true,
                emptyMsg : Cntysoft.GET_LANG_TEXT('MSG.EMPTY_TEXT'),
                height : 50
            }),
            tbar : this.getTbarConfig()
        });
        this.addListener({
            afterrender : this.viewAfterrenderHandler,
            itemcontextmenu : this.itemRightClickHandler,
            itemdblclick : this.itemDbClickHandler,
            scope : this
        });
        this.callParent();
    },
    getTbarConfig : function ()
    {
        var L = this.LANG_TEXT.TBAR;
        return [{
                xtype : 'tbfill'
            }, {
                xtype : 'textfield',
                width : 400,
                name : 'phone',
                regex : /1[3,5,7,8][0-9]{9}/,
                regexText : L.ERROR_TEXT,
                emptyText : L.TIP
            }, {
                xtype : 'button',
                text : L.QUERY,
                listeners : {
                    click : this.tbarQueryButtonClickHandler,
                    scope : this
                }
            }];
    },
    itemDbClickHandler : function (view, record)
    {
        this.mainPanelRef.renderPanel('Editor', {
            mode : WebOs.Kernel.Const.MODIFY_MODE, /*修改模式*/
            targetLoadId : record.get('id')
        });
    },
    createDataStore : function ()
    {
        return new Ext.data.Store({
            autoLoad : false,
            fields : [
                {name : 'id', type : 'integer', persist : false},
                {name : 'name', type : 'string', persist : false},
                {name : 'phone', type : 'string', persist : false},
                {name : 'registerTime', type : 'string', persist : false},
                {name : 'lastLoginTime', type : 'string', persist : false},
                {name : 'status', type : 'integer', persist : false}
            ],
            proxy : {
                type : 'apigateway',
                callType : 'App',
                invokeMetaInfo : {
                    module : 'ZhuChao',
                    name : 'Provider',
                    method : 'DomainMgr/getProviderShopList'
                },
                reader : {
                    type : 'json',
                    rootProperty : 'items',
                    totalProperty : 'total'
                }
            },
            listeners : {
                beforeload : function (store, operation){
                    if(!operation.getParams()){
                        operation.setParams({
                            phone : this.currentPhone
                        });
                    }
                },
                scope : this
            }
        });
    },
    /**
     * 查询的条件键值对
     *
     * @property {Object} cond
     */
    loadUsers : function (cond)
    {
        if(this.currentPhone !== cond){
            var store = this.getStore();
            store.load({
                params : {
                    phone : cond
                }
            });
            this.currentPhone = cond;
        }
    },
    /**
     * 重新加载用户
     */
    reloadUsers : function ()
    {
        var store = this.getStore();
        Cntysoft.Utils.Common.reloadGridPage(store, {
            phone : this.currentPhone
        });
    },
    getContextMenu : function (record)
    {
        var CODE = this.self.A_CODES;
        var L = this.LANG_TEXT.MENU;
        var C = App.ZhuChao.Provider.Const;
        if(null == this.contextMenuRef){
            var items = [{
                    text : L.MODIFY,
                    code : CODE.MODIFY
                }];
            
            this.contextMenuRef = new Ext.menu.Menu({
                ignoreParentClicks : true,
                items : items,
                listeners : {
                    click : this.menuItemClickHandler,
                    scope : this
                }
            });
        }

        this.contextMenuRef.record = record;
        return this.contextMenuRef;
    },
    menuItemClickHandler : function (menu, item)
    {
        if(item){
            var C = this.self.A_CODES;
            var code = item.code;
            var CONST = App.ZhuChao.Provider.Const;
            switch (code) {
                case C.MODIFY:
                    this.mainPanelRef.renderPanel('Editor', {
                        mode : WebOs.Kernel.Const.MODIFY_MODE,
                        targetLoadId : menu.record.get('id')
                    });
                    break;
            }
        }
    },
    itemRightClickHandler : function (grid, record, htmlItem, index, event)
    {
        var menu = this.getContextMenu(record);
        var pos = event.getXY();
        event.stopEvent();
        menu.showAt(pos[0], pos[1]);
    },
    tbarQueryButtonClickHandler : function (btn)
    {
        var condRef = btn.previousSibling('textfield');
        if(condRef.isValid()) {
            this.loadUsers(condRef.getValue());
        }
    },
    viewAfterrenderHandler : function ()
    {
        this.loadUsers();
    },
    statusRenderer : function (value)
    {
        var U_TEXT = this.LANG_TEXT.STATUS;
        var C = App.ZhuChao.Provider.Const;
        switch (value) {
            case C.PROVIDER_STATUS_NORMAL:
                return '<span style = "color:green">' + U_TEXT.NORMAL + '</span>';
            case C.PROVIDER_STATUS_LOCK:
                return '<span style = "color:red">' + U_TEXT.LOCK + '</span>';
        }
    },
    destroy : function ()
    {
        if(this.contextMenuRef){
            this.contextMenuRef.destroy();
        }
        delete this.contextMenuRef;
        this.callParent();
    }
});
