# Design Principles

## Separation of Concerns Between the Framework and "Components"

Components have high cohesion with HTML and Javascript.
That is, they are interdependent and inseparable.
Naming conventions and organization of components are highly dependent on
application architecture and templating engines.

Savvy is unopinionated in component implementation but suggests the utilization of folder structure and naming conventions similar to those proposed in [Suitcss](http://suitcss.github.io)
to clearly distinguish components from low-level styles.

Implementation aside, these general guidelines can help create components on top of Savvy:

- Components should follow the open/closed principle, and should not be defined early on, but created in a highly-reusable fashion once patterns arise.
- Base component structural styles should be clearly separated from related thematic extensions.
The `Objects` concept defined by [CSS Wizadry](http://csswizardry.com/2015/03/more-transparent-ui-code-with-namespaces/) is a concept might help
with keeping abstract structures and concrete, customized components as
separate concerns (for example, having an `o` namespace for objects and a `c` namespace for components).
- For large, scalable applications, modifying existing components and introducing new components should follow a standardized process.
- CSS-only components are generally unnecessary.

For further insight, read more about [composing UI elements with Savvy](/composing-ui-elements.md).
