# Configuration

## debug

- Type: `Boolean`
- Default: `false`

When set to `true`, outputs useful information to the console display if the `console` object exists.

## autoTrigger

- Type: `Boolean`
- Default: `true`

When set to `true`, triggers the loading of the next set of content automatically when the user scrolls to the bottom of the containing element. When set to `false`, the required next link will trigger the loading of the next set of content when clicked.

## autoTriggerUntil

- Type: `Boolean|Number`
- Default: `false`

Set to an integer greater than `0` to turn off `autoTrigger` of paging after the specified number of pages. Requires `autoTrigger` to be `true`.

## loadingHtml

- Type: `String`
- Default: `<small>Loading...</small>`

The HTML to show at the bottom of the content while loading the next set.

## loadingFunction

- Type: `Function|Boolean`
- Default: `false`

A JavaScript function to run after the `loadingHtml` has been drawn.

## padding

- Type: `Number`
- Default: `0`

The distance from the bottom of the scrollable content at which to trigger the loading of the next set of content. This only applies when `autoTrigger` is set to `true`.

## nextSelector

- Type: `String`
- Default: `a:last`

The selector to use for finding the link which contains the `href` pointing to the next set of content. If this selector is not found, or if it does not contain an `href` attribute, jScroll will self-destroy and unbind from the element upon which it was called.

## contentSelector

- Type: `String`
- Default: `''`

A convenience selector for loading only part of the content in the response for the next set of content. This selector will be ignored if left blank and will apply the entire response to the DOM.

!> For more information on the `contentSelector` option and how it loads a response fragment, see the [jQuery documentation for the .load() method](http://api.jquery.com/load/).

## pagingSelector

- Type: `String`
- Default: `''`

Optionally define a selector for your paging controls so that they will be hidden, instead of just hiding the next page link.

## callback

- Type: `Function|Boolean`
- Default: `false`

Optionally define a callback function to be called after a set of content has been loaded.