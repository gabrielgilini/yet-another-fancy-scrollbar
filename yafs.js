function YAFS(containerId, horizontal)
{
    var orientation = horizontal?1:0;
    var oStyle = horizontal?'left':'top';
    var container = E(containerId);
    var scrollBar = E(container.query('.yafs-scrollbar').first());
    var handle = E(scrollBar.children(0));
    var content = E(container.query('.yafs-content').first());
    var containerSize = API.getElementSizeStyle(container.element());
    var contentSize = API.getElementSize(content.element());
    var scrollableContentSize = [contentSize[4] - containerSize[0], contentSize[5] - containerSize[1]];
    var handleSize = API.getElementSize(handle.element());
    var scrollBarSize = API.getElementSizeStyle(scrollBar.element());
    var scrollableSize = scrollBarSize[orientation] - handleSize[orientation];

    if(contentSize[orientation] <= containerSize[orientation])
    {
        scrollBar.setStyle('display', 'none');
    }
    else
    {
        handle.attachDrag(null,
            {
                ondrag: function(c)
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
                axes: (orientation) ? 'horizontal' : 'vertical',
                ghost: 1
            }
        );
        resizeHandle();
        updateScrollableSizes();
    }

    function resizeHandle()
    {
        handleSize[orientation] = containerSize[orientation] / contentSize[orientation] * containerSize[orientation];
        console.log(containerSize, contentSize, handleSize);
        if(handleSize[orientation] < 30)
        {
            handleSize[orientation] = 30;
        }
        handle.size(orientation?null:handleSize[0], orientation?handleSize[1]:null);
    }

    function updateScrollableSizes()
    {
        scrollableSize = scrollBarSize[orientation] - handleSize[orientation];
    }

    var scrollContentTo = (function()
    {
        var pos = (horizontal
            ? function(px){content.position(null, -px);}
            : function(px){content.position(-px);}
        );

        return function(px)
            {
                if(px < 0)
                {
                    px = 0;
                }
                else if(px > scrollableContentSize)
                {
                    px = scrollableSize;
                }
                pos(px);
            };
    })();

    return {
        'scrollTo': scrollTo
    }
}