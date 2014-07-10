var BSBPopup = function(){
    var that = this,
        config = {},
        nodes = {},
        donateButton =  '<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">' +
                            '<input type="hidden" name="cmd" value="_s-xclick">' +
                            '<input type="hidden" name="hosted_button_id" value="TV3A8KB5ZYPFC">' +
                            '<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">' +
                            '<img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">' +
                        '</form>';

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
                    ),
					cm.Node('li', {'innerHTML' : donateButton})
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