# Frontend Copilot Instructions

## UI and design system

- Use the Elhub Design System (EDS) as the default for new user interface work.
- Prefer the shared components exported from `src/components/ui` (e.g. `Button`, `Card`, `TextField`, `FormItem`, `Modal`, `Table`, `Tabs`, `Datepicker`, `DateTimePicker`, `Stepper`, `FormContainer`).
- Feature code must import Elhub components through `src/components/ui`; do not import `@elhub/ds-components` directly outside `src/components/ui`.
- Prefer icons from `@elhub/ds-icons` for actions and status indicators. Do not create hand-written SVG icons when an Elhub icon exists.
- Use Tailwind CSS (v4) for layout and component styling.
- Prefer Elhub Tailwind tokens and semantic color classes (see `src/main.css` and `public/static-assets/semantic-colors.css`), such as `text-semantic-text` and `bg-semantic-background-alternative`, over hard-coded colors.
- Reuse existing local components and patterns before creating a new component or styling abstraction.
- Do not add another UI component library. MUI (`@mui/material`, `@mui/icons-material`) is legacy; do not expand its usage in new code.

## React Admin and the EDS-ra pattern

- Follow the existing React, TypeScript, and React Admin (v5 / ra-core) patterns already established in the repository.
- When a feature must use React Admin (resource pages, lists, forms, filters, show views), prefer the EDS-ra adapters in `src/components/EDS-ra` (`fields`, `inputs`, `buttons`, `list`, `show`) over raw React Admin/MUI components, so that resource UIs render with the Elhub Design System.
- Only add new components to `src/components/EDS-ra` when wrapping a React Admin concern with EDS; keep purely presentational EDS wrappers in `src/components/ui`.
- Keep loading, empty, error, disabled, and confirmation states explicit for user-facing workflows (see `src/components/ConfirmAction.tsx`, `src/components/SessionExpiryBanner.tsx` for examples).
- Preserve accessible names, keyboard interaction, and sensible focus behavior for interactive controls.
- Keep responsive behavior in the existing Tailwind style, using responsive utilities where appropriate.

## Repository conventions

- Reuse the application theme from `src/theme.tsx` rather than introducing a separate theme.
- Do not manually edit files under `src/generated-client/`; regenerate them via `openapi-ts.config.ts`/the API definition when needed.
- Keep changes focused on the feature being changed and follow the surrounding file and naming conventions (snake_case resource folders matching API resources, PascalCase component files).
- Avoid introducing hard-coded design values when an Elhub component, Tailwind token, or existing local pattern can be used.
- Use `zod` (see `src/zod.ts`) for schema validation consistent with existing forms.

## Validation

- Run `npm run type-check` after TypeScript changes.
- Run `npm run lint` after code changes and fix new lint errors.
- Run `npm run format` when formatting is part of the change.
- For UI changes, check desktop and mobile layouts and verify the relevant loading, empty, error, and disabled states.
