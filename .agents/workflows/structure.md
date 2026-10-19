---
description: Structure Files
---

1. Modularization Principle
   All code must be modular, reusable, and loosely coupled.
   Before creating any new component, function, or logic:
   Check if an equivalent already exists locally or in shared/global scope.
   If it exists:
   Reuse it.
   Extend or adapt it without breaking existing behavior.
   If it does not exist:
   Create a new component following the structure below.
2. Component Structure
   Local Components
   If the component is used only within the current feature/page/project:
   Place it inside the local project structure (e.g., features/<feature-name>/components).
   Keep it scoped and avoid unnecessary abstraction.
   Shared Components
   If the component is reusable across multiple features/projects:
   Place it in a global/shared directory (e.g., components/).
   Ensure it is generic, configurable, and reusable.
3. Services Layer
   All backend communication must be centralized in a services/ directory.
   Responsibilities:
   Handle all HTTP/API requests.
   Isolate external communication from UI logic.
   Rules:
   No direct API calls inside components.
   Components must consume data via services.
4. Interfaces and Types
   All request/response structures must be centralized.
   Use a dedicated directory (e.g., interfaces/ or types/).
   Responsibilities:
   Define all input/output contracts.
   Ensure type consistency across the application.
   Avoid duplicating type definitions.
5. Project Structure Organization

Maintain a simple, scalable, and maintainable structure:

components/ → shared/global UI components
features/ → feature-based modules (each with its own components, logic, etc.)
services/ → API and backend communication
interfaces/ or types/ → shared type definitions
lib/ → utility functions, helpers, and reusable logic not tied to UI or business rules
roots/ → application entry points, routing, and root-level configuration 6. Folder Responsibility Rules
lib/
Generic utilities
Helper functions
Pure logic (no side effects, no UI, no API calls)
roots/
Routing configuration
App initialization
Global providers and setup 7. Consistency and Maintainability
Follow a consistent naming convention across all modules.
Keep files small and focused on a single responsibility.
Avoid duplication at all costs.
Prefer composition over inheritance.
Ensure all structures are easy to navigate and maintain. 8. Component Creation Rules

When creating a new component:

Define clear responsibility.
Ensure reusability when applicable.
Place it correctly:
Local scope → inside feature
Global scope → shared components
Avoid tight coupling with specific business logic unless it is feature-specific.
