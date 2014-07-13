var Tpl = {};

cm.define('Tpl.Init', {
    'modules' : [
        'DataNodes'
    ],
    'params' : {

    }
},
function(params){
    var that = this;

    that.nodes = {
        'Template' : {
            'contentInner' : cm.Node('div')
        }
    };

    var init = function(){
        that.setParams(params);
        that.getDataNodes(document.body, that.params['nodesDataMarker'], false);
        render();
    };

    var render = function(){
    };

    /* ******* MAIN ******* */

    init();
});