function YAFS(containerId)
{
    //var global = this;
    var container = document.getElementById(containerId);
    var scrollBar = getChildByProperty(container, 'className', 'yafs-scrollbar');
    var handle = getChildByProperty(scrollBar, 'className', 'yafs-handle');
    var content = getChildByProperty(container, 'className', 'yafs-content');
    var containerHeight = container.offsetHeight;
    var handleHeight = handle.offsetHeight;
    var scrollBarHeight = scrollBar.offsetHeight - handleHeight;
    var contentHeight = content.offsetHeight - containerHeight;
    var mouseCoord;
    var oldMouseCoord;
    var _evtsAdded = {};
    var iTicket;

    var hostMethodRegExp = new RegExp('^function|object$', 'i');

    handle.style.top = '0px';
    content.style.top = '0px';

    makeUnselectable(handle);
    addEvent('mousedown', handle, startScrolling);
    addEvent('mouseup', document, stopScrolling);

    function isHostMethod(object, method)
    {
        var t = typeof object[method];
        return !!((hostMethodRegExp.test(t) && object[method]) || t == 'unknown');
    }

    function isHostObjectProperty(object, property)
    {
        var t = typeof object[property];
        return !!(hostMethodRegExp.test(t) && object[property]);
    }

    function startScrolling(evt)
    {
        mouseCoord = oldMouseCoord = watchMouse(evt);
        iTicket = window.setInterval(computeScroll, 20);
        addEvent('mousemove', document, watchMouse);
        return false;
    }

    function watchMouse(evt)
    {
        mouseCoord = evt.pageY || evt.clientY +
                document.body.scrollTop +
                document.documentElement.scrollTop;
    }

    function computeScroll(evt)
    {
        var hTop = window.parseInt(handle.style.top, 10);
        hTop += (mouseCoord - oldMouseCoord);
        oldMouseCoord = mouseCoord;
        if(hTop > 0 && hTop < scrollBarHeight)
        {
            handle.style.top = hTop + 'px';
            scrollContent(hTop);
        }
    }

    function stopScrolling()
    {
        window.clearInterval(iTicket);
        removeEvent('mousemove', document, watchMouse);
    }

    function scrollContent(hTop)
    {
        content.style.top = (-(contentHeight * getScrolledPercentage(hTop))) + 'px';
    }

    function getScrolledPercentage(hTop)
    {
        return hTop / scrollBarHeight;
    }

    function getMouseY(evt)
    {
        return evt.pageY || evt.clientY +
                document.body.scrollTop +
                document.documentElement.scrollTop;
    }

    /**
     * getChild searches for a childNode that matches the given property
     * @param HTMLElement parentNode
     * @param string propName The property that will be queried on the children nodes
     * @param string propValue The value that will have to match
     * @return HTMLElement|null the child element that matches the search
     */
    function getChildByProperty(parentNode, propName, propValue)
    {
        var children = parentNode.childNodes;
        var target = null;
        var propReg = new RegExp('(^|\\s+)'+propValue+'(\\s+|$)');

        for(var i = 0, len = children.length; i < len; ++i)
        {
            if(children[i].nodeType == 1 && propReg.test(children[i][propName]))
            {
                target = children[i];
                break;
            }
        }
        children = null;
        return target;
    }

    function addEvent(type, element, func, options)
    {
        options = options || {};
        var cbFun = function(evt)
        {
            if(!evt)
            {
                evt = window.event;
            }
            if(typeof evt.target == 'undefined' && typeof evt.srcElement != 'undefined')
            {
                evt.target = evt.srcElement;
            }
            if(options.stopPropagation === true)
            {
                evt.cancelBubble = true;
                if(typeof evt['stopPropagation'] != 'undefined')
                {
                    evt.stopPropagation();
                }
            }
            if(options.preventDefault === true)
            {
                evt.returnValue = false;
                if(dom.isHostMethod(evt, 'preventDefault'))
                {
                    evt.preventDefault();
                }
            }
            return func(evt);
        };
        if (typeof func == 'function')
        {
            if (typeof element['addEventListener'] != 'undefined')
            {
                element.addEventListener(type, cbFun, false);
            }
            else if (typeof element['attachEvent'] != 'undefined')
            {
                element.attachEvent('on'+type, cbFun);
            }
            else
            {
                element['on' + type] = cbFun;
            }

            if(!_evtsAdded[type])
            {
                _evtsAdded[type] = [];
            }
            _evtsAdded[type].push({'cbFun': cbFun, 'origFun': func});
        }
    }

    function removeEvent(type, element, func)
    {
        if (typeof func == 'function')
        {
            for(var i = 0, l = _evtsAdded[type].length; i < l; ++i)
            {
                if(func == _evtsAdded[type][i]['origFun'])
                {
                    func = _evtsAdded[type][i]['cbFun'];
                    _evtsAdded[type].splice(i,1);
                    break;
                }
            }
            if (typeof element['removeEventListener'] != 'undefined')
            {
                element.removeEventListener(type, func, false);
            }
            else if (typeof element['detachEvent'] != 'undefined')
            {
                element.detachEvent('on' + type, func);
            }
            else
            {
                element['on' + type] = null;
            }
        }
    }

    function isEventSupported(el, eventName)
    {
        var isBuggy = false;
        if (el && isHostMethod(el, 'setAttribute'))
        {
            el.setAttribute('a', 'b');
            isBuggy = (el.a == 'b');
            el = null;
            if (isBuggy)
            {
                return (isEventSupported = function(el, eventName)
                {
                    return typeof el[eventName] != 'undefined';
                })(el, eventName);
            }
            return (isEventSupported = function(el, eventName)
            {
                el.setAttribute(eventName, '');
                return typeof el[eventName] == 'function';
            })(el, eventName);
        }
        return null;
    }

    function makeUnselectable(el)
    {

        var selectProp, hasOnselectstart;

        if (el)
        {
            var s = el.style;
            if (s)
            {
                selectProp = typeof s.userSelect == 'string' ? 'userSelect'
                : typeof s.MozUserSelect == 'string' ? 'MozUserSelect'
                : typeof s.WebkitUserSelect == 'string' ? 'WebkitUserSelect'
                : typeof s.KhtmlUserSelect == 'string' ? 'KhtmlUserSelect'
                : '';
            }

            // found property, cleanup and return
            if (selectProp)
            {
                return (makeUnselectable = function(el)
                {
                    if (el.style)
                    {
                      el.style[selectProp] = 'none';
                    }
                })(el);
            }

            // property wasn't found, check `onselectstart` event support
            hasOnselectstart = isEventSupported(el, 'onselectstart');

            // event seems to be supported, cleanup and return
            if (hasOnselectstart)
            {
                return (makeUnselectable = function(el)
                {
                    el.onselectstart = fnFalse;
                })(el);
            }
        }
        return null;
    }

    function fnFalse()
    {
        return false;
    }

    return {
        'getScrolledPercentage': getScrolledPercentage,
        'scrollContent': scrollContent
    };
}