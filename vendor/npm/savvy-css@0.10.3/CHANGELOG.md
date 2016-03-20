0.10.3 / 2016-03-17
==================
* Overflow utilities for `auto` and fixes to `o-grid-cell` helper nesting.

0.10.2 / 2016-03-17
==================
* N/A (NPM publishing errors -- we moved straight to 0.10.3)

0.10.1 / 2016-03-17
==================
* N/A (NPM publishing errors -- we moved straight to 0.10.3)

0.10.0 / 2016-03-17
==================
 * `currentColor` garnishes... because `currentColor` is amazing.

 * Breaking Changes
    * .g-label has been removed
    * .g-ellipsized-line is now g-truncate
    * g-h1 and co have been removed
    * `g-link—reset` is now `.g-link-reset` both because it’s not quite a modifier on an existing rule, and so it can be syntactically similar to `.g-list-reset`
    * `.u-min-width-at-break--[modifier]` is now `.u-min-width-at-breakpoint--[modifier]`, and has a much more well-defined behavior.    

* More Typography enhancements
    * garnishes for underline and strikethrough
    * `.g-clip` garnish for clipping overflowed text
    * Utilities for word-wrapping

* content justification utilities

* Initial implementation of additional, more-fine-grained, flex-grid-cell utilities.

* Intent to deprecated `.u-list-reset`.
    * Please use `.g-list-reset`, as the rule has now been classified as a garnish

* Fine-grained utility for `g-list-style-none`

* `o-divider` object for horizontal and vertical dividers

* Sizing utilities for height on the tenths

0.9.1 / 2016-03-05
==================
 * Added overflow:hidden to `.g-ellipsized-line` so it actual works

0.9.0 / 2016-03-05
==================
 * c-button no longer exists; the experiment is over. Savvy is concerned with enabling
 component composition as opposed to components themselves, and right now, there's no
 real intent to try and ship components with locked-in styles.

0.8.5 / 2016-03-05
==================
 * c-button no longer sets `flex-direction: column` by default

0.8.4 / 2016-03-04
==================
 * Minor updates to packaging information.

0.8.3 / 2016-03-04
==================
 * Minor updates to packaging information.

0.8.0 / 2016-03-04
==================
 * More fine-grained overflow utilities.
 * Inheriting width
 * Width and height utilities that set values according to spacing constants

0.7.4 / 2016-02-25
==================
 * Font-scaling breakpoints are a bit less extreme -- the scale set at the `large` breakpoint
now scales up again at the `xxLarge` breakpoint, instead of `xLarge`.

0.7.3 / 2016-02-25
==================
 * Line height support for `<h4>`, `<h5>`, and `<h6>` tags.

0.7.2 / 2016-02-25
==================
 * Grid cells no only get `display:flex` when `o-flex-grid` has the `o-flex-grid--flex-cells` modifier.

0.7.1 / 2016-02-25
==================
 * More fine-grained width helpers. Sizings are now on the twentieths (5% increments), halves, thirds and quarters.

0.7.0 / 2016-02-24
==================
 * Main Border utilities now only use a single-dash in the last portion of the rule. For example `g-border--s2` is now `g-border-s2`.
 * Font size utilities for setting font locally according to the root

0.6.0 / 2016-02-17
==================

  * Animation is now a first-class concern with an `a` prefix.
  * Animation easing helpers for fine-grained focus on `animation-timing-function` or `transition-timing-function`.
  * Border style/width combination utilities.
  * Inherited and "fitted" width utilities.
  * `.o-list--flat` has been slated for deprecation. `.o-list--reset` is now the recommended selector name for this behavior.
  * Fine-grained "auto" margin helpers.
  * `100vh` height utility.


0.5.1 / 2016-01-18
==================

  * fix bem syntax in width breakpoint utilities

0.5.0 / 2016-01-18
==================

  * Utility classes for setting the min-width of an element to a breakpoint width (at said breakpoint)

0.4.1 / 2016-01-14
==================

  * Proper custom ease created for GTFO
  * link to changelog in readme

0.4.0 / 2016-01-13
==================

  * initial definition of a motion design language -- plus garnish class rules to access variables
  * "u-centered" is now "u-transform-center" to better distinguish from "u-align-center" (and to be a bit less vague in general :smiley:).

0.3.0 / 2016-01-12
==================

  * version 2 of responsive flex gridding is in place
  * box-sizing utilities added
  * Additional font support for kerning and other OpenType features
  * positioning utility update for "auto" side margins
  * label styling

0.2.1 / 2016-01-05
==================
  * Changelog generated via command line.
  * Changelog formatting updates
  * Gulp imagemin task

0.2.0 / 01-05-2015
==================

  * Class namespaces (concerns) are now followed by a dash ("-"), which, itself precedes the class name.  
    This changes the original definition of  `<namespace>__<className>`.
  * Polished build process to deliver a minified file.
  * Improved media query logic


0.1.1 / 12-26-2015
==================

  * Initial set of functionality built around each functional area.
  * Oh... and the name's Savvy.

0.1.0 / 12-09-2015
==================

  * Initial architecture setup and documentation. Project name still undetermined
