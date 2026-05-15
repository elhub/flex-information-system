# Design: Richer TR Empty State in CU Show (FLEX-1195)

## Summary

Replace the plain-text empty state in the Technical Resource list on the CU show
page with a richer, styled block that explains what a technical resource is and
why one is required.

## Change

**File:** `frontend/src/controllable_unit/technical_resource/TechnicalResourceList.tsx`

Replace the plain string passed as the `empty` prop to `SimpleTable` with a `ReactNode`
using EDS primitives (`Heading`, `BodyText`):

```tsx
empty={
  <div className="flex flex-col gap-2 py-4">
    <Heading level={3}>No technical resources</Heading>
    <BodyText>
      A technical resource represents a physical device or asset (such as a battery,
      generator, or flexible load) that provides the actual controllable capacity.
    </BodyText>
    <BodyText>
      To set the controllable unit as active, at least one technical resource is required.
    </BodyText>
  </div>
}
```

## Out of Scope

- `ControllableUnitAlerts.tsx` is not changed — the alert for the zero-TR case remains.
- No new components are introduced.
- No create/link button is added to the empty state.
