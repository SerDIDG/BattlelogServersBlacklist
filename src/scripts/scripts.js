var BattlelogServersBlacklist = function(o){
    var that = this, config = cm.merge({
            'status' : 'on',
            'version' : 0,
            'commentLength' : 200,
            'langs' : {}
        }, o),
        buttons = {},
        intervals = {};

    var init = function(){
        var href = window.location.href;
        chrome.extension.sendMessage({'type' : 'init'}, function(response){
            config = cm.merge(config, response);
            // Check config interval
            intervals['config'] = setInterval(function(){
                chrome.extension.sendMessage({'type' : 'getConfig'}, function(response){
                    config = cm.merge(config, response);
                });
            }, 50);
            // Init Helpers
            if(/battlefield.com\/(bf3|bf4|bfh)/g.test(href) || /battlelog.com\/(bf4|bfh)/g.test(href)){
                // Battlefield 3
                if(/battlefield.com\/bf3/g.test(href)){
                    DefaultServerBar({
                        'button' : {
                            'classes' : {
                                'button' : 'bf3',
                                'dialog' : 'bf3'
                            }
                        }
                    });
                    BF3ServersList();
                    BF3ServerPage();
                }
                // Battlefield 4
                if(/battlefield.com\/bf4/g.test(href)){
                    DefaultServerBar();
                    DefaultServerList({'game' : 'bf4'});
                    DefaultServerPage({'game' : 'bf4'});
                }
                // Battlefield Hardline
                if(/battlefield.com\/bfh/g.test(href)){
                    DefaultServerBar();
                    DefaultServerList({'game' : 'bfh'});
                    DefaultServerPage({'game' : 'bfh'});
                }
                // CTE: Battlefield 4
                if(/battlelog.com\/bf4/g.test(href)){
                    DefaultServerBar();
                    DefaultServerList({'game' : 'cte_bf4'});
                    DefaultServerPage({'game' : 'cte_bf4'});
                }
                // CTE: Battlefield Hardline
                if(/battlelog.com\/bfh/g.test(href)){
                    DefaultServerBar();
                    DefaultServerList({'game' : 'cte_bfh'});
                    DefaultServerPage({'game' : 'cte_bfh'});
                }
            }
        });
    };

    /* ******* HANDLERS ******* */

    var DefaultServerBar = function(o){
        var myConfig = cm.merge({
                'button' : {}
            }, o),
            myNodes = {},
            urlMatch,
            game;
        // Init BSB Button
        if(buttons['serverBar']){
            buttons['serverBar'].remove();
        }
        buttons['serverBar'] = new Com.BSBButton({'bsb' : config});
        // Set check interval for button existing and renewal button's config
        intervals['serverBar'] = setInterval(function(){
            if(config['status'] == 'on'){
                if(!buttons['serverBar'].inDOM()){
                    myNodes['bar'] = cm.getEl('ugm-playing-meta-data');
                    myNodes['url'] = myNodes['bar'] ? myNodes['bar'].querySelector('a') : null;
                    if(myNodes['bar'] && myNodes['url']){
                        urlMatch = myNodes['url'].getAttribute('href');
                        game = urlMatch.match(/^\/([0-9a-zA-Z\-]+)\//)[1];
                        // Insert container before server stuff
                        buttons['serverBar'].remove();
                        cm.replaceClass(myNodes['bar'], 'span7 span6', 'span5');
                        myNodes['container'] = cm.insertBefore(cm.Node('div', {'class' : ['bsb-server-bar', game, 'span1'].join(' ')}), myNodes['bar']);
                        // Insert BSB Button
                        buttons['serverBar'].setConfig(cm.merge(myConfig['button'], {
                            'container' : myNodes['container'],
                            'notificationContainer' : cm.getEl('receipt-container'),
                            'server' : {
                                'id' : urlMatch.match(/\/show\/(pc||PC)\/([0-9a-zA-Z\-]+)\//)[2],
                                'url' : urlMatch.match(/\/show\/(pc||PC)\/([0-9a-zA-Z\-]+)\/(.*)\//)[3],
                                'name' : myNodes['url'].innerHTML,
                                'game' : game
                            },
                            'bsb' : config,
                            'onRemove' : function(){
                                cm.replaceClass(myNodes['bar'], 'span6', 'span7');
                                cm.remove(myNodes['container']);
                            }
                        })).append();
                    }
                }else{
                    buttons['serverBar'].setConfig({'bsb' : config});
                }
            }else{
                buttons['serverBar'].remove();
            }
        }, 50);
    };

    var DefaultServerList = function(o){
        var myConfig = cm.merge({
            'game' : 'bf4'
        }, o);
        if(/\/(servers|serverbrowserwarsaw)\/(?!show)/g.test(window.location.href)){
            var myNodes = {}, urlMatch;
            // Init BSB Button
            if(buttons['serversList']){
                buttons['serversList'].remove();
            }
            buttons['serversList'] = new Com.BSBButton({'bsb' : config});
            // Set check interval for button existing and renewal button's config
            intervals['serversList'] = setInterval(function(){
                if(config['status'] == 'on'){
                    if(!buttons['serversList'].inDOM()){
                        myNodes['rightColumn'] = cm.getEl('serverbrowser-show');
                        if(myNodes['rightColumn']){
                            myNodes['buttons'] = myNodes['rightColumn'].querySelector('.action-buttons-container');
                            urlMatch = myNodes['rightColumn'].querySelector('footer a').getAttribute('href');
                            // Insert container before favourite button
                            buttons['serversList'].remove();
                            myNodes['buttons'].appendChild(myNodes['container'] = cm.Node('div', {'class' : ['bsb-servers-list', myConfig['game']].join(' ')}));
                            // Insert BSB Button
                            buttons['serversList'].setConfig({
                                'container' : myNodes['container'],
                                'notificationContainer' : cm.getEl('receipt-container'),
                                'server' : {
                                    'id' : urlMatch.match(/\/show\/(pc||PC)\/([0-9a-zA-Z\-]+)\//)[2],
                                    'url' : urlMatch.match(/\/show\/(pc||PC)\/([0-9a-zA-Z\-]+)\/(.*)\//)[3],
                                    'name' : document.body.querySelector('#serverbrowser-results .server-row.active .server-name').innerHTML.replace(/[\n\r]*/gi, ''),
                                    'game' : myConfig['game']
                                },
                                'bsb' : config,
                                'onRemove' : function(){
                                    cm.remove(myNodes['container']);
                                }
                            }).append();
                        }
                    }else{
                        buttons['serversList'].setConfig({'bsb' : config});
                    }
                }else{
                    buttons['serversList'].remove();
                }
            }, 50);
        }
    };

    var DefaultServerPage = function(o){
        var myConfig = cm.merge({
            'game' : 'bf4'
        }, o);

        if(/\/(servers|serverbrowserwarsaw)\/show\/(pc||PC)\//g.test(window.location.href)){
            var myNodes = {}, sid = window.location.href.match(/\/show\/(pc||PC)\/([0-9a-zA-Z\-]+)\//)[2],
                urlMatch = window.location.href.match(/\/show\/(pc||PC)\/([0-9a-zA-Z\-]+)\/(.*)\//),
                url = urlMatch && urlMatch[3] ? urlMatch[3] : '';
            // Init BSB Button
            if(buttons['serverPage']){
                buttons['serverPage'].remove();
            }
            buttons['serverPage'] = new Com.BSBButton({'bsb' : config});
            // Set check interval for button existing and renewal button's config
            intervals['serverPage'] = setInterval(function(){
                if(config['status'] == 'on'){
                    if(!buttons['serverPage'].inDOM()){
                        myNodes['page'] = cm.getEl('server-page');
                        if(myNodes['page']){
                            myNodes['buttons'] = myNodes['page'].querySelector('header .server-buttons');
                            // Insert container before favourite button
                            buttons['serverPage'].remove();
                            myNodes['buttons'].appendChild(myNodes['container'] = cm.Node('div', {'class' : ['bsb-server-page', myConfig['game']].join(' ')}));
                            // Insert BSB Button
                            buttons['serverPage'].setConfig({
                                'container' : myNodes['container'],
                                'notificationContainer' : cm.getEl('receipt-container'),
                                'server' : {
                                    'id' : sid,
                                    'url' : url,
                                    'name' : document.querySelector('header .server-title h1').innerHTML,
                                    'game' : myConfig['game']
                                },
                                'bsb' : config,
                                'onRemove' : function(){
                                    cm.remove(myNodes['container']);
                                }
                            }).append();
                        }
                    }else{
                        buttons['serverPage'].setConfig({'bsb' : config});
                    }
                }else{
                    buttons['serverPage'].remove();
                }
            }, 50);
        }
    };

    var BF3ServersList = function(){
        if(/\/servers\/(?!show)/g.test(window.location.href)){
            var myNodes = {},
                urlMatch;
            // Init BSB Button
            if(buttons['serversList']){
                buttons['serversList'].remove();
            }
            buttons['serversList'] = new Com.BSBButton({'bsb' : config});
            // Set check interval for button existing and renewal button's config
            intervals['serversList'] = setInterval(function(){
                if(config['status'] == 'on'){
                    if(!buttons['serversList'].inDOM()){
                        myNodes['rightColumn'] = cm.getEl('serverguide-show-column');
                        if(myNodes['rightColumn']){
                            myNodes['favourite'] = myNodes['rightColumn'].querySelector('.serverguide-add-favorite');
                            urlMatch = myNodes['rightColumn'].querySelector('input.serverguide-server-link-field').value;
                            // Insert container before favourite button
                            buttons['serversList'].remove();
                            myNodes['container'] = cm.insertBefore(cm.Node('div', {'class' : 'bsb-servers-list bf3'}), myNodes['favourite']);
                            // Insert BSB Button
                            buttons['serversList'].setConfig({
                                'container' : myNodes['container'],
                                'notificationContainer' : cm.getEl('receipt-container'),
                                'classes' : {
                                    'button' : 'bf3',
                                    'dialog' : 'bf3'
                                },
                                'server' : {
                                    'id' : urlMatch.match(/\/servers\/show\/(pc||PC)\/([0-9a-zA-Z\-]+)\//)[2],
                                    'url' : urlMatch.match(/\/servers\/show\/(pc||PC)\/([0-9a-zA-Z\-]+)\/(.*)\//)[3],
                                    'name' : myNodes['rightColumn'].querySelector('h1#selected-server-name a').innerHTML,
                                    'game' : 'bf3'
                                },
                                'bsb' : config,
                                'onRemove' : function(){
                                    cm.remove(myNodes['container']);
                                }
                            }).append();
                        }
                    }else{
                        buttons['serversList'].setConfig({'bsb' : config});
                    }
                }else{
                    buttons['serversList'].remove();
                }
            }, 50);
        }
    };

    var BF3ServerPage = function(){
        if(/\/servers\/show\/(pc||PC)\//g.test(window.location.href)){
            var myNodes = {},
                sid = window.location.href.match(/\/servers\/show\/(pc||PC)\/([0-9a-zA-Z\-]+)\//)[2],
                urlMatch = window.location.href.match(/\/servers\/show\/(pc||PC)\/([0-9a-zA-Z\-]+)\/(.*)\//),
                url = urlMatch && urlMatch[3] ? urlMatch[3] : '';
            // Init BSB Button
            if(buttons['serverPage']){
                buttons['serverPage'].remove();
            }
            buttons['serverPage'] = new Com.BSBButton({'bsb' : config});
            // Set check interval for button existing and renewal button's config
            intervals['serverPage'] = setInterval(function(){
                if(config['status'] == 'on'){
                    if(!buttons['serverPage'].inDOM()){
                        myNodes['favourite'] = cm.getEl('serverguide-page-favourite');
                        if(myNodes['favourite']){
                            // Insert container before favourite button
                            buttons['serverPage'].remove();
                            myNodes['container'] = cm.insertBefore(cm.Node('div', {'class' : 'bsb-server-page bf3'}), myNodes['favourite']);
                            // Insert BSB Button
                            buttons['serverPage'].setConfig({
                                'container' : myNodes['container'],
                                'notificationContainer' : cm.getEl('receipt-container'),
                                'classes' : {
                                    'button' : 'bf3',
                                    'dialog' : 'bf3'
                                },
                                'server' : {
                                    'id' : sid,
                                    'url' : url,
                                    'name' : document.querySelector('#server-header h1').innerHTML,
                                    'game' : 'bf3'
                                },
                                'bsb' : config,
                                'onRemove' : function(){
                                    cm.remove(myNodes['container']);
                                }
                            }).append();
                        }
                    }else{
                        buttons['serverPage'].setConfig({'bsb' : config});
                    }
                }else{
                    buttons['serverPage'].remove();
                }
            }, 50);
        }
    };

    /* Main */

    that.toggle = function(){
        that.destruct();
        // Reinit
        init();
        return that;
    };

    that.destruct = function(){
        cm.forEach(intervals, function(item){
            item && clearInterval(item);
        });
        // Destruct buttons
        cm.forEach(buttons, function(item){
            item && item.remove();
            item = null;
        });
        return that;
    };

    init();
};

var BattlelogServersBlacklistHelper = function(){
    var url, bsb, isRunning;

    var init = function(){
        // Global plugin works
        chrome.extension.sendMessage({'type' : 'init'}, function(response){
            if(!isRunning){
                isRunning = true;
                bsb = new BattlelogServersBlacklist(response);
                // URL Checker
                setInterval(function(){
                    if(url != window.location.href){
                        url = window.location.href;
                        bsb.toggle();
                    }
                }, 50);
            }
        });
    };

    /* Main */

    init();
};

/* ******* INIT ******* */

new BattlelogServersBlacklistHelper();


