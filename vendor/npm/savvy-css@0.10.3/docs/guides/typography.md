Typography
==================================

Savvy provides a responsive typography system that sizes fonts for various elements according to a modular scale set to a [minor third ratio](https://en.wikipedia.org/wiki/Minor_third)


Essentially, it takes a "base" of 1em (which, in a browser's default settings, converts to 16px), and then defines variables for font-size at different "scale steps" which are 1.2 times the size of the font at the previous step.

Here's a demo of the current scale (i.e. what each ​_step_​ would equate to in size): http://www.modularscale.com/?1&em&1.2&web&text

This gives us a "size palette" of sorts, which is then chosen from to set sizes for different HTML elements (`body`, `h1`, `h2`, etc) at both a base screen width, and at different screen-width breakpoints. Implementation details can best be seen in Savvy's [elemental typography](/src/elements/typography) section
