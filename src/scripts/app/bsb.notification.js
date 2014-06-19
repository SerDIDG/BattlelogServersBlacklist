Com['BSBNotification'] = function(o){
    var config = cm.merge({
            'container' : cm.Node('div'),
            'game' : 'bf3',
            'message' : ''
        }, o),
        nodes = {},
        anim,
        inter;

    var init = function(){
        render();
        snow();
    };

    var render = function(){
        // Structure
        config['container'].appendChild(
            nodes['container'] = cm.Node('li', {'class' : 'receipt checkbox', 'style' : 'opacity: 0; top: -32px;'},
                cm.Node('span', config['message'])
            )
        );
        // Init Anim
        anim = new cm.Animation(nodes['container']);
        cm.addEvent(nodes['container'], 'click', hide);
        inter = setTimeout(hide, 5000);
    };

    var snow = function(){
        anim.go({'style' : {'opacity' : 1, 'top' : '0px'}, 'duration' : 500, 'anim' : 'smooth'});
    };

    var hide = function(){
        anim.go({'style' : {'opacity' : 0, 'top' : '-32px'}, 'duration' : 500, 'anim' : 'smooth', 'onStop' : function(){
            cm.remove(nodes['container']);
        }});
    };

    init();
};