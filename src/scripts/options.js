var BSBOptions = function(){
    var that = this,
        config = {},
        nodes = {},
        components = {},
        list = [];

    var init = function(){
        chrome.extension.sendMessage({'type' : 'getConfig'}, function(response){
            config = cm.merge(config, response);
            render();
        });
    };

    var render = function(){
        // Structure
        document.body.appendChild(nodes['container'] = cm.Node('div'));
        // Tabs
        new Com.Tabset({
                'container' : nodes['container'],
                'toggleOnHashChange' : false
            }).addTab({
                'id' : 'bf3',
                'title' : 'Battlefield 3',
                'onShow' : renderTab
            }).addTab({
                'id' : 'bf4',
                'title' : 'Battlefield 4',
                'onShow' : renderTab
            }).addTab({
                'id' : 'bfh',
                'title' : 'Battlefield Hardline',
                'onShow' : renderTab
            }).addTab({
                'id' : 'cte_bf4',
                'title' : 'Battlefield 4 CTE',
                'onShow' : renderTab
            }).addTab({
                'id' : 'cte_bfh',
                'title' : 'Battlefield Hardline CTE',
                'onShow' : renderTab
            }).set('bf3');
    };

    var renderTab = function(tabset, tab){
        chrome.extension.sendMessage({'type' : 'getList'}, function(response){
            list = [];
            cm.forEach(response, function(item, sid){
                if(item['game'] == tab['id']){
                    item['id'] = sid;
                    if(cm.isEmpty(item['name']) && cm.isEmpty(item['comment'])){
                        item['name'] = item['id'];
                        item['comment'] = ['<i>', config['langs']['listEmptyName'], '</i>'].join('');
                    }
                    if(!cm.isEmpty(item['url'])){
                        item['url'] = ['http://battlelog.battlefield.com', item['game'], 'servers/show/pc', item['id'], item['url'], ''].join('/');
                    }else{
                        item['url'] = ['http://battlelog.battlefield.com', item['game'], 'servers/show/pc', item['id'], ''].join('/');
                    }
                    list.push(item);
                }
            });
            renderGridlist(tab['content']);
        });
    };

    var renderGridlist = function(container){
        new Com.Gridlist({
            'container' : container,
            'data' : list,
            'sort' : 'date',
            'order' : 'DESC',
            'paginator' : false,
            'langs' : {
                'counter' : config['langs']['counter']
            },
            'cols' : [
                {'key' : 'name', 'type' : 'url', 'linkKey' : 'url', 'width' : '30%', 'title' : config['langs']['serverName'], 'titleTag' : true},
                {'key' : 'comment', 'type' : 'text', 'width' : 'auto', 'title' : config['langs']['comment'], 'titleTag' : true},
                {'key' : 'date', 'type' : 'date', 'width' : 140, 'title' : config['langs']['addedDate']},
                {'type' : 'icon', 'iconClass' : 'remove', 'width' : 16, 'sort' : false, 'title' : config['langs']['remove'], 'onClick' : remove}
            ]
        });
    };

    var remove = function(item){
        chrome.extension.sendMessage({'type' : 'unban', 'sid' : item['id']}, function(response){
            location.reload(true);
        });
    };

    /* Main */

    init();
};

/* ******* INIT ******* */

cm.onload(function(){
    new BSBOptions();
});