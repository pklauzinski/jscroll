/*!
 * jScroll - jQuery Plugin for Infinite Scrolling / Auto-Paging
 * http://jscroll.com/
 *
 * Copyright 2011-2013, Philip Klauzinski
 * http://klauzinski.com/
 * Dual licensed under the MIT and GPL Version 2 licenses.
 * http://jscroll.com/#license
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
 *
 * @author Philip Klauzinski
 * @version 2.3.4
 * @requires jQuery v1.4.3+
 * @preserve
 */
(function($) {

    'use strict';

    // Define the jscroll namespace and default settings
    $.jscroll = {
        defaults: {
            debug: false,
            autoTrigger: true,
            autoTriggerUntil: false,
            loadingHtml: '<small>Loading...</small>',
            padding: 0,
            nextSelector: 'a:last',
            contentSelector: '',
            pagingSelector: '',
            callback: false,
            /* {{{
            ```js 
            callback: function() {
                var $child, $internalRefsToTagName, $jscrollInner, $newSection, tagName;
                $marker.remove();
                $jscrollInner = $('.jscroll-inner');
                $newSection = $(this);
                $newSection.before($newSection.children('section'));
                while (($child = $newSection.children().first()).length) {
                    tagName = $child[0].tagName;
                    $internalRefsToTagName = $newSection.find(tagName);
                    $jscrollInner
                    .find(tagName)
                    .not($internalRefsToTagName)
                    .last()
                    .after($child);
                }
                $('.jscroll-added').not($newSection).remove();
            },
            ``` 
            */ // }}}

            getNextHref: false,
            /* getNextHref: fn(); return href; // {{{
                Allow hrefs to be returned by user function 
            
                ```js
                getNextHref: function() {
                    var $next, $nextHref;
                    $next = $('#page-nav a[href]').first();
                    $nextHref = $next.attr('href');
                    $next.attr('href', null);
                    return $nextHref;
                },
                ```
            */ // }}}

            getInsertPoint: false,
            /* getInsertPoint: fn($inner); return $(element)
            // {{{
                Allow user defined function to determine insert
                point of new parts, part will be inserted
                **before** returned point.  This allows for
                inserts to take place within complex HTML
                structures, eg:
            
                ```html
                <section id="initial part">
                  <div>
                    <p>
                      <ol>
                        <li>
                          <!-- new parts insert here -->
                          <div id="insert-point" />
                 ```
            
                 ```js
                 jscroll({
                   debug: true,
                   getInsertPoint: function($inner) {
                       return $marker = $inner.find('#m4rk3r');
                   }
                 });
                 ```
            
                 TODO: Allow function to perform insertion itself?
                           This might cause issues with the existing jscroll-added
                           based processing, but it may be possible to remove those
                           DIVs if insertion is controlled externally.
            
                       Conclusion: Modification of insertion points is is best 
                           performed using the existing callback function.
            
                 TODO: Combine `dataFilter` functionality?
                           One wouldn't like to enforce the creation of a manual insert
                           function, just to allow editing of new HTML.  The ease of
                           use (minimal setup) of jScroll is a great feature, and
                           should not be detracted from by overly complex requirements
                           for user functions (or the need for any user functions at
                           all). // }}}
            */

            dataFilter: false
            /* dataFilter: fn(html); return html         // {{{
                Allow user function to modify raw HTML returned 
                from $.ajax request
            
            ```js
              dataFilter: function(data, dataType) {
                  var $data;
                  data += '<div id="m4rk3r">';
                  $data = processDocxAttributes($('<div>').html(data));
                  return $data.html();
              },
            ``` 
            */ // }}}

        }
    };

    // Constructor
    var jScroll = function($e, options) {

        // Private vars and methods
        var _data = $e.data('jscroll'),
            _userOptions = (typeof options === 'function') ? { callback: options } : options,
            _options = $.extend({}, $.jscroll.defaults, _userOptions, _data || {}),
            _isWindow = ($e.css('overflow-y') === 'visible'),
            _$next = _options.getNextHref ? false : $e.find(_options.nextSelector).first(),
            _$window = $(window),
            _$body = $('body'),
            _$scroll = _isWindow ? _$window : $e,
            _nextHref = _options.getNextHref ? _options.getNextHref() : $.trim(_$next.attr('href') + ' ' + _options.contentSelector),

            // Check if a loading image is defined and preload
            _preloadImage = function() {
                var src = $(_options.loadingHtml).filter('img').attr('src');
                if (src) {
                    var image = new Image();
                    image.src = src;
                }
            },

            // Wrap inner content, if it isn't already
            _wrapInnerContent = function() {
                if (!$e.find('.jscroll-inner').length) {
                    $e.contents().wrapAll('<div class="jscroll-inner" />');
                }
            },

            // Find the next link's parent, or add one, and hide it
            _nextWrap = function($next) {
                var $parent;
                if (_options.pagingSelector) {
                    $next.closest(_options.pagingSelector).hide();
                } else {
                    $parent = $next.parent().not('.jscroll-inner,.jscroll-added').addClass('jscroll-next-parent').hide();
                    if (!$parent.length) {
                        $next.wrap('<div class="jscroll-next-parent" />').parent().hide();
                    }
                }
            },

            // Remove the jscroll behavior and data from an element
            _destroy = function() {
                return _$scroll.unbind('.jscroll')
                    .removeData('jscroll')
                    .find('.jscroll-inner').children().unwrap()
                    .filter('.jscroll-added').children().unwrap();
            },

            // Observe the scroll event for when to trigger the next load
            _observe = function() {
                _wrapInnerContent();
                var $inner = $e.find('div.jscroll-inner').first(),
                    data = $e.data('jscroll'),
                    borderTopWidth = parseInt($e.css('borderTopWidth'), 10),
                    borderTopWidthInt = isNaN(borderTopWidth) ? 0 : borderTopWidth,
                    iContainerTop = parseInt($e.css('paddingTop'), 10) + borderTopWidthInt,
                    iTopHeight = _isWindow ? _$scroll.scrollTop() : $e.offset().top,
                    innerTop = $inner.length ? $inner.offset().top : 0,
                    iTotalHeight = Math.ceil(iTopHeight - innerTop + _$scroll.height() + iContainerTop);

                if (!data.waiting && iTotalHeight + _options.padding >= $inner.outerHeight()) {
                    //data.nextHref = $.trim(data.nextHref + ' ' + _options.contentSelector);
                    _debug('info', 'jScroll:', $inner.outerHeight() - iTotalHeight, 'from bottom. Loading next request...');
                    return _load();
                }
            },

            // Check if the href for the next set of content has been set
            _checkNextHref = function(data) {
                data = data || $e.data('jscroll');
                if (!data || !data.nextHref) {
                    _debug('warn', 'jScroll: nextSelector not found - destroying');
                    _destroy();
                    return false;
                } else {
                    _setBindings();
                    return true;
                }
            },

            _setBindings = function() { 
                var $next = $e.find(_options.nextSelector).first();
                if (!_options.getNextHref && !$next.length) {
                    return;
                }
                if (_options.autoTrigger && (_options.autoTriggerUntil === false || _options.autoTriggerUntil > 0)) {
                    if (!_options.getNextHref) { _nextWrap($next); }
                    if (_$body.height() <= _$window.height()) {
                        _observe();
                    }
                    _$scroll.unbind('.jscroll').bind('scroll.jscroll', function() {
                        return _observe();
                    });
                    if (_options.autoTriggerUntil > 0) {
                        _options.autoTriggerUntil--;
                    }
                } else {
                    _$scroll.unbind('.jscroll');
                    if (!_options.getNextHref) {
                    $next.bind('click.jscroll', function() {
                        _nextWrap($next);
                        _load();
                        return false;
                    });
                    }
                }
            },

            // A more versatile replacement for $.load
            _get = function(element, url, callback) {
                return $.ajax({
                    url: url,
                    dataType: 'html',
                    dataFilter: _options.dataFilter,
                    success: function(data, textStatus, jqXHR) {
                        element.html(data);
                        return callback.call(element, data, textStatus, jqXHR);
                    }
                });
            },
 
            // Load the next set of content, if available
            _load = function() {
                var $inner = $e.find('div.jscroll-inner').first(),
                    data = $e.data('jscroll');

                data.waiting = true;
                if (!_options.getInsertPoint) {
                $inner.append('<div class="jscroll-added" />')
                    .children('.jscroll-added').last()
                    .html('<div class="jscroll-loading">' + _options.loadingHtml + '</div>');
                } else {
                    _options.getInsertPoint($inner).before('<div class="jscroll-added" />')
                        .children('.jscroll-added').last()
                        .html('<div class="jscroll-loading">' + _options.loadingHtml + '</div>'); }
                return $e.animate({scrollTop: $inner.outerHeight()}, 0, function() {
                    _get($inner.find('div.jscroll-added').last(), data.nextHref, function(r, status) {
                        if (status === 'error') {
                            return _destroy();
                        }
                        var $next = $(this).find(_options.nextSelector).first();
                        data.waiting = false;
                        data.nextHref = _options.getNextHref ? _options.getNextHref() : $next.attr('href') ? $.trim($next.attr('href') + ' ' + _options.contentSelector) : false;
                        $('.jscroll-next-parent', $e).remove(); // Remove the previous next link now that we have a new one
                        _checkNextHref();
                        if (_options.callback) {
                            _options.callback.call(this);
                        }
                        _debug('dir', data);
                    });
                });
            },

            // Safe console debug - http://klauzinski.com/javascript/safe-firebug-console-in-javascript
            _debug = function(m) {
                if (_options.debug && typeof console === 'object' && (typeof m === 'object' || typeof console[m] === 'function')) {
                    if (typeof m === 'object') {
                        var args = [];
                        for (var sMethod in m) {
                            if (typeof console[sMethod] === 'function') {
                                args = (m[sMethod].length) ? m[sMethod] : [m[sMethod]];
                                console[sMethod].apply(console, args);
                            } else {
                                console.log.apply(console, args);
                            }
                        }
                    } else {
                        console[m].apply(console, Array.prototype.slice.call(arguments, 1));
                    }
                }
            };

        // Initialization
        $e.data('jscroll', $.extend({}, _data, {initialized: true, waiting: false, nextHref: _nextHref}));
        _wrapInnerContent();
        _preloadImage();
        _setBindings();

        // Expose API methods via the jQuery.jscroll namespace, e.g. $('sel').jscroll.method()
        $.extend($e.jscroll, {
            destroy: _destroy
        });
        return $e;
    };

    // Define the jscroll plugin method and loop
    $.fn.jscroll = function(m) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('jscroll'), jscroll;

            // Instantiate jScroll on this element if it hasn't been already
            if (data && data.initialized) {
                return;
            }
            jscroll = new jScroll($this, m);
        });
    };

})(jQuery);
// vim: set ts=4 sts=4 sw=4 et:
