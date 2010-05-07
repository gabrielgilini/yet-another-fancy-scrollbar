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
                    var dragging = false;
                    var orientation = options.horizontal?1:0;
                    var scrollBar = E(container.query('.yafs-scrollbar').first());
                    var handle = E(scrollBar.children(0));
                    var content = E(container.query('.yafs-content').first());
                    var containerSize = API.getElementSizeStyle(container.element());
                    var contentSize = API.getElementSize(content.element());
                    var scrollableContentSize = [contentSize[4] - containerSize[0], contentSize[5] - containerSize[1]];
                    var handleSize = API.getElementSize(handle.element());
                    var scrollBarSize = API.getElementSizeStyle(scrollBar.element());
                    var scrollableSize = scrollBarSize[orientation] - handleSize[orientation];
                    var currentPos = 0;

                    var resizeHandle;
                    if(E.prototype.size)
                    {
                        resizeHandle = function()
                        {
                            handleSize[orientation] = containerSize[orientation] / contentSize[orientation] * containerSize[orientation];
                            if(handleSize[orientation] < 30)
                            {
                                handleSize[orientation] = 30;
                            }
                            handle.size(orientation?null:handleSize[0], orientation?handleSize[1]:null);
                        };
                    }

                    if(contentSize[orientation] <= containerSize[orientation])
                    {
                        scrollBar.show(false, {'removeOnHide': options.removeOnHide});
                    }
                    else
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
                        resizeHandle && resizeHandle();
                        updateScrollableSizes();
                    }

                    function updateScrollableSizes()
                    {
                        scrollableSize = scrollBarSize[orientation] - handleSize[orientation];
                    }

                    var scrollTo, scrollBy, scrollContentTo, scrollHandleTo;
                    (function()
                    {
                        var getOpts = function()
                        {
                            if(!dragging)
                            {
                                return {duration: options.duration, ease: options.ease};
                            }
                            return null;
                        };

                        var posFn = (options.horizontal
                            ? function(el, px){el.position(null, px, getOpts());}
                            : function(el, px){el.position(px, null, getOpts());}
                        );

                        scrollContentTo = function(px)
                        {
                            if(px < 0)
                            {
                                px = 0;
                            }
                            else if(px > scrollableContentSize[orientation])
                            {
                                px = scrollableContentSize[orientation];
                            }
                            currentPos = px;
                            posFn(content, -px);
                        };

                        scrollHandleTo = function(px)
                        {
                            if(px < 0)
                            {
                                px = 0;
                            }
                            else if(px > scrollableSize)
                            {
                                px = scrollableSize;
                            }
                            posFn(handle, px);
                        };

                        scrollTo = function(px)
                        {
                            scrollContentTo(px);
                            scrollHandleTo((px / scrollableContentSize[orientation]) * scrollableSize);
                        };

                        scrollBy = function(px)
                        {
                            scrollTo(currentPos + px);
                        };

                    })();


                    return {
                        'scrollTo': scrollTo,
                        'scrollBy': scrollBy,
                        'getScrolledPx': function(){return currentPos;}
                    };
                };
            }
        }
    );
}
