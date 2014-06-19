Com['BSBButton'] = function(o){
    var that = this, config = cm.merge({
            'container' : cm.Node('div'),
            'notificationContainer' : cm.Node('div'),
            'classes' : {
                'button' : 'btn btn-small bsb-default',
                'dialog' : 'bsb-default'
            },
            'server' : {},
            'bsb' : {},
            'updateLocal' : 500,
            'updateGlobal' : 5000,
            'onRemove' : function(){
            }
        }, o),
        nodes = {},
        intervals = {},
        list = [],
        userComment,
        components = {};

    var init = function(){
        // Render structure and add events
        render();
        setMiscEvents();
        updateStatus();
    };

    var render = function(){
        // Structure
        nodes['container'] = cm.Node('div', {'class' : 'bsb-button'},
            cm.Node('div', {'class' : 'counter'},
                cm.Node('div', {'class' : 'icon bsb-block'}),
                nodes['counter'] = cm.Node('div', {'class' : 'text'})
            ),
            nodes['title'] = cm.Node('div', {'class' : 'title'})
        );
    };

    var setMiscEvents = function(){
        // Button click event
        cm.addEvent(nodes['container'], 'click', buttonClick);
        // Tooltip
        components['tooltip'] = new Com.Tooltip({
                'target' : nodes['container'],
                'className' : 'bsb-tooltip',
                'top' : 'targetHeight'
            })
            .addEvent('onShow', renderComments);
    };

    var initCheckers = function(){
        intervals['status'] = setInterval(checkStatus, config['updateLocal']);
        intervals['global'] = setInterval(checkGlobal, config['updateGlobal']);
        checkStatus();
        checkGlobal();
    };

    var checkStatus = function(){
        if(config['server']['id']){
            chrome.extension.sendMessage({'type' : 'read', 'sid' : config['server']['id']}, function(o){
                userComment = o;
                updateStatus();
            });
        }
    };

    var checkGlobal = function(){
        if(config['server']['id']){
            chrome.extension.sendMessage({'type' : 'readGlobal', 'async' : true, 'sid' : config['server']['id']}, function(o){
                list = JSON.parse(o) || [];
                updateStatus();
            });
        }
    };

    var updateStatus = function(){
        var status = list.length;
        if(!userComment){
            cm.removeClass(nodes['container'], 'bsb-active');
            nodes['title'].innerHTML = config['bsb']['langs']['ban'];
        }else{
            cm.addClass(nodes['container'], 'bsb-active');
            nodes['title'].innerHTML = config['bsb']['langs']['unban'];
        }
        nodes['counter'].innerHTML = status;
    };

    var renderComments = function(tooltip, container){
        var text;
        if(userComment || !cm.isEmpty(list)){
            cm.clearNode(container).appendChild(nodes['comments'] = cm.Node('ul', {'class' : 'bsb-comments-list'}));
            // User Comment
            if(userComment){
                nodes['comments'].appendChild(
                    cm.Node('li',
                        cm.Node('h3', config['bsb']['langs']['yourComment'])
                    )
                );
                nodes['comments'].appendChild(
                    cm.Node('li',
                        cm.Node('div', {'class' : 'date'}, cm.dateFormat(cm.parseDate(userComment['date']), '%j %F %Y in %H:%i')),
                        cm.Node('ul', {'class' : 'none has-icons-outside-one'},
                            cm.Node('li',
                                text = cm.Node('div', {'class' : 'text'}),
                                cm.Node('div', {'class' : 'form-icons-outside'},
                                    nodes['commentsEdit'] = cm.Node('div', {'class' : 'icon edit', 'title' : config['bsb']['langs']['edit']})
                                )
                            )
                        )
                    )
                );
                cm.addEvent(nodes['commentsEdit'], 'click', openDialog);
                if(!cm.isEmpty(userComment['comment'])){
                    text.innerHTML = userComment['comment'];
                }else{
                    text.innerHTML = config['bsb']['langs']['emptyComment'];
                    cm.addClass(text, 'empty');
                }
                // Separator
                if(!cm.isEmpty(list)){
                    nodes['comments'].appendChild(
                        cm.Node('li', {'class' : 'sep'})
                    );
                }
            }
            // Global Comments
            if(!cm.isEmpty(list)){
                nodes['comments'].appendChild(
                    cm.Node('li', cm.Node('h3', config['bsb']['langs']['globalComments']))
                );
                cm.forEach(list, renderComment);
            }
        }else{
            tooltip.hide();
        }
    };

    var renderComment = function(item){
        var text;
        nodes['comments'].appendChild(
            cm.Node('li',
                cm.Node('div', {'class' : 'date'}, cm.dateFormat(cm.parseDate(item['date']), '%j %F %Y in %H:%i')),
                text = cm.Node('div', {'class' : 'text'})
            )
        );
        if(!cm.isEmpty(item['comment'])){
            text.innerHTML = item['comment'];
        }else{
            text.innerHTML = config['bsb']['langs']['emptyComment'];
            cm.addClass(text, 'empty');
        }
    };

    var openDialog = function(){
        // Structure
        nodes['dialogContent'] = cm.Node('div', {'class' : 'form'},
            cm.Node('dl', {'class' : 'form-box'},
                cm.Node('dt', config['bsb']['langs']['comment']),
                cm.Node('dd',
                    nodes['dialogText'] = cm.Node('textarea', {'class' : 'textarea', 'maxlength' : config['bsb']['commentLength']}, userComment['comment'] || '')
                )
            ),
            cm.Node('div', {'class' : 'btn-wrap'},
                nodes['dialogSave'] = cm.Node('div', {'class' : 'btn btn-small btn-primary'}, config['bsb']['langs']['save']),
                nodes['dialogCancel'] = cm.Node('div', {'class' : 'btn btn-small'}, config['bsb']['langs']['cancel'])
            )
        );
        // Open Dialog
        components['dialog'] = new Com.Dialog({
            'title' : config['bsb']['langs']['addWindowTitle'],
            'content' : nodes['dialogContent'],
            'className' : config['classes']['dialog'],
            'langs' : config['bsb']['langs']['dialog'],
            'onOpenStart' : function(){
                components['tooltip'].hide();
                nodes['dialogText'].focus();
            }
        });
        // Add events
        cm.addEvent(nodes['dialogCancel'], 'click', components['dialog'].close);
        cm.addEvent(nodes['dialogSave'], 'click', ban);
    };

    var buttonClick = function(){
        if(!userComment){
            openDialog();
        }else{
            components['tooltip'].hide();
            unban();
        }
    };

    var ban = function(){
        config['server']['comment'] = nodes['dialogText'].value;
        chrome.extension.sendMessage({'type' : 'ban', 'sid' : config['server']['id'], 'serverO' : config['server']}, function(){
            components['dialog'].close();
            new Com.BSBNotification({
                'container' : config['notificationContainer'],
                'message' : config['bsb']['langs']['added']
            });
        });
    };

    var unban = function(){
        chrome.extension.sendMessage({'type' : 'unban', 'sid' : config['server']['id']}, function(){
            new Com.BSBNotification({
                'container' : config['notificationContainer'],
                'message' : config['bsb']['langs']['removed']
            });
        });
    };

    /* Main */

    that.setConfig = function(o){
        config = cm.merge(config, o);
        return that;
    };

    that.inDOM = function(){
        return cm.inDOM(nodes['container']);
    };

    that.append = function(){
        // Init update checkers
        initCheckers();
        cm.addClass(nodes['container'], config['classes']['button']);
        config['container'].appendChild(nodes['container']);
        return that;
    };

    that.remove = function(){
        cm.remove(nodes['container']);
        cm.forEach(intervals, function(item){
            item && clearInterval(item);
        });
        config['onRemove']();
        return that;
    };

    init();
};