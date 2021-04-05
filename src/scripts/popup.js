var BSBPopup = function(){
    var that = this,
        config = {},
        nodes = {},
        donateButton = 
			'<form action="https://www.paypal.com/donate" method="post" target="_blank">' +
				'<input type="hidden" name="hosted_button_id" value="UU47AA7WGTZ2A" />' +
				'<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />' +
				'<img alt="" border="0" src="https://www.paypal.com/en_UA/i/scr/pixel.gif" width="1" height="1" />' +
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
                            cm.Node('label', {'for' : 'bsb-popup-status'}, config.messages['enabledButton'])
                        )
                    ),
                    cm.Node('li',
                        nodes['listButton'] = cm.Node('input', {'type' : 'button', 'class' : 'button', 'value' : config.messages['bannedList']})
                    ),
                    cm.Node('li',
                        cm.Node('dl',
                            cm.Node('dt',
                                cm.Node('a', {'href' : 'https://screensider.com', 'target' : '_blank'}, config.messages['visitTitle'])
                            ),
                            cm.Node('dd', config.messages['visitDescr'])
                        )
                    ),
					cm.Node('li', {'innerHTML' : donateButton})
                )
            )
        );
        // Status Checkbox
        nodes['statusCheck'].checked = config['status'] === 'on';
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