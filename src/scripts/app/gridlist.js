Com['Gridlist'] = function(o){
    var that = this, config = _.merge({
            'container' : cm.Node('div'),
            'countPerPage' : 0,
            'data' : [],
            'cols' : [],
            'sort' : false,
            'itemSort' : true,
            'order' : 'ASC',
            'displayCounter' : true,
            'paginator' : true,
            'messages' : {
                'counter' : 'Total: '
            }
        }, o),
        nodes = {},
        com = {},
        isCheckedAll = false,
        sortBy,
        orderBy;

    var render = function(){
        // Clear
        cm.clearNode(config['container']);
        // Container
        config['container'].appendChild(
            nodes['container'] = cm.Node('div', {'class' : 'gridlist-container'})
        );
        // Counter
        if(config['displayCounter']){
            nodes['container'].appendChild(
                cm.Node('div', {'class' : 'gridlist-counter'}, config['messages']['counter'] + config['data'].length)
            );
        }
        // Sorting
        config['sort'] && arraySort(config['sort']);
        renderTable(1, nodes['container']);
    };

    var arraySort = function(key){
        var item, t1, t2, value, textA, textB;

        sortBy = key;
        orderBy = !orderBy ? config['order'] : (orderBy == 'ASC' ? 'DESC' : 'ASC');
        // Get item
        cm.forEach(config['cols'], function(col){
            if(col['key'] == key){
                item = col;
            }
        });
        // Sort
        if(config['data'].sort){
            config['data'].sort(function(a, b){
                textA = a[key];
                textB = b[key];
                switch(item['type']){
                    case 'date':
                        t1 = cm.convertDate(textA);
                        t2 = cm.convertDate(textB);
                        return (orderBy == 'ASC') ? (t1 - t2) : (t2 - t1);
                        break;

                    case 'number':
                        value = textA - textB;
                        return (orderBy == 'ASC') ? value : (-1 * value);
                        break;

                    case 'url':
                    case 'text':
                        t1 = textA ? textA.toLowerCase() : '';
                        t2 = textB ? textB.toLowerCase() : '';
                        value = (t1 < t2) ? -1 : ((t1 > t2) ? 1 : 0);
                        return (orderBy == 'ASC') ? value : (-1 * value);
                        break;
                }
            });
        }
    };

    var renderTable = function(page, container){
        var start, end;
        if(!config['paginator']){
            cm.remove(nodes['table']);
        }
        // Render Table
        nodes['table'] = cm.Node('div', {'class' : 'gridlist'},
            cm.Node('table', cm.Node('thead', {'class' : 'unselect'},
                nodes['title'] = cm.Node('tr')),
                nodes['content'] = cm.Node('tbody')
            )
        );
        // Render Title
        cm.forEach(config['cols'], function(col, i){
            renderTh(i, col);
        });
        // Render Items
        if(config['paginator']){
            end = config['countPerPage'] * page;
            start = end - config['countPerPage'];
        }else{
            end = config['data'].length;
            start = 0;
        }
        for(var i = start, l = Math.min(end, config['data'].length); i < l; i++){
            renderItem(i, config['data'][i]);
        }
        // Embed
        container.appendChild(nodes['table']);
    };

    var renderTh = function(i, item){
        var myNodes = {};
        item = config['cols'][i] = cm.merge({
            'key' : '',
            'title' : '',
            'type' : 'text',		// text | check | number | url | date | icon
            'linkKey' : false,
            'iconClass' : '',		// only for type=icon
            'sort' : config['itemSort'],
            'width' : 'auto',
            'onClick' : function(){
            },
            'access' : true,
            'titleTag' : false
        }, item);
        // Check access
        if(item['access']){
            // Structure
            nodes['title'].appendChild(
                myNodes['th'] = cm.Node('th', {'width' : item['width']},
                    myNodes['inner'] = cm.Node('div', {'class' : 'inner'})
                )
            );
            // Insert title or checkbox
            switch(item['type']){
                case 'check':
                    myNodes['inner'].appendChild(
                        myNodes['check'] = cm.Node('input', {'type' : 'checkbox'})
                    );
                    myNodes['check'].onmousedown = function(){
                        if(isCheckedAll == true){
                            that.uncheckAll();
                        }else{
                            that.checkAll();
                        }
                    };
                    break;

                case 'icon':
                    break;

                default:
                    myNodes['inner'].appendChild(cm.Node('span', item['title']));
                    // Render sort arrow and set function on click to th
                    if(item['sort']){
                        cm.addClass(myNodes['th'], 'sort');
                        if(item['key'] == sortBy){
                            myNodes['inner'].appendChild(
                                cm.Node('div', {'class' : ['icon', 'arrow', orderBy.toLowerCase()].join(' ')})
                            );
                        }
                        myNodes['inner'].onclick = function(){
                            arraySort(item['key']);
                            if(config['paginator']){
                                //com['paginator']._set();
                            }else{
                                renderTable(1, nodes['container']);
                            }
                        };
                    }
                    break;
            }
        }
    };

    var renderItem = function(i, item){
        item = cm.merge({
            '_status' : 'normal'			// normal | selected | ok
        }, item);

        var tr,
            className = item['_status'];
        // Structure
        nodes['content'].appendChild(
            tr = cm.Node('tr', {'class' : className})
        );
        // Items rows
        cm.forEach(config['cols'], function(col, i){
            // Check access
            if(col['access']){
                var td,
                    div,
                    text = typeof item[col['key']] == 'undefined' ? '' : item[col['key']];
                // Structure
                tr.appendChild(
                    td = cm.Node('td', div = cm.Node('div', {'class' : 'inner'}))
                );
                // Insert value
                switch(col['type']){
                    case 'text':
                        div.innerHTML = text;
                        if(col['titleTag']){
                            div.title = cm.cutHTML(text);
                        }
                        break;

                    case 'number':
                        div.innerHTML = _.splitNumber(text);
                        break;

                    case 'icon':
                        cm.remove(div);
                        cm.addClass(td, 'align-center control');
                        div = td.appendChild(
                            cm.Node('div', {'class' : 'icon ' + col['iconClass'], 'title' : col['title']})
                        );
                        break;

                    case 'date':
                        div.innerHTML = text;
                        break;

                    case 'url':
                        text = _.decode(text);
                        div.appendChild(
                            cm.Node('a', {'target' : '_blank', 'href' : (col['linkKey'] && item[col['linkKey']] ? item[col['linkKey']] : text)}, text)
                        );
                        if(col['titleTag']){
                            div.title = text;
                        }
                        break;
                }
                // On click handler
                div.onclick = function(){
                    col['onClick'](item, i);
                };
            }
        });
    };

    /* ******* MAIN ******* */

    render();

    that._construct = function(){
        return that;
    };

    that._destruct = function(){
        return that;
    };

    that.uncheckAll = function(){
        isCheckedAll = false;
        return that;
    };

    that.checkAll = function(){
        isCheckedAll = true;
        return that;
    };
};