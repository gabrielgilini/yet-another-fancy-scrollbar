var API, E;
if(API && API.attachDocumentReadyListener)
{
    API.attachDocumentReadyListener(
        function()
        {

            if(
                API && API.areFeatures('getElementSizeStyle', 'getElementSize') &&
                E && E().areFeatures('query', 'setStyle', 'attachDrag', 'position') &&
                Q && Q().areFeatures('first')
            )
            {
                API.ScrollBar = function(container, options)
                {
                    options = options || {};
                    if(!(container instanceof E))
                    {
                        container = E(container);
                    }
                    var sAPI = {};
                    var dragging = false;
                    var mWheelAttached = false;
                    var orientation = options.horizontal?1:0;
                    var content = typeof options.content == "undefined"
                        ? E(container.query('.yafs-content').first())
                        : (options.content instanceof E ? options.content : E(options.content));

                    if(!options.skipScrollBars)
                    {
                        var scrollBar = typeof options.scrollbar == "undefined"
                            ? E(container.query('.yafs-scrollbar').first())
                            : (options.scrollbar instanceof E ? options.scrollbar : E(options.scrollbar));
                        var handle = E(scrollBar.children(0));
                        var handleSize = API.getElementSize(handle.element());
                        var scrollBarSize = API.getElementSizeStyle(scrollBar.element());
                        var scrollableSize = scrollBarSize[orientation] - handleSize[orientation];
                        var scrollBarWrapper = typeof options.scrollbarwrapper == "undefined"
                            ? scrollBar
                            : (options.scrollbarwrapper instanceof E ? options.scrollbarwrapper : E(options.scrollbarwrapper));
                    }

                    var containerSize = API.getElementSizeStyle(container.element());
                    var contentSize = API.getElementSize(content.element());
                    var scrollableContentSize = [contentSize[4] - containerSize[0], contentSize[5] - containerSize[1]];

                    var currentPos = 0;

                    var wheelScrollPx = options.wheelScrollBy || 30;
                    var mWheelListener = function (e, delta)
                    {
                        API.cancelPropagation(e);
                        scrollBy(-delta * wheelScrollPx);
                    };

                    var resizeHandle;
                    if(E.prototype.size && handle && (typeof options.resizeHandle == 'undefined' || options.resizeHandle))
                    {
                        resizeHandle = function()
                        {
                            handleSize[orientation] = containerSize[orientation] / contentSize[orientation] * scrollBarSize[orientation];
                            if(handleSize[orientation] < 30)
                            {
                                handleSize[orientation] = 30;
                            }
                            handle.size(orientation?null:handleSize[0], orientation?handleSize[1]:null);

                            if(contentSize[orientation] <= containerSize[orientation] && scrollBar)
                            {
                                scrollBarWrapper.show(false, {'removeOnHide': options.removeOnHide});
                            }
                            else
                            {
                                scrollBarWrapper.show(true);
                            }
                            scrollableSize = scrollBarSize[orientation] - handleSize[orientation];
                        };
                    }


                    if(handle)
                    {
                         handle.attachDrag(null,
                            {
                                'ondrag': function(c)
                                {
                                    if(c[orientation] < 0)
                                    {
                                        c[orientation] = 0;
                                    }
                                    else if(c[orientation] > scrollableSize)
                                    {
                                        c[orientation] = scrollableSize
                                    }
                                    scrollContentTo((c[orientation] / scrollableSize) * scrollableContentSize[orientation]);
                                },
                                'ondragstart': function(){dragging = true;},
                                'ondrop': function(){dragging = false;},
                                axes: (orientation) ? 'horizontal' : 'vertical',
                                ghost: 1
                            }
                        );
                        updateScrollableSizes();
                    }

                    function updateScrollableSizes()
                    {
                        containerSize = API.getElementSizeStyle(container.element());
                        contentSize = API.getElementSize(content.element());
                        scrollableContentSize = [contentSize[4] - containerSize[0], contentSize[5] - containerSize[1]];

                        handleSize = API.getElementSize(handle.element());
                        scrollBarSize = API.getElementSizeStyle(scrollBar.element());
                        scrollableSize = scrollBarSize[orientation] - handleSize[orientation];

                        if(resizeHandle)
                        {
                            resizeHandle();
                        }
                        if(scrollableContentSize[orientation] < currentPos && scrollTo)
                        {
                            scrollTo(scrollableContentSize[orientation], false);
                        }

                        if(contentSize[orientation] <= containerSize[orientation] && scrollBar)
                        {
                            scrollBarWrapper.show(false, {'removeOnHide': options.removeOnHide});
                        }
                        else
                        {
                            scrollBarWrapper.show(true);
                        }

                        if(scrollableContentSize[orientation] > 0)
                        {
                            if(!mWheelAttached && options.mouseWheel && API.attachMousewheelListener)
                            {
                                API.attachMousewheelListener(container.element(), mWheelListener);
                                mWheelAttached = true;
                            }
                        }
                        else
                        {
                            if(mWheelAttached && options.mouseWheel && API.detachMousewheelListener)
                            {
                                API.detachMousewheelListener(container.element());
                                mWheelAttached = false;
                            }
                        }
                    }

                    var scrollTo, scrollBy, scrollContentTo, scrollHandleTo;
                    (function()
                    {
                        var getOpts = function(fx)
                        {
                            if(!dragging && fx)
                            {
                                return {duration: options.duration, ease: options.ease, fps: options.fps || 60};
                            }
                            return null;
                        };

                        var posFn = (options.horizontal
                            ? function(el, px, fx){el.position(null, px, getOpts(fx));}
                            : function(el, px, fx){el.position(px, null, getOpts(fx));}
                        );

                        scrollContentTo = function(px, effects)
                        {
                            if(px < 0 || scrollableContentSize[orientation] < 0)
                            {
                                px = 0;
                            }
                            else if(px > scrollableContentSize[orientation])
                            {
                                px = scrollableContentSize[orientation];
                            }
                            currentPos = px;
                            posFn(content, -px, effects);

                            Events.fire(Events.types.SCROLL, {currentContentPos: px, maxContentPos: scrollableContentSize[orientation]});

                            return px;
                        };

                        if(handle)
                        {
                            scrollHandleTo = function(px, effects)
                            {
                                if(px < 0 || scrollableSize <= 0)
                                {
                                    px = 0;
                                }
                                else if(px > scrollableSize)
                                {
                                    px = scrollableSize;
                                }
                                posFn(handle, px, effects);
                            };
                        }

                        scrollTo = function(px, effects)
                        {
                            px = scrollContentTo(px, effects);
                            if(scrollHandleTo)
                            {
                                if(scrollableContentSize[orientation] <= 0)
                                {
                                    scrollHandleTo(0, effects);
                                }
                                else
                                {
                                    scrollHandleTo((px / scrollableContentSize[orientation]) * scrollableSize, effects);
                                }
                            }
                        };

                        scrollBy = function(px)
                        {
                            scrollTo(currentPos + px);
                        };

                    })();

                    var Events = (function()
                    {
                        var types = {
                            SCROLL: 'scroll'
                        };

                        var registered = {};
                        for(var t in types)
                        {
                            if(types.hasOwnProperty(t))
                            {
                                registered[types[t]] = [];
                            }
                        }

                        var add = function(type, listener, thisBinding)
                        {
                            var innerListener;

                            if(typeof listener != 'function')
                            {
                                throw new Error('EventException: event listener must be a function.');
                            }

                            if(!thisBinding)
                            {
                                thisBinding = sAPI;
                            }

                            innerListener = function(args)
                            {
                                listener.call(thisBinding, args);
                            };
                            innerListener.originalListener = listener;

                            registered[type].push(innerListener);
                        };

                        var remove = function(type, listener)
                        {
                            var registeredByType = registered[type];
                            for(var i = registeredByType.length; --i >= 0;)
                            {
                                if(registeredByType[i].originalListener == listener)
                                {
                                    registeredByType.splice(i, 1);
                                    break;
                                }
                            }
                        };

                        var fire = function(type, args)
                        {
                            var registeredByType = registered[type];
                            for(var i = 0, l = registeredByType.length; i < l; ++i)
                            {
                                registeredByType[i](args);
                            }
                        };

                        return {
                            add: add,
                            remove: remove,
                            fire: fire,
                            types: types
                        };
                    })();

                    sAPI = {
                        'scrollTo': scrollTo,
                        'scrollBy': scrollBy,
                        'getScrolledPx': function(){return currentPos;},
                        'updateScroll': updateScrollableSizes,
                        'addEventListener': Events.add,
                        'removeEventListener': Events.remove
                    };

                    return sAPI;
                };
            }
        }
    );
}
