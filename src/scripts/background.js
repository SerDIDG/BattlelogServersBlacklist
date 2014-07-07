/*

 Local Storage "list" structure:
 {'sid' : {'bsbid' : 0, 'name' : 'text', 'url' : 'text', 'game' : 'bf3', 'comment' : 'text', 'date' : '%Y-%m-%d %H:%i'}}

 */

var BSB = function(){
    var langs = {
        'enabled' : 'Battlelog Servers Blacklist are enabled!',
        'disabled' : 'Battlelog Servers Blacklist are disabled!',
        'ban' : 'Block',
        'unban' : 'Blocked',
        'banned' : 'Server in blacklist',
        'added' : 'Server added to blacklist',
        'removed' : 'Server removed from blacklist',
        'addComment' : 'State a reason',
        'save' : 'Save',
        'cancel' : 'Cancel',
        'enabledButton' : 'Enabled',
        'bannedList' : 'Open servers blacklist',
        'addedDate' : 'Date added:',
        'serverName' : 'Server name:',
        'comment' : 'Comment:',
        'game' : 'Game:',
        'counter' : 'Total: ',
        'remove' : 'Remove',
        'edit' : 'Edit',
        'yourComment' : 'Your comment:',
        'globalComments' : 'Global comments:',
        'emptyComment' : 'Comment not given.',
        'addWindowTitle' : 'Add to blacklist',
        'listEmptyName' : 'Hello Oldfag! Server name doesn\'t exists, because you was started using this plugin when trees was bigger and grass was greener.',
        'visitTitle' : 'Screensider.com',
        'visitDescr' : 'Games Screenshoting Community. Votes, discussions, ratings and much more in one place.',
        'dialog' : {
            'closeTitle' : 'Close',
            'close' : ''
        }
    };

    /* ******* LINC SCRIPTS ******* */

    var init = function(){
        // Add chrome extention events
        chrome.extension.onMessage.addListener(onRequest);
        // Sync database
        sync();
    };

    var onRequest = function(message, sender, sendResponse){
        if(message['async']){
            messages[message['type']](message, sender.tab, sendResponse);
            return true;
        }else{
            sendResponse && sendResponse(messages[message['type']](message, sender.tab));
        }
    };

    /* ******* BACKGROUND ******* */

    var convertDatabase = function(){
        var version = cm.storageGet('version');
        // Convert for version < 0.4 || Convert DB, added info cells
        if(!version || version < 0.4){
            (function(){
                var list = cm.storageGet('list') && cm.storageGet('list').split(',') || [];
                cm.storageRemove('list');
                cm.forEach(list, function(item){
                    ban(item, {});
                });
            })();
        }
        // Convert for version < 0.5.3 || Convert last added broken server id
        if(!version || version < '0.5.3'){
            (function(){
                var server = read('pc'), url;
                if(server){
                    url = server['url'].split('/');
                    server['url'] = url[1];
                    unban('pc');
                    ban(url[0], server);
                }
            })();
        }
        // Convert for version < 0.6 || Added sync with artlark.ru
        if(!version || version < '0.6'){
            (function(){
                var list = getList();
                cm.forEach(list, function(item, sid){
                    unban(sid);
                    ban(sid, item);
                });
            })();
        }
        // Set new version
        cm.storageSet('version', getDetails('version'));
    };

    var sync = function(){
        var list = getList(), data = {}, serverData;

        cm.forEach(list, function(item, sid){
            if(!item['bsbid']){
                data[sid] = item;
            }
        });

        if(cm.getLength(data) > 0){
            cm.ajax({
                'type' : 'text',
                'params' : cm.obj2URI({'data' : JSON.stringify(data)}),
                'url' : 'http://bsb.artlark.ru',
                'handler' : function(o){
                    serverData = JSON.parse(o);
                    if(serverData && !serverData['error']){
                        cm.forEach(serverData, function(bsbid, sid){
                            list[sid]['bsbid'] = bsbid[0];
                        });
                        setList(list);
                    }
                }
            });
        }
    };

    /* ******* PRIVATE SERVER API ******* */

    var getConfig = function(){
        return {
            'status' : cm.storageGet('status'),
            'version' : getDetails('version'),
            'commentLength' : 200,
            'langs' : langs
        };
    };

    var getDetails = function(key){
        var details = chrome.app.getDetails();
        return key && details[key] || details;
    };

    var getList = function(){
        return cm.storageGet('list') && JSON.parse(cm.storageGet('list')) || {};
    };

    var setList = function(list){
        list && cm.storageSet('list', JSON.stringify(list));
    };

    var read = function(sid){
        return getList()[sid] || false;
    };

    var readGlobal = function(sid, handler){
        cm.ajax({
            'type' : 'text',
            'method' : 'GET',
            'params' : cm.obj2URI({'sid' : sid}),
            'url' : 'http://bsb.artlark.ru?',
            'handler' : handler || function(){}
        });
    };

    var ban = function(sid, o){
        var list = getList();
        o = cm.merge({
            'bsbid' : 0,
            'name' : '',
            'url' : '',
            'game' : 'bf3',
            'comment' : '',
            'date' : cm.dateFormat(new Date(), '%Y-%m-%d %H:%i:%s')
        }, o);
        delete o['id'];
        list[sid] = o;
        setList(list);
        return true;
    };

    var unban = function(sid){
        var list = getList();
        if(list[sid]){
            delete list[sid];
            setList(list);
        }
        return true;
    };

    var addComment = function(sid, o){
        var list = getList();
        if(list[sid]){
            list[sid] = cm.merge(list[sid], o);
            setList(list);
        }
        return true;
    };

    var updateToolbarState = function(tab, type){
        var status;
        // Update state
        if(type && type == 'init'){
            status = cm.storageGet('status') || 'on';
            cm.storageSet('status', status);
        }else{
            status = cm.storageGet('status') == 'off' ? 'on' : 'off';
            cm.storageSet('status', status);
        }
        // Set state
        if(status == 'off'){
            chrome.pageAction.setIcon({
                'tabId' : tab.id,
                'path' : 'images/logo-inactive.png'
            });
            chrome.pageAction.setTitle({
                'tabId' : tab.id,
                'title' : langs['disabled']
            });
        }else{
            chrome.pageAction.setIcon({
                'tabId' : tab.id,
                'path' : 'images/logo.png'
            });
            chrome.pageAction.setTitle({
                'tabId' : tab.id,
                'title' : langs['enabled']
            });
        }
    };

    /* ******* PUBLIC API ******* */

    var messages = {
        'init' : function(message, tab){
            convertDatabase();
            sync();
            updateToolbarState(tab, 'init');
            chrome.pageAction.show(tab.id);
            return getConfig();
        },
        'getList' : function(message, tab){
            return getList();
        },
        'setList' : function(message, tab){
            setList(message['list']);
            return true;
        },
        'getConfig' : function(message, tab){
            return getConfig();
        },
        'toggleStatus' : function(message, tab){
            updateToolbarState(message['tab'] || tab);
            return true;
        },
        'read' : function(message, tab){
            return read(message['sid']);
        },
        'readGlobal' : function(message, tab, handler){
            readGlobal(message['sid'], handler);
            return true;
        },
        'isBan' : function(message, tab){
            return getList()[message['sid']] ? true : false;
        },
        'ban' : function(message, tab){
            return ban(message['sid'], message['serverO']);
        },
        'unban' : function(message, tab){
            return unban(message['sid']);
        },
        'addComment' : function(message, tab){
            return addComment(message['sid'], message['serverO']);
        }
    };

    /* ******* MAIN ******* */

    init();
};

/* ******* INIT ******* */

new BSB();