Com['Tooltip'] = function(o){
    var that = this, config = cm.merge({
            'target' : cm.Node('div'),
            'className' : '',
            'top' : 0,     // targetHeight
            'left' : 0,
            'events' : {}
        }, o),
        API = {
            'onShow' : [],
            'onHide' : []
        },
        checkInt,
        anim,
        isHide = true,
        nodes = {};

    var init = function(){
        // Convert events to API Events
        convertEvents(config['events']);
        // Render structure
        render();
        setMiscEvents();
    };

    var render = function(){
        // Structure
        nodes['container'] = cm.Node('div', {'class' : 'cm-tooltip'},
            cm.Node('div', {'class' : 'inner'},
            /*
                cm.Node('div', {'class' : 'title'},
                    cm.Node('h3')
                ),
            */
            nodes['content'] = cm.Node('div', {'class' : 'scroll'}))
        );
        // Add css class
        !cm.isEmpty(config['className']) && cm.addClass(nodes['container'], config['className']);
    };

    var setMiscEvents = function(){
        // Init animation
        anim = new cm.Animation(nodes['container']);
        // Add on mouse over event on target node
        cm.addEvent(config['target'], 'mouseover', show);
    };

    var show = function(){
        if(isHide){
            isHide = false;
            // Append child tooltip into body and set position
            document.body.appendChild(nodes['container']);
            getPosition();
            // Show tooltip
            nodes['container'].style.display = 'block';
            // Check position
            checkInt = setInterval(getPosition, 5);
            // Animate
            anim.go({'style' : {'opacity' : 1}, 'duration' : 100});
            // Add mouseout event
            cm.addEvent(document, 'mouseover', bodyEvent);
            /* *** EXECUTE API EVENTS *** */
            executeEvent('onShow');
        }
    };

    var hide = function(noDelay){
        if(!isHide){
            isHide = true;
            // Remove event - Check position
            checkInt && clearInterval(checkInt);
            // Remove mouseout event
            cm.removeEvent(document, 'mouseover', bodyEvent);
            // Animate
            anim.go({'style' : {'opacity' : 0}, 'duration' : noDelay ? 0 : 100, 'onStop' : function(){
                nodes['container'].style.display = 'none';
                cm.remove(nodes['container']);
                /* *** EXECUTE API EVENTS *** */
                executeEvent('onHide');
            }});
        }
    };

    var getPosition = function(){
        var top = cm.getRealY(config['target']),
            topAdd = eval(config['top'].toString().replace('targetHeight', config['target'].offsetHeight)),
            left = cm.getRealX(config['target']),
            leftAdd = eval(config['left'].toString().replace('targetWidth', config['target'].offsetHeight)),
            height = nodes['container'].offsetHeight,
            width = nodes['container'].offsetWidth,
            pageSize = cm.getPageSize(),
            positionTop = (top + topAdd + height > pageSize['winHeight'] ? (top - topAdd - height + config['target'].offsetHeight) : top + topAdd),
            positionLeft = (left + leftAdd + width > pageSize['winWidth'] ? (left - leftAdd - width + config['target'].offsetWidth) : left + leftAdd);

        if(positionTop != nodes['container'].offsetTop || positionLeft != nodes['container'].offsetLeft){
            nodes['container'].style.top = [positionTop, 'px'].join('');
            nodes['container'].style.left = [positionLeft, 'px'].join('');
        }
    };

    var bodyEvent = function(e){
        e = cm.getEvent(e);
        var target = cm.getEventTarget(e);
        if(!cm.isParent(nodes['container'], target, true) && !cm.isParent(config['target'], target)){
            hide();
        }
    };

    var executeEvent = function(event){
        var handler = function(){
            cm.forEach(API[event], function(item){
                item(that, nodes['content']);
            });
        };

        switch(event){
            default:
                handler();
                break;
        }
    };

    var convertEvents = function(o){
        cm.forEach(o, function(item, key){
            if(API[key] && typeof item == 'function'){
                API[key].push(item);
            }
        });
    };

    /* Main */

    that.show = function(){
        show();
        return that;
    };

    that.hide = function(noDelay){
        hide(noDelay);
        return that;
    };

    that.addEvent = function(event, handler){
        if(API[event] && typeof handler == 'function'){
            API[event].push(handler);
        }
        return that;
    };

    that.removeEvent = function(event, handler){
        if(API[event] && typeof handler == 'function'){
            API[event] = API[event].filter(function(item){
                return item != handler;
            });
        }
        return that;
    };

    init();
};