# Usage

## Initialization

The `jscroll` method is called on the selector for which you want your scrollable content contained within. Always ensure that the content you want to call jScroll on has already been rendered in the DOM before initializing it.

To initialize jScroll on the `DOMContentLoaded` event:

```javascript
$(function() {
    $('.jscroll').jscroll();    
});
```

## Customizing

The `jscroll` method takes an optional object literal as a parameter for overriding the default options. An example of how this can be done is shown below.

```javascript
var options = {
    loadingHtml: '<img src="loading.gif" alt="Loading" /> Loading...',
    padding: 20,
    nextSelector: 'a.jscroll-next:last',
    contentSelector: 'li'
};

$('.jscroll').jscroll(options);
```

See [configuration](configuration.md) for a listing of all options.