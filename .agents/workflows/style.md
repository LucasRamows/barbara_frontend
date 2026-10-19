---
description: Style only
---

1. Global Styling Principle
All visual styles (colors, spacing, borders, radius, typography) must be centrally defined and managed.
No component or feature should define its own design tokens independently.
The application must follow a single source of truth for styling, defined in the global CSS.
2. Color Management
All colors must be defined in the global CSS (e.g., :root or theme variables).
Components must never use hardcoded color values.
Use semantic variables instead of raw colors (e.g., --color-primary, --color-text, --color-background).
Theming Rules
Colors must support dynamic theming (e.g., light/dark mode).
Theme switching must be handled exclusively through the global CSS.
Components must automatically adapt to theme changes via CSS variables.
3. Global Design Tokens

Define all UI constants in a centralized global file (e.g., styles/global.css or theme.css):

Required Tokens
Colors (semantic)
Spacing scale (e.g., --spacing-sm, --spacing-md, --spacing-lg)
Border radius (e.g., --radius-sm, --radius-md, --radius-lg)
Font sizes and typography scale
Shadows (if applicable)
4. Spacing and Layout Consistency
All spacing (margin, padding, gaps) must use global spacing variables.
Avoid arbitrary values (e.g., margin: 13px).
Use predefined tokens only.
5. Border Radius and Sizing
Border radius must follow global tokens.
Do not define custom radius values inside components.
Ensure consistent UI across all components.
6. Global File Responsibility
All design tokens must be stored in a single, easily accessible global file.
Any change in this file must propagate across the entire application.
This file acts as the central styling configuration.
7. CSS Modification Rules
Modifying global CSS is allowed only when strictly necessary.
Prefer reusing existing tokens before introducing new ones.
Any addition must follow the existing naming and structure conventions.
8. Component Styling Rules
Components must:
Use only global CSS variables.
Be theme-aware by default.
Avoid inline styles with fixed values.
Styling must be consistent across the entire application.
9. Consistency and Design Integrity
Maintain a consistent visual language across all screens.
Avoid deviations in color, spacing, or shape.
Ensure that all UI elements follow the same design system.
10. Objective
Ensure full visual consistency, easy maintenance, and scalable theming.
Allow global changes to instantly reflect across the entire application.
Eliminate style fragmentation and duplication.