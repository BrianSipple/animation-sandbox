# Savvy

[![npm version](https://badge.fury.io/js/savvy-css.svg)](https://badge.fury.io/js/savvy-css)

## Modular, focused, clean, responsible, highly composable CSS

Savvy is a collection of foundational styles and classes for authoring beautifully simple, highly effective CSS in any type of project, at any scale.

## Design Goals

The _Savvy_ approach to CSS favors:

- Responsive design: Lightweight styles that assume small-screen (i.e.: mobile) interfaces as their default
- Expressivity: Classes that communicate visual styling
- Reusability & Maintenance: A common (i.e.: composition-based) approach for styling basic _and_ more sophisticated components.
- Utility: Focused classes that keep CSS [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
- Learnability: Designing systems that are easy for developers and designers to learn and use.
- Performance: Delivering a super-small amount of CSS to devices, browsers, and users.
- [BEM Syntax](https://css-tricks.com/bem-101/): Conventional [_Block_ > _Element_ > _Modifier_ methodology](https://en.bem.info/method/) aligns perfectly the class naming structure meant to follow Savvy's ***Concern*** prefixes. See the full [Syntax Guide](/docs/syntax.md) for more details.
- Adherence to the [principles of motion design](/src/base-settings/animation/_easing.css)

Architectural and technical details related to a specific concern can be found in [its source file's readme](/src).

## Benefits

- Smaller, Simpler, DRY CSS... which stays that way thanks to its composability
- Easier layout refactoring and experimentation
- Designed for scalability
- Designed for portability (contribute to the project directly... or fork it as the starting point for your own)
- Clean foundational defaults for HTML elements


## Usage

#### Installation
```
npm install savvy-css
```

Savvy is currently being developed, iterated upon, and tested for production usage, and thus, a 1.0 release is still forthcoming.

That said, it's very much in the "Release Candidate" stage. I haven't been able to put an official roadmap together yet, but as of 0.10.1, things are significantly stable.

Additionally, the best way to become familiar with Savvy is by reading the (very-much-still-in-progress) [guides](/docs/guides/), reading through rules being developed in the [source code](src/), and tracking its progress through the [changelog](/CHANGELOG.md).

## Development
Contributions are welcome, but Savvy's overall architecture and requirements are still being fleshed out -- so it may be a bit challenging to accept PRs. With that said, to hack on Savvy:

Clone the repository, then `cd` into its directory and install dependencies with npm:

```
cd savvy && npm install
```

Development tasks are currently managed with Gulp:

### `gulp lint`
Savvy ships with a [linting configuration](/stylelint.config.js) which is passed to [Stylelint](https://github.com/stylelint/stylelint). The lint task will examine all CSS files in the source directory, and output any linting errors to the command line via [postcss-reporter](https://github.com/postcss/postcss-reporter).

### `gulp build`
Passes all source CSS files through a series of [POSTCSS][POSTCSS] processor [gulp-postcss](https://github.com/postcss/gulp-postcss). This transforms source CSS custom properties to their computed values and minifies the output, resulting in a `savvy.min.css` file.

More development tasks (continuous compilation, watchers, etc) will be integrated shortly.

## Inspiration
Savvy is a progression on many outstanding architectural concepts that have come to fruition in CSS in recent years. Its underpinnings have been heavily influenced by projects such as [BassCSS](http://basscss.com), [Tachyons](http://tachyons.io), and many others that I'm surely leaving out.

__

[POSTCSS]: https://github.com/postcss/postcss
