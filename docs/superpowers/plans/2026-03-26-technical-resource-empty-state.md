# Technical Resource List Empty State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a permission-aware empty state to the technical resource list,
with a "Create technical resource" button for users who can create, mirroring
the SPG controllable units empty state pattern.

**Architecture:** Add an `emptyNode?: ReactNode` prop to the shared `Datagrid`
component so callers can supply a custom empty state. `TechnicalResourceList`
passes an empty state node containing a message and an optional create button.

**Tech Stack:** React, TypeScript, ra-core (`useListContext`), react-router-dom
(`Link`), EDS Button/BodyText components.

---

## Task 1: Add `emptyNode` prop to `Datagrid` and `DataTable`

**Files:**

- Modify: `frontend/src/components/EDS-ra/list/Datagrid.tsx`

- [ ] **Step 1: Add `emptyNode` to `DatagridProps` and thread it to `DataTable`**

  Replace the type definitions and `Datagrid` component in
  `frontend/src/components/EDS-ra/list/Datagrid.tsx`:

  ```tsx
  type DatagridProps = {
    children: ReactNode;
    empty?: boolean;
    emptyNode?: ReactNode;
    rowClick?: false | ((record: RaRecord) => string);
  };

  export const Datagrid = <T extends RaRecord>({
    children,
    empty,
    emptyNode,
    rowClick,
  }: DatagridProps) => {
    const { data: listData, isLoading } = useListContext<T>();
    const data = listData ?? [];

    if (isLoading) {
      return <Loader />;
    }

    return (
      <DataTable<T> data={data} empty={empty} emptyNode={emptyNode} rowClick={rowClick}>
        {children}
      </DataTable>
    );
  };
  ```

- [ ] **Step 2: Add `emptyNode` to `DataTableProps` and use it in the empty check**

  Replace `DataTableProps` and the relevant section of `DataTable`:

  ```tsx
  type DataTableProps<T extends RaRecord = RaRecord> = {
    children: ReactNode;
    empty?: boolean;
    emptyNode?: ReactNode;
    rowClick?: false | ((record: RaRecord) => string);
    data: T[];
  };

  export const DataTable = <T extends RaRecord>({
    children,
    empty,
    emptyNode,
    rowClick,
    data,
  }: DataTableProps<T>) => {
  ```

  And replace the empty-state guard (line 84-86) with:

  ```tsx
  if (data.length === 0 && empty !== false) {
    return emptyNode ? <>{emptyNode}</> : <BodyText>No results</BodyText>;
  }
  ```

- [ ] **Step 3: Verify TypeScript compiles**

  Run from `frontend/`:

  ```bash
  npm run type-check
  ```

  Expected: no errors.

- [ ] **Step 4: Commit**

  ```bash
  git add frontend/src/components/EDS-ra/list/Datagrid.tsx
  git commit -m "feat: add emptyNode prop to Datagrid for custom empty states"
  ```

---

## Task 2: Add empty state to `TechnicalResourceList`

**Files:**

- Modify: `frontend/src/controllable_unit/technical_resource/TechnicalResourceList.tsx`

- [ ] **Step 1: Build the `emptyNode` and pass it to `<Datagrid>`**

  The `locationState` variable already exists in the `CreateButton` component.
  We need the same data in `TechnicalResourceList` for the empty state button.
  Update `TechnicalResourceList` as follows:

  ```tsx
  export const TechnicalResourceList = () => {
    const { id } = useRecordContext()!;
    const { permissions } = usePermissions<Permissions>();

    const canRead = permissions?.allow("technical_resource", "read");
    const canDelete = permissions?.allow("technical_resource", "delete");
    const canCreate = permissions?.allow("technical_resource", "create");

    const actions = canCreate
      ? [<CreateButton key="create" controllableUnitId={id} />]
      : [];

    const fields = getFields(zTechnicalResource.shape);

    const locationState: TechnicalResourceInputLocationState = {
      technicalResource: {
        controllable_unit_id: Number(id),
      },
    };

    const emptyNode = (
      <div className="flex flex-col items-start gap-2">
        <BodyText>No technical resources yet.</BodyText>
        {canCreate ? (
          <Button
            as={RouterLink}
            to={`/controllable_unit/${id}/technical_resource/create`}
            state={locationState}
            variant="invisible"
            icon={IconPlus}
          >
            Create technical resource
          </Button>
        ) : null}
      </div>
    );

    return (
      canRead && (
        <ResourceContextProvider value="technical_resource">
          <List
            actions={actions}
            pagination={false}
            perPage={10}
            exporter={false}
            filter={{ controllable_unit_id: id }}
            sort={{ field: "id", order: "DESC" }}
            disableSyncWithLocation
          >
            <Datagrid
              emptyNode={emptyNode}
              rowClick={(record) =>
                `/controllable_unit/${record.controllable_unit_id}/technical_resource/${record.id}/show`
              }
            >
              <TextField source={fields.id.source} />
              <TextField source={fields.name.source} />
              <TextField source={fields.maximum_active_power.source} />
              <EnumField
                source={fields.device_type.source}
                enumKey="device_type"
              />
              {canDelete && <DeleteButton label="Delete" />}
            </Datagrid>
          </List>
        </ResourceContextProvider>
      )
    );
  };
  ```

  Notes:

    - `empty={false}` is removed from `<List>` — no longer needed since
      `Datagrid` handles the empty state via `emptyNode`.
    - `BodyText` must be imported from `../../components/ui`. The existing
      import line already imports `Button` and `Heading` from there — add
      `BodyText` to that same import if it is not already present.

- [ ] **Step 2: Verify TypeScript compiles**

  Run from `frontend/`:

  ```bash
  npm run type-check
  ```

  Expected: no errors.

- [ ] **Step 3: Run the linter**

  Run from `frontend/`:

  ```bash
  npm run lint
  ```

  Expected: no errors.

- [ ] **Step 4: Commit**

  ```bash
  git add frontend/src/controllable_unit/technical_resource/TechnicalResourceList.tsx
  git commit -m "feat: add empty state to TechnicalResourceList"
  ```
