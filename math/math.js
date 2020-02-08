/**
 * A plugin which enables rendering of math equations inside
 * of reveal.js slides. Essentially a thin wrapper for MathJax.
 *
 * @author Hakim El Hattab
 *
 * Modifications by Mario Botsch:
 * - disable matching font height, which allow disabling 
 *   math typesetting on each slide change
 * - disable fast preview
 * - disable AssistiveMML, since it duplicates math in speaker notes
 * - disable SVG font caches, since it doesn't work in speaker notes
 * - disable Firefox's cookie mechanism which overrides renderer setting
 * - use promise mechanism to ensure that math is typset before PDF print
 *
 */
var RevealMath = window.RevealMath || (function(){

	var options = Reveal.getConfig().math || {};
	var mathjax = options.mathjax || 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/';
    var config  = options.config  || 'tex-svg.js';
	var url = mathjax + config;


	function defaults( options, defaultOptions ) 
    {
		for ( var i in defaultOptions ) 
        {
			if ( !options.hasOwnProperty( i ) ) 
            {
				options[i] = defaultOptions[i];
			}
		}
	}


	function loadScript( url, callback ) 
    {
		var head   = document.querySelector( 'head' );
		var script = document.createElement( 'script' );
		script.type = 'text/javascript';
        script.id   = 'MathJax-script';
		script.src  = url;

		// Wrapper for callback to make sure it only fires once
		var finish = function() 
        {
			if( typeof callback === 'function' ) 
            {
				callback.call();
				callback = null;
			}
		}

		script.onload = finish;

		// IE
		script.onreadystatechange = function() {
			if ( this.readyState === 'loaded' ) {
				finish();
			}
		}

		// Normal browsers
		head.appendChild( script );
	}


    function fixLinks()
    {
        for (var a of document.getElementsByTagName("a")) 
        {
            var href = a.href;
            if (href.baseVal)
            {
                var label = href.baseVal;
                if (label.includes("#mjx-eqn"))
                {
                    label = decodeURIComponent(label.substring(1));
                    var eqn = document.getElementById(label);
                    if (eqn)
                    {
                        var s = eqn.closest("section");
                        if (s)
                        {
                            a.href.baseVal = "#" + s.id;
                        }
                    }
                }
            }
        }
    }


	return {
		init: function() { 
            return new Promise( function(resolve) {

                var printMode = ( /print-pdf/gi ).test( window.location.search );


                window.MathJax = {
                    loader: {
                        load: ['[tex]/ams'],
                        typeset: false
                    },
                    startup: {
                        ready: () => {
                            console.log('MathJax is loaded, but not yet initialized');
                            //MathJax.startup.defaultReady();
                        }
                    },
                    svg: {
                        scale: 1.5,                    // DOES NOT WORK!!!! global scaling factor for all expressions
                        minScale: .5,                  // smallest scaling factor to use
                        matchFontHeight: false,        // true to match ex-height of surrounding font
                        mtextInheritFont: true,        // true to make mtext elements use surrounding font
                        merrorInheritFont: true,       // true to make merror text use surrounding font
                        mathmlSpacing: false,          // true for MathML spacing rules, false for TeX rules
                        skipAttributes: {},            // RFDa and other attributes NOT to copy to the output
                        exFactor: .5,                  // default size of ex in em units
                        displayAlign: 'center',        // default for indentalign when set to 'auto'
                        displayIndent: '0',            // default for indentshift when set to 'auto'
                        fontCache: 'none',             // or 'global' or 'none'
                        localID: null,                 // ID to use for local font cache (for single equation processing)
                        internalSpeechTitles: true,    // insert <title> tags with speech content
                        titleID: 0                     // initial id number to use for aria-labeledby titles
                    },
                    tex: {
                        tags: 'ams',
                        packages: {
                            '[+]': ['ams']
                        },
                        macros: {
                            R: "{{\\mathrm{{I}\\kern-.15em{R}}}}",
                            laplace: "{\\Delta}",
                            grad: "{\\nabla}",
                            T: "^{\\mathsf{T}}",
                            abs: ['\\left\\lvert #1 \\right\\rvert', 1],
                            norm: ['\\left\\Vert #1 \\right\\Vert', 1],
                            iprod: ['\\left\\langle #1 \\right\\rangle', 1],
                            vec: ['{\\mathbf{#1}}', 1],
                            mat: ['{\\mathbf{#1}}', 1],
                            set: ['\\mathcal{#1}', 1],
                            func: ['\\mathrm{#1}', 1],
                            trans: ['{#1}\\mkern-1mu^{\\mathsf{T}}', 1],
                            matrix: ['\\begin{bmatrix} #1 \\end{bmatrix}', 1],
                            vector: ['\\begin{pmatrix} #1 \\end{pmatrix}', 1],
                            of: ['\\mkern{-0mu}\\left( #1 \\right\)', 1],
                            diff: ['\\frac{\\mathrm{d}{#1}}{\\mathrm{d}{#2}}', 2],
                            pdiff: ['\\frac{\\partial {#1}}{\\partial {#2}}', 2]
                        }
                    }
                };


                loadScript( url, function() {

                    // Firefox stores settings from MathJax menu in cookies.
                    // Prevent cookie from changing the renderer, since only
                    // SVG will be installed. Do this by overwriting the
                    // cookie's renderer setting.
                    //var keks = MathJax.HTML.Cookie.Get("menu");
                    //if (keks && keks.renderer)
                    //{
                        //MathJax.HTML.Cookie.Set("menu", { renderer: "" });
                    //}

                    // Typeset followed by an immediate reveal.js layout since
                    // the typesetting process could affect slide height
                    window.MathJax.startup.defaultReady();
                    MathJax.startup.promise.then(() => {
                        console.log("mathjax typeset done");
                        Reveal.layout();
                        fixLinks();
                        resolve();
                    });
                });
            });
        }
    }

})();

Reveal.registerPlugin( 'math', RevealMath );
