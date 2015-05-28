cm.define('Tpl.Servers', {
    'modules' : [
        'Params',
        'DataNodes',
        'Langs'
    ],
    'params' : {
        'langs' : {
            'bf3' : 'Battlefield 3',
            'bf4' : 'Battlefield 4',
            'bfh' : 'Battlefield Hardline',
            'cte_bf4' : 'Battlefield 4 CTE',
            'cte_bfh' : 'Battlefield Hardline CTE',
            'bf5' : 'Battlefield 5'
        }
    }
},
function(params){
    var that = this;

    that.components = {};
    that.nodes = {
        'Template' : {
            'contentInner' : cm.Node('div'),
            'errorMessage' : cm.Node('div')
        }
    };

    that.bans = [];
    that.servers = [];
    that.serversO = {};
    that.data = {};
    that.isRenderTab = {};

    var init = function(){
        that.setParams(params);
        that.getDataNodes(document.body, that.params['nodesDataMarker'], false);
        that.components['overlay'] = new Com.Overlay({
            'node' : that.nodes['Template']['contentInner']
        });
        get();
    };

    var get = function(){
        cm.ajax({
            'type' : 'json',
            'method' : 'get',
            'params' : cm.obj2URI({'type' : 'bans', 'sid' : 'all'}),
            'url' : 'http://bsb.artlark.ru',
            'handler' : function(responce){
                if(responce){
                    that.bans = cm.isArray(responce)? responce : [];

                    cm.ajax({
                        'type' : 'json',
                        'method' : 'get',
                        'params' : cm.obj2URI({'type' : 'servers', 'sid' : 'all'}),
                        'url' : 'http://bsb.artlark.ru',
                        'handler' : function(responce){
                            if(responce){
                                that.servers = cm.isArray(responce)? responce : [];
                                prepare();
                                render();
                                that.components['overlay'].close();
                            }else{
                                processError();
                            }
                        }
                    });
                }else{
                    processError();
                }
            }
        });
    };

    var processError = function(){
        that.nodes['Template']['errorMessage'].style.display = 'block';
        that.components['overlay'].close();
    };

    var prepare = function(){
        var server;
        cm.forEach(that.servers, function(item){
            that.serversO[item['id']] = item;
        });
        cm.forEach(that.bans, function(item){
            server = that.serversO[item['sid']];

            item['name'] = server['name'];
            item['game'] = server['game'];

            if(cm.isEmpty(server['name'])){
                item['name'] = server['id'];
            }

            if(cm.isEmpty(item['comment'])){
                item['comment'] = ['<i>', ' --- ', that.lang('No comments left'), ' --- ', '</i>'].join('');
            }

            if(!cm.isEmpty(server['url'])){
                if(/^cte/.test(server['game'])){
                    item['url'] = ['http://cte.battlelog.com', server['game'].replace('cte_', ''), 'servers/show/pc', server['id'], server['url'], ''].join('/');
                }else{
                    item['url'] = ['http://battlelog.battlefield.com', server['game'], 'servers/show/pc', server['id'], server['url'], ''].join('/');
                }
            }else{
                if(/^cte/.test(server['game'])){
                    item['url'] = ['http://cte.battlelog.com', server['game'].replace('cte_', ''), 'servers/show/pc', server['id'], ''].join('/');
                }else{
                    item['url'] = ['http://battlelog.battlefield.com', server['game'], 'servers/show/pc', server['id'], ''].join('/');
                }
            }

            if(!that.data[item['game']]){
                that.data[item['game']] = [];
            }

            that.data[item['game']].push(item);
        });
    };

    var render = function(){
        that.components['tabset'] = new Com.Tabset({
            'container' : that.params['node'],
            'toggleOnHashChange' : false
        });

        cm.forEach(that.data, function(item, key){
            that.components['tabset'].addTab({
                'id' : key,
                'title' : that.lang(key),
                'onShow' : renderTab
            })
        });

        that.components['tabset'].set('bf3');
    };

    var renderTab = function(tabset, tab){
        if(!that.isRenderTab[tab['id']]){
            that.isRenderTab[tab['id']] = true;

            new Com.Gridlist({
                'container' : tab['content'],
                'className' : 'bottom',
                'data' : that.data[tab['id']],
                'cols' : [
                    {'key' : 'name', 'type' : 'url', 'urlKey' : 'url', 'width' : '30%', 'title' : that.lang('Server'), 'showTitle' : true, 'textOverflow' : true},
                    {'key' : 'comment', 'type' : 'text', 'width' : 'auto', 'title' : that.lang('Comment'), 'showTitle' : true, 'textOverflow' : true},
                    {'key' : 'date', 'type' : 'date', 'width' : 160, 'title' : that.lang('Date')}
                ],
                'sortBy' : 'date',
                'orderBy' : 'DESC',
                'perPage' : 20,
                'showCounter' : true,
                'visibleDateFormat' : '%j %F %Y at %H:%i',
                'langs' : {
                    'counter' : that.lang('Bans') + ': '
                }
            })
        }
    };

    /* ******* MAIN ******* */

    init();
});