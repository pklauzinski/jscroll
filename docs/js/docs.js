(function() {
    window.$docsify = {
        name: 'jScroll',
        repo: 'https://github.com/pklauzinski/jscroll',
        executeScript: true,
        search: 'auto',
        coverpage: true,
        loadSidebar: true,
        maxLevel: 4,
        subMaxLevel: 2,
        auto2top: true,
        ga: 'UA-23834740-2',
        plugins: [
            function(hook) {
                hook.ready(function() {
                    var carbon = document.getElementById('carbon'),
                        script = document.createElement(('script'));

                    script.id = '_carbonads_js';
                    script.async = true;
                    script.src = '//cdn.carbonads.com/carbon.js?zoneid=1673&serve=C6AILKT&placement=jscrollcom';
                    carbon.appendChild(script);
                });
            }
        ]
    }
})();