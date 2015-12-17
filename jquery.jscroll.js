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
            prevSelector: 'a:first',
            contentSelector: '',
            pagingSelector: '',
            callback: false
        }
    };

    // Constructor
    var jScroll = function($e, options) {

        // Private vars and methods
        var _data = $e.data('jscroll'),
            _userOptions = (typeof options === 'function') ? { callback: options } : options,
            _options = $.extend({}, $.jscroll.defaults, _userOptions, _data || {}),
            _isWindow = ($e.css('overflow-y') === 'visible'),
            _$next = $e.find(_options.nextSelector).first(),
            _$prev = $e.find(_options.prevSelector).first(),
            _$window = $(window),
            _$body = $('body'),
            _$scroll = _isWindow ? _$window : $e,
            _nextHref = $.trim(_$next.attr('href') + ' ' + _options.contentSelector),
            _prevHref = $.trim(_$prev.attr('href') + ' ' + _options.contentSelector),
            _originalOptions = $.extend({}, _options),

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

            // Find the prev link's parent, or add one, and hide it
            _prevWrap = function($prev) {
                var $parent;
                if (_options.pagingSelector) {
                    $prev.closest(_options.pagingSelector).hide();
                } else {
                    $parent = $prev.parent().not('.jscroll-inner,.jscroll-prepended').addClass('jscroll-prev-parent').hide();
                    if (!$parent.length) {
                        $prev.wrap('<div class="jscroll-prev-parent" />').parent().hide();
                    }
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
                    return _loadNext();
                }

                _debug('info', 'W3line-jScroll:', $inner.outerHeight() - iTotalHeight, 'from bottom. Loading prev request...');
            },

            // Check if the href for the prev set of content has been set
            _checkPrevHref = function(data) {
                data = data || $e.data('jscroll');
                _setBindingsPrev();
                if (!data || !data.prevHref) {
                    return false;
                } else {
                    return true;
                }
            },

            // Check if the href for the next set of content has been set
            _checkNextHref = function(data) {
                data = data || $e.data('jscroll');
                _setBindingsNext();
                if (!data || !data.nextHref) {
                    _debug('warn', 'jScroll: nextSelector not found - destroying');
                    _destroy();
                    return false;
                } else {
                    _setBindingsNext();
                    return true;
                }
            },

            _setBindingsPrev = function() {
                var $prev = $e.find(_options.prevSelector).first();
                if ($prev.length) {
                    $prev.unbind('click.jscroll').bind('click.jscroll', function() {
                        _prevWrap($prev);
                        _loadPrev();
                        return false;
                    });
                }
            },

            _setBindingsNext = function() {
                var $next = $e.find(_options.nextSelector).first();
                if ($next.length) {
                    if (_options.autoTrigger && (_options.autoTriggerUntil === false || _options.autoTriggerUntil > 0)) {
                        _nextWrap($next);
                        if (_$body.height() <= _$window.height()) {
                            _observe();
                        }
                        _$scroll.unbind('.jscroll').bind('scroll.jscroll', function() {
                            return _observe();
                        });
                    } else {
                        _$scroll.unbind('.jscroll');
                        $next.unbind('click.jscroll').bind('click.jscroll', function() {
                            if( _originalOptions.autoTriggerUntil > 0 && _options.autoTriggerUntil <= 0 ) {
                                _options.autoTriggerUntil = _originalOptions.autoTriggerUntil;
                            }
                            _nextWrap($next);
                            _loadNext();
                            return false;
                        });
                    }
                }
            },

            _setBindings = function() {
                _setBindingsPrev();
                _setBindingsNext();
            },

            // Load the prev set of content, if available
            _loadPrev = function() {
                var $inner = $e.find('div.jscroll-inner').first(),
                    data = $e.data('jscroll');

                data.waiting = true;
                $inner.prepend('<div class="jscroll-prepended" />')
                    .children('.jscroll-prepended').first()
                    .html('<div class="jscroll-loading">' + _options.loadingHtml + '</div>');

                return $e.animate({scrollTop: $inner.outerHeight()}, 0, function() {
                    $inner.find('div.jscroll-prepended').first().load(data.prevHref, function(r, status) {
                        if (status === 'error') {
                            return _destroy();
                        }
                        var $prev = $(this).find(_options.prevSelector).first();
                        data.waiting = false;
                        data.prevHref = $prev.attr('href') ? $.trim($prev.attr('href') + ' ' + _options.contentSelector) : false;
                        $('.jscroll-prev-parent', $e).remove(); // Remove the previous prev link now that we have a new one
                        _checkPrevHref();
                        if (_options.callback) {
                            _options.callback.call(this);
                        }
                        // Remove next link
                        var $next = $(this).find(_options.nextSelector).first();
                        _nextWrap($next);
                        $(this).find('.jscroll-next-parent').first().remove();

                        _debug('dir', data);
                    });
                });
            },

            // Load the next set of content, if available
            _loadNext = function() {
                var $inner = $e.find('div.jscroll-inner').first(),
                    data = $e.data('jscroll');

                data.waiting = true;
                $inner.append('<div class="jscroll-added" />')
                    .children('.jscroll-added').last()
                    .html('<div class="jscroll-loading">' + _options.loadingHtml + '</div>');

                return $e.animate({scrollTop: $inner.outerHeight()}, 0, function() {
                    $inner.find('div.jscroll-added').last().load(data.nextHref, function(r, status) {
                        if (status === 'error') {
                            return _destroy();
                        }
                        if (_options.autoTriggerUntil > 0) {
                            _options.autoTriggerUntil--;
                        }
                        var $next = $(this).find(_options.nextSelector).first();
                        data.waiting = false;
                        data.nextHref = $next.attr('href') ? $.trim($next.attr('href') + ' ' + _options.contentSelector) : false;
                        $('.jscroll-next-parent', $e).remove(); // Remove the previous next link now that we have a new one
                        _checkNextHref();
                        if (_options.callback) {
                            _options.callback.call(this);
                        }
                        // Remove prev link
                        var $prev = $(this).find(_options.prevSelector).first();
                        _prevWrap($prev);
                        $(this).find('.jscroll-prev-parent').first().remove();

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
        $e.data('jscroll', $.extend({}, _data, {initialized: true, waiting: false, nextHref: _nextHref, prevHref: _prevHref}));
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
