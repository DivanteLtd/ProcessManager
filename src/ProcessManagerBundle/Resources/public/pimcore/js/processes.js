/**
 * Process Manager.
 *
 * LICENSE
 *
 * This source file is subject to the GNU General Public License version 3 (GPLv3)
 * For the full copyright and license information, please view the LICENSE.md and gpl-3.0.txt
 * files that are distributed with this source code.
 *
 * @copyright  Copyright (c) 2015-2020 Dominik Pfaffenbauer (https://www.pfaffenbauer.at)
 * @license    https://github.com/dpfaffenbauer/ProcessManager/blob/master/gpl-3.0.txt GNU General Public License version 3 (GPLv3)
 */

pimcore.registerNS('pimcore.plugin.processmanager.processes');

pimcore.plugin.processmanager.processes = Class.create({
    storeId : 'processmanager_processes',
    task : null,

    url : {
        list : '/admin/process_manager/processes/list'
    },

    initialize: function () {
        this.createStore();
    },

    reloadProcesses: function() {
        pimcore.globalmanager.get(this.storeId).load(function () {
            this.createInterval();
        }.bind(this));
    },

    createInterval : function() {
        this.task = setTimeout(function () {
            this.reloadProcesses();
        }.bind(this), 5000);
    },

    stop : function() {
        clearTimeout(this.task);
    },

    createStore : function () {
        var proxy = new Ext.data.HttpProxy({
            url : this.url.list
        });

        var reader = new Ext.data.JsonReader({}, [
            { name:'id' },
            { name:'name' },
            { name:'message' },
            { name:'progress' },
            { name:'total' },
            { name:'started' },
            { name:'completed' },
            { name:'artifact' }
        ]);

        var store = new Ext.data.Store({
            restful:    false,
            proxy:      proxy,
            reader:     reader,
            autoload:   true
        });

        pimcore.globalmanager.add(this.storeId, store);
        this.reloadProcesses();
    },

    activate: function () {
        var tabPanel = Ext.getCmp('pimcore_panel_tabs');
        tabPanel.setActiveItem(this.layoutId);
    },

    showReportWindow: function(data) {
        var raportWin = new Ext.Window({
            title: data.report.title,
            modal: true,
            iconCls: "pimcore_icon_reports",
            width: 700,
            height: 400,
            html: data.report,
            autoScroll: true,
            bodyStyle: "padding: 10px; background:#fff;",
            buttonAlign: "center",
            shadow: false,
            closable: true
        });
        raportWin.show();
    },

    showErrorWindow: function(message) {
        var errWin = new Ext.Window({
            title: "ERROR",
            modal: true,
            iconCls: "pimcore_icon_error",
            width: 600,
            height: 300,
            html: message,
            autoScroll: true,
            bodyStyle: "padding: 10px; background:#fff;",
            buttonAlign: "center",
            shadow: false,
            closable: true
        });
        errWin.show();
    },

    getGrid: function () {
        return {
            xtype: 'grid',
            store: pimcore.globalmanager.get(this.storeId),
            columns: [
                {
                    text: t('id'),
                    dataIndex: 'id',
                    width: 100
                },
                {
                    text: t('name'),
                    dataIndex: 'name',
                    width: 300
                },
                {
                    text: t('processmanager_message'),
                    dataIndex: 'message',
                    flex : 1
                },
                {
                    text: t('processmanager_started'),
                    dataIndex: 'started',
                    renderer: function (value) {
                        if (value == 0) {
                            return null;
                        } else {
                            return Ext.Date.format(Ext.Date.parse(value, "U"), "Y-m-d H:i:s");
                        }
                    },
                    width: 180
                },
                {
                    text: t('processmanager_completed'),
                    dataIndex: 'completed',
                    renderer: function (value) {
                        if (value == 0) {
                            return null;
                        } else {
                            return Ext.Date.format(Ext.Date.parse(value, "U"), "Y-m-d H:i:s");
                        }
                    },
                    width: 180
                },
                {
                    text     : t('processmanager_progress'),
                    xtype    : 'widgetcolumn',
                    width    : 120,
                    dataIndex: 'percentage',
                    widget: {
                        xtype: 'progressbarwidget',
                        textTpl: [
                            '{percent:number("0")}% ' + t('processmanager_text')
                        ]
                    }
                },
                {
                    text : t('processmanager_report'),
                    xtype:'actioncolumn',
                    width:50,
                    items: [
                        {
                            iconCls : 'pimcore_icon_reports',
                            tooltip: t('processmanager_report'),
                            handler: function(grid, rowIndex) {
                                var rec = grid.getStore().getAt(rowIndex);

                                Ext.Ajax.request({
                                    url: '/admin/process_manager/processes/log-report',
                                    params : {
                                        id : rec.get("id")
                                    },
                                    success: function (response, options) {
                                        var data = Ext.decode(response.responseText);
                                        if (data.success) {
                                            this.showReportWindow(data);
                                        } else {
                                            this.showErrorWindow(data.message);
                                        }
                                    }.bind(this)
                                });

                            }.bind(this)
                        }
                    ]
                },
                {
                    text : t('processmanager_log_download'),
                    xtype:'actioncolumn',
                    width:50,
                    items: [
                        {
                            iconCls : 'pimcore_icon_download',
                            tooltip: t('processmanager_log_download'),
                            handler: function(grid, rowIndex) {
                                var id = grid.getStore().getAt(rowIndex).get('id');
                                pimcore.helpers.download("/admin/process_manager/processes/log-download?id=" + id);
                            }.bind(this)
                        }
                    ]
                },
                {
                    text : t('processmanager_artifact_download'),
                    xtype:'actioncolumn',
                    width: 50,
                    renderer: function(value, metadata, record) {
                        var artifact = record.data.artifact;
                        if (!artifact) {
                            return;
                        }

                        var id = Ext.id();
                        Ext.defer(function () {
                            if (Ext.get(id)) {
                                new Ext.button.Button({
                                    renderTo: id,
                                    iconCls: 'pimcore_icon_download',
                                    cls: 'processmanager_artifact_download',
                                    handler: function () {
                                        pimcore.helpers.download("/admin/asset/download?id=" + artifact)
                                    }
                                });
                            }
                        }, 50);

                        return Ext.String.format('<span id="{0}"></span>', id);
                    }
                },
                {
                    text : t('processmanager_status'),
                    width: 100,

                    renderer: function (value) {
                        if (value == 0) {
                            return null;
                        } else {
                            return Ext.Date.format(Ext.Date.parse(value, "U"), "Y-m-d H:i:s");
                        }
                    },

                    renderer: function(value, metadata, record) {
                        var stoppable = record.data.stoppable;
                        var running = record.data.running;
                        var processId = record.data.id;

                        if (stoppable && !running) {
                            return 'STOPPED';
                        }

                        var id = Ext.id();
                        Ext.defer(function () {
                            if (Ext.get(id) && stoppable && running) {
                                new Ext.button.Button({
                                    renderTo: id,
                                    iconCls: 'pimcore_icon_stop',
                                    handler: function () {
                                        Ext.Ajax.request({
                                            url: '/admin/process_manager/processes/stop?id=' + processId,
                                            method: 'GET',
                                            success: function () {
                                                Ext.Msg.alert(t('success'), t('processmanager_process_stopped'));
                                            }.bind(this)
                                        });
                                    }
                                });
                            }
                        }, 50);

                        return Ext.String.format('<span id="{0}"></span>', id);
                    }
                },
                {
                    xtype:'actioncolumn',
                    width:50,
                    items: [
                        {
                            iconCls : 'pimcore_icon_delete',
                            tooltip: t('delete'),
                            handler: function(grid, rowIndex) {
                                var rec = grid.getStore().getAt(rowIndex);

                                Ext.Ajax.request({
                                    url: '/admin/process_manager/processes/delete',
                                    jsonData : {
                                        id : rec.get("id")
                                    },
                                    method: 'delete',
                                    success: function () {
                                        //We don't reload the store here, this triggers a new timer, we just delete the
                                        //record manually from the store
                                        pimcore.globalmanager.get(this.storeId).remove(rec);
                                    }.bind(this)
                                });
                            }.bind(this)
                        }
                    ]
                },
            ],
            useArrows: true,
            autoScroll: true,
            animate: true,
            containerScroll: true,
            viewConfig: {
                loadMask: false
            }
        };
    }
});
