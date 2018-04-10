(function() {
    window.$docsify = {
        name: 'jScroll',
        repo: 'https://github.com/pklauzinski/jscroll',
        executeScript: true,
        search: 'auto',
        //coverpage: true,
        loadSidebar: true,
        maxLevel: 4,
        subMaxLevel: 2,
        auto2top: true,
        ga: 'UA-23834740-2',
        plugins: [
            function(hook, vm) {
                hook.ready(function() {
                    var title = document.querySelector('.sidebar h1 a'),
                        logo = document.createElement('img');

                    logo.src = 'img/jscroll.png';
                    title.insertBefore(logo, title.firstChild);
                });
                hook.doneEach(function() {
                    var p = document.createElement('p'),
                        content = document.querySelector('.markdown-section');

                    p.id = 'carbon-top';
                    p.className = 'warn';
                    content.insertBefore(p, content.firstChild);
                    adCarbon('carbon-top');
                });
            }
        ]
    };

    function adCarbon(id) {
        var carbon = document.getElementById(id),
            script = document.createElement(('script'));

        if (carbon) {
            script.id = '_carbonads_js';
            script.async = true;
            script.src = '//cdn.carbonads.com/carbon.js?zoneid=1673&serve=C6AILKT&placement=jscrollcom';
            carbon.appendChild(script);
        }
    }
})();