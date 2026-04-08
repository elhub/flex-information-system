# SPG Show Page — Remove CU Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a per-row Remove button to the controllable unit list on the SPG
show page, gated on `service_providing_group_membership:delete` permission, with
a confirmation dialog before deletion.

**Architecture:** Extend `SpgMembershipRow` in the existing view-model to carry
`membershipId`, add a `useRemoveMembershipFromShow` mutation hook that invalidates
the show-page query cache, then add a `DeleteButton` component and an `action`
column to the show table — following the identical pattern already used in
`ExistingControllableUnitsTable.tsx`.

**Tech Stack:** React, TypeScript, TanStack Query (`useMutation`,
`useQueryClient`), react-admin `usePermissions`, existing `useConfirmAction`
hook, EDS `Button` component.

---

## File map

| File | Change |
| ---- | ------ |
| `frontend/src/service_providing_group/show/useSpgShowViewModel.ts` | Add `membershipId: number` to `SpgMembershipRow`; add `useRemoveMembershipFromShow` hook |
| `frontend/src/service_providing_group/show/ServiceProvidingGroupShowTable.tsx` | Add `canDelete` check; add `DeleteButton` component; add `action` column to `SimpleTable` |

---

### Task 1: Add `membershipId` to `SpgMembershipRow` and the view-model hook

**Files:**

- Modify: `frontend/src/service_providing_group/show/useSpgShowViewModel.ts`

- [ ] **Step 1: Add `membershipId` to the `SpgMembershipRow` type**

  Open `useSpgShowViewModel.ts`. Change the type definition (lines 10–19) from:

  ```ts
  export type SpgMembershipRow = {
    id: number;
    name: string;
    validFrom: string;
    validTo: string;
    maximum_active_power: number;
    regulation_direction: string;
    mpid: string;
    status: string;
  };
  ```

  to:

  ```ts
  export type SpgMembershipRow = {
    id: number;
    membershipId: number;
    name: string;
    validFrom: string;
    validTo: string;
    maximum_active_power: number;
    regulation_direction: string;
    mpid: string;
    status: string;
  };
  ```

- [ ] **Step 2: Populate `membershipId` in `fetchSpgShowData`**

  In the same file, the `rows` array is built at line 84. Change the object
  spread inside `controllableUnits.map(...)` from:

  ```ts
      return {
        id: cu.id,
        name: cu.name,
        validFrom: toDateString(membership?.valid_from),
        validTo: toDateString(membership?.valid_to),
        maximum_active_power: cu.maximum_active_power,
        regulation_direction: cu.regulation_direction,
        mpid: ap?.business_id ?? "-",
        status: cu.status,
      };
  ```

  to:

  ```ts
      return {
        id: cu.id,
        membershipId: membership?.id ?? 0,
        name: cu.name,
        validFrom: toDateString(membership?.valid_from),
        validTo: toDateString(membership?.valid_to),
        maximum_active_power: cu.maximum_active_power,
        regulation_direction: cu.regulation_direction,
        mpid: ap?.business_id ?? "-",
        status: cu.status,
      };
  ```

- [ ] **Step 3: Add the `useRemoveMembershipFromShow` hook**

  Add the missing imports. The file already imports `useQuery` from
  `@tanstack/react-query` and several functions from `../../generated-client`.
  Extend those imports to also include `useMutation`, `useQueryClient`, and
  `deleteServiceProvidingGroupMembership`:

  Change the existing `@tanstack/react-query` import from:

  ```ts
  import { useQuery } from "@tanstack/react-query";
  ```

  to:

  ```ts
  import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
  ```

  Change the existing `../../generated-client` import to add
  `deleteServiceProvidingGroupMembership`:

  ```ts
  import {
    deleteServiceProvidingGroupMembership,
    listAccountingPoint,
    listControllableUnit,
    listServiceProvidingGroupMembership,
    readServiceProvidingGroup,
  } from "../../generated-client";
  ```

  Then append the following hook at the end of the file:

  ```ts
  export const useRemoveMembershipFromShow = (spgId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (membershipId: number) =>
        deleteServiceProvidingGroupMembership({
          path: { id: membershipId },
        }).then(throwOnError),
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: spgShowViewModelQueryKey(spgId),
        });
      },
    });
  };
  ```

- [ ] **Step 4: Verify TypeScript compiles**

  ```bash
  cd frontend && npm run type-check
  ```

  Expected: no errors.

- [ ] **Step 5: Commit**

  ```bash
  git add frontend/src/service_providing_group/show/useSpgShowViewModel.ts
  git commit -m "feat: add membershipId to SpgMembershipRow and remove hook"
  ```

---

### Task 2: Add Remove button to the show table

**Files:**

- Modify: `frontend/src/service_providing_group/show/ServiceProvidingGroupShowTable.tsx`

- [ ] **Step 1: Add imports**

  At the top of `ServiceProvidingGroupShowTable.tsx`, add the missing imports
  alongside the existing ones:

  ```ts
  import { useConfirmAction } from "../../components/ConfirmAction";
  import { useRemoveMembershipFromShow } from "./useSpgShowViewModel";
  ```

  The existing import line for `usePermissions` and `Permissions` is already
  there. No changes needed there.

- [ ] **Step 2: Add `canDelete` permission check**

  In the component body, directly after the existing `canManageMembers` check
  (lines 22–25), add:

  ```ts
  const canDelete = permissions?.allow(
    "service_providing_group_membership",
    "delete",
  );
  ```

- [ ] **Step 3: Add the `DeleteButton` inner component**

  Add this before the `ServiceProvidingGroupShowTable` function declaration:

  ```ts
  const DeleteButton = ({
    membershipId,
    spgId,
  }: {
    membershipId: number;
    spgId: number;
  }) => {
    const { mutateAsync: removeMembership } =
      useRemoveMembershipFromShow(spgId);
    const { buttonProps, dialog } = useConfirmAction({
      title: "Delete",
      content:
        "Are you sure you want to delete this item? This action cannot be undone.",
      onConfirmMutation: {
        mutationFn: () => removeMembership(membershipId),
      },
    });

    return (
      <>
        <Button variant="caution" onClick={() => buttonProps.onClick()}>
          Remove
        </Button>
        {dialog}
      </>
    );
  };
  ```

- [ ] **Step 4: Add the `action` column to the `SimpleTable`**

  In the `return` of `ServiceProvidingGroupShowTable`, the `<SimpleTable>`
  currently looks like:

  ```tsx
      <SimpleTable
        rowClick={(row) => navigate(`/controllable_unit/${row.id}/show`)}
        size="small"
        data={data?.rows ?? []}
        columns={columns}
        className="w-full"
      />
  ```

  Change it to:

  ```tsx
      <SimpleTable
        rowClick={(row) => navigate(`/controllable_unit/${row.id}/show`)}
        size="small"
        data={data?.rows ?? []}
        columns={columns}
        className="w-full"
        action={
          canDelete
            ? {
                header: "",
                render: (row) =>
                  row.membershipId ? (
                    <DeleteButton
                      membershipId={row.membershipId}
                      spgId={spgId}
                    />
                  ) : null,
              }
            : undefined
        }
      />
  ```

- [ ] **Step 5: Verify TypeScript compiles**

  ```bash
  cd frontend && npm run type-check
  ```

  Expected: no errors.

- [ ] **Step 6: Verify lint passes**

  ```bash
  cd frontend && npm run lint
  ```

  Expected: no errors.

- [ ] **Step 7: Commit**

  ```bash
  git add frontend/src/service_providing_group/show/ServiceProvidingGroupShowTable.tsx
  git commit -m "feat: add remove button to CU list on SPG show page"
  ```
