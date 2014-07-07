var BSBPopup = function(){
    var that = this, config = {}, nodes = {};

    var init = function(){
        chrome.extension.sendMessage({'type' : 'getConfig'}, function(response){
            config = cm.merge(config, response);
            render();
        });
    };

    var render = function(){
        var url;
        // Structure
        document.body.appendChild(
            cm.Node('div', {'class' : 'bsb-popup'},
                cm.Node('ul',
                    cm.Node('li',
                        cm.Node('div', {'class' : 'check-line'},
                            nodes['statusCheck'] = cm.Node('input', {'type' : 'checkbox', 'id' : 'bsb-popup-status'}),
                            cm.Node('label', {'for' : 'bsb-popup-status'}, config['langs']['enabledButton'])
                        )
                    ),
                    cm.Node('li',
                        nodes['listButton'] = cm.Node('input', {'type' : 'button', 'class' : 'button', 'value' : config['langs']['bannedList']})
                    ),
                    cm.Node('li',
                        cm.Node('dl',
                            cm.Node('dt',
                                cm.Node('a', {'href' : 'http://screensider.com', 'target' : '_blank'}, config['langs']['visitTitle'])
                            ),
                            cm.Node('dd', config['langs']['visitDescr'])
                        )
                    )
                )
            )
        );
        // Status Checkbox
        nodes['statusCheck'].checked = config['status'] == 'on';
        nodes['statusCheck'].onclick = function(){
            chrome.tabs.getSelected(null, function(tab){
                chrome.extension.sendMessage({'type' : 'toggleStatus', 'tab' : tab});
            });
        };
        // List Button
        nodes['listButton'].onclick = function(){
            url = chrome.extension.getURL('options.html');

            chrome.tabs.query({'url' : url}, function(tabs){
                if(tabs.length){
                    chrome.tabs.update(tabs[0].id, {'active' : true});
                }else{
                    chrome.tabs.create({'url' : url});
                }
            });
        };
    };

    init();
};

/* ******* INIT ******* */

cm.onload(function(){
    new BSBPopup();
});