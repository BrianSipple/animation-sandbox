# Savvy Syntax

So... what's the philosophy behind _Savvy's_ syntax?  
Think namespaced functional ***Concerns***:

```
<namespace>-<className>[-<childName>||--<modifierName>]
```

_Concerns_ relate to functional areas of a style composition, and they're represented by
the initial character of a class selector. They include:

-   `o`: [Objects](../src/objects)
  - Signifies that something is an Object, and that it may be used in any number of unrelated contexts to the one you can currently see it in. Modifications to these types of class could potentially have knock-on effects in a lot of other unrelated places. Tread carefully.
-   `u`: [Utilities](../src/utilities)
  - Signifies that this class is a Utility class. It has a very specific role (often providing only one declaration) and should not be bound onto or changed. It can be reused and is not tied to any specific piece of UI.
-   `g`: [Garnishes](../src/garnishes)
  - Similar to utilities, but focused on outer- or ‘skin’-level styles as opposed to structural/layout styles. Examples include colors and font settings.



### Media Queries: A Special Concern

To fully grok Savvy's philosophy on media queries, please read Brad Frost's excellent [_7 Habits of Highly Effective Media Queries_](http://bradfrost.com/blog/post/7-habits-of-highly-effective-media-queries/)

To summarize, classes are written mobile-first — that is, their styles apply from the smallest viewport width and up. Sometimes, we only want a rule to apply to a concern within the context of one of _Savvy's_ [breakpoint thresholds](./media-queries#thresholds) -- and that's where our _cool-kids_ syntax for breakpoint-specfic classes comes into play:

```
_<media-query-threshold-abbreviation>-<concern>-<className>[__<childName>||--<modifierName>]
```

 These class names are prefixed with an underscore, followed by the namespace of the breakpoint, followed by a single hyphen. The class name is written as normal thereafter.

An example:
```
    <div class="o-column__oneHalf _md-o-column__oneThird"></div>
```

This will initialize a column using the Savvy [grid system](../src/objects/o-grid.css) which -- under default circumstances -- will be embody the rules of the `o-column__oneHalf` class. When the screen width expands (or is) beyond the width of the `medium` breakpoint, however, the rules defined for the `_md-o-column__oneThird` will intervene and take precedence.
