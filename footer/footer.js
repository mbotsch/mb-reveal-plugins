"use strict";

var RevealFooter = (function(){

    /* this function is called inbetween just before Reveal's setupPDF.
     * We setup the minimum height of slide elements to Reveal's page height.
     */
    function fixFooters()
    {
        var height = Reveal.getConfig().height;

        // process all slides...
		Reveal.getSlides().forEach( function( slide ) {

            // set min-height to page height
            slide.style.minHeight = height + "px";

            // pandoc puts footers into a <p> element, which
            // makes positioning w.r.t. slide bottom difficult.
            // hence we remove these p-elements and put the
            // footers as children of the slide element
            var footers = slide.getElementsByClassName('footer');
            for (var i=0; i<footers.length; i++)
            {
                var footer = footers[i];
                var parent = footer.parentElement;
                if (parent.nodeName == "P")
                {
                    slide.appendChild(footer);
                    if (parent.childNodes.length == 0) {
                        parent.parentElement.removeChild(parent);
                    }
                }
            }
        });
    }


    function checkHeight()
    {
        var configHeight  = Reveal.getConfig().height;
        var slideHeight   = Reveal.getCurrentSlide().clientHeight;

        if (slideHeight > configHeight)
        {
            console.error("slide " + slideNumber() + " is " + (slideHeight-configHeight) + "px too high");
        }
    }


    function slideNumber()
    {
        var idx = Reveal.getIndices();
        return idx.v>0 ? "(h:" + (idx.h+1) + ", v:" + (idx.v+1) + ")" : idx.h+1;
    }


	return {
		init: function() { 
            return new Promise( function(resolve) {
                Reveal.addEventListener( 'ready', fixFooters );
                Reveal.addEventListener( 'slidechanged', checkHeight );
                resolve();
            });
        }
    }

})();

Reveal.registerPlugin( 'footer', RevealFooter );

