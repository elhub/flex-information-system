# Migrate Forms to EDS-ra Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate all remaining legacy forms (SimpleForm + MUI + legacy Toolbar/InputStack) to the ra-core + EDS-ra pattern used by `ControllableUnitInput.tsx`, and fix stray `react-admin` hook imports in partially migrated forms.

**Architecture:** Each form is rewritten in-place: `SimpleForm` → `Form` from `ra-core`, MUI layout (`Stack`, `Typography`, `Box`) → Tailwind + EDS `Heading`/`FlexDiv`/`FormContainer`, `Toolbar` → `FormToolbar`, `InputStack` → `FlexDiv`/`div` with Tailwind, legacy enum/datetime wrappers → EDS-ra equivalents, all `react-admin` imports → `ra-core` equivalents.

**Tech Stack:** React, TypeScript, ra-core, @elhub/ds-components (via `components/ui`), EDS-ra wrappers in `components/EDS-ra/inputs`, Tailwind CSS v4, Zod, react-hook-form

---

## Reference: Migrated Pattern

The canonical example is `frontend/src/controllable_unit/ControllableUnitInput.tsx`.

Key imports for every migrated form:
```tsx
import { Form, useRecordContext, useGetIdentity } from "ra-core";   // NOT react-admin
import { FormContainer, Heading, FlexDiv } from "../components/ui";
import {
  TextInput, EnumInput, AutocompleteReferenceInput, DateInput,
  FormToolbar, PartyReferenceInput,
} from "../components/EDS-ra/inputs";
import { getFields, unTypedZodResolver } from "../zod";
import { useCreateOrUpdate } from "../auth";
```

Layout replaces `<Stack direction="column" spacing={1}>` with:
```tsx
<div className="flex flex-col gap-3">...</div>
```
And `<Typography variant="h6">` with `<Heading level={3} size="medium">`.

`MidnightDateInput` → `<DateInput outputFormat="date-time" />`.

`EnumInput` from `components/enum` → `EnumInput` from `components/EDS-ra/inputs` (same `enumKey` prop, same `source` prop — drop `validate={required()}`, use `required` boolean instead).

`PasswordInput` → `<TextInput type="password" />`.

`NumberInput` → `<TextInput type="number" />`.

`ScopesInput` (from `components/scopes`) — keep as-is for now; it's a complex MUI component with no direct EDS-ra replacement yet. Wrap in `FlexDiv` but leave the component itself.

`ValidTimeTooltip` — keep as-is; it is a standalone tooltip component not linked to MUI layout.

---

## Task 1: Fix partial migrations — stray `react-admin` hook imports

**Files:**
- Modify: `frontend/src/controllable_unit/ControllableUnitCreateForm.tsx`
- Modify: `frontend/src/service_providing_group/product_application/ServiceProvidingGroupProductApplicationInput.tsx`
- Modify: `frontend/src/service_providing_group/product_suspension/ServiceProvidingGroupProductSuspensionInput.tsx`
- Modify: `frontend/src/service_provider_product_application/ServiceProviderProductApplicationInput.tsx`
- Modify: `frontend/src/service_provider_product_suspension/ServiceProviderProductSuspensionInput.tsx`

- [ ] **Step 1: Fix ControllableUnitCreateForm.tsx**

Change:
```tsx
import { useNotify } from "react-admin";
```
To:
```tsx
import { useNotify } from "ra-core";
```

- [ ] **Step 2: Fix ServiceProvidingGroupProductApplicationInput.tsx**

Change:
```tsx
import { useRecordContext } from "react-admin";
import { Form } from "ra-core";
```
To:
```tsx
import { Form, useRecordContext } from "ra-core";
```
(Remove the `react-admin` import entirely — `useRecordContext` comes from `ra-core`.)

- [ ] **Step 3: Fix ServiceProvidingGroupProductSuspensionInput.tsx**

Change:
```tsx
import { useGetIdentity, useRecordContext } from "react-admin";
import { Form } from "ra-core";
```
To:
```tsx
import { Form, useGetIdentity, useRecordContext } from "ra-core";
```

- [ ] **Step 4: Fix ServiceProviderProductApplicationInput.tsx**

Change:
```tsx
import { useGetIdentity } from "react-admin";
import { Form, useRecordContext } from "ra-core";
```
To:
```tsx
import { Form, useGetIdentity, useRecordContext } from "ra-core";
```

- [ ] **Step 5: Fix ServiceProviderProductSuspensionInput.tsx**

Change:
```tsx
import { useGetIdentity } from "react-admin";
import { Form } from "ra-core";
```
To:
```tsx
import { Form, useGetIdentity } from "ra-core";
```

- [ ] **Step 6: Type-check**

```bash
cd frontend && pnpm run type-check
```
Expected: no errors in the 5 modified files.

- [ ] **Step 7: Commit**

```bash
git add \
  frontend/src/controllable_unit/ControllableUnitCreateForm.tsx \
  frontend/src/service_providing_group/product_application/ServiceProvidingGroupProductApplicationInput.tsx \
  frontend/src/service_providing_group/product_suspension/ServiceProvidingGroupProductSuspensionInput.tsx \
  frontend/src/service_provider_product_application/ServiceProviderProductApplicationInput.tsx \
  frontend/src/service_provider_product_suspension/ServiceProviderProductSuspensionInput.tsx
git commit -m "refactor: move stray react-admin hook imports to ra-core"
```

---

## Task 2: Migrate `entity/EntityInput.tsx`

**Files:**
- Modify: `frontend/src/entity/EntityInput.tsx`

This form has custom child components (`EntityTypeInput`, `EntityBusinessIDInput`) that use `useFormContext`. Those are fine — they come from `react-hook-form` and are unchanged. The goal is to replace `SimpleForm`, MUI layout, `EnumInput` (legacy), `TextInput` (react-admin), `InputStack`, and `Toolbar`.

- [ ] **Step 1: Rewrite EntityInput.tsx**

```tsx
import { Form } from "ra-core";
import { useFormContext } from "react-hook-form";
import { useEffect } from "react";
import { zEntityCreateRequest } from "../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../zod";
import { FormContainer, Heading, FlexDiv } from "../components/ui";
import {
  TextInput,
  EnumInput,
  FormToolbar,
} from "../components/EDS-ra/inputs";

const businessIDTypeOfEntityType = (entityType: string) => {
  switch (entityType) {
    case "person":
      return "email";
    case "organisation":
      return "org";
    default:
      return null;
  }
};

const EntityTypeInput = (props: any) => {
  const formContext = useFormContext();
  const entityType = formContext.watch("type");

  useEffect(() => {
    formContext.setValue(
      "business_id_type",
      businessIDTypeOfEntityType(entityType),
    );
  });

  return (
    <EnumInput
      {...props}
      enumKey="entity.type"
      defaultValue="person"
      required
      onChange={(value: string | null) => {
        formContext.setValue(
          "business_id_type",
          businessIDTypeOfEntityType(value ?? ""),
        );
      }}
    />
  );
};

const EntityBusinessIDInput = (props: any) => {
  const formContext = useFormContext();
  const entityType = formContext.watch("type");

  // validation is handled by Zod resolver; type is shown as a hint via description
  return <TextInput {...props} />;
};

const fields = getFields(zEntityCreateRequest.shape);

export const EntityInput = () => {
  return (
    <Form resolver={unTypedZodResolver(zEntityCreateRequest)}>
      <FormContainer>
        <Heading level={3} size="medium">
          Basic information
        </Heading>
        <div className="flex flex-col gap-3">
          <EntityTypeInput source="type" />
          <EnumInput
            source="business_id_type"
            enumKey="entity.business_id_type"
            defaultValue="person"
            readOnly
          />
          <EntityBusinessIDInput source="business_id" />
          <TextInput source="name" />
        </div>
        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
```

Note: The legacy `validate={required()}` and `validate={[required(), regex(...)]}` are dropped because the Zod resolver (`zEntityCreateRequest`) handles all validation. The `label` props that used `"field.entity.*"` keys are dropped — `getFields` from `zod.ts` derives them automatically from the schema source name.

- [ ] **Step 2: Type-check**

```bash
cd frontend && pnpm run type-check
```
Expected: no errors in `entity/EntityInput.tsx`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/entity/EntityInput.tsx
git commit -m "refactor: migrate EntityInput to EDS-ra"
```

---

## Task 3: Migrate `entity/lookup/EntityLookupInput.tsx`

**Files:**
- Modify: `frontend/src/entity/lookup/EntityLookupInput.tsx`

This form has a custom inline `Toolbar` that does a custom fetch-and-navigate. The logic stays the same; we only replace the MUI `Button` and `RAToolbar` with EDS `Button` + a plain `div`, and replace `SimpleForm`/`InputStack`/`TextInput` (react-admin) with ra-core + EDS-ra.

- [ ] **Step 1: Rewrite EntityLookupInput.tsx**

```tsx
import { Form } from "ra-core";
import { useNotify } from "ra-core";
import { useNavigate, useLocation } from "react-router-dom";
import { useFormContext } from "react-hook-form";
import { apiURL, API_VERSION } from "../../httpConfig";
import { FormContainer, Heading, FlexDiv, Button } from "../../components/ui";
import { TextInput, FormToolbar } from "../../components/EDS-ra/inputs";
import { IconSearch, IconArrowLeft } from "@elhub/ds-icons";

const LookupToolbar = () => {
  const navigate = useNavigate();
  const { getValues } = useFormContext();
  const notify = useNotify();

  const {
    state: { party_id },
  } = useLocation();

  const lookup = async () => {
    const body: any = {};
    const values = getValues();

    for (const key in values) {
      if (values[key]) {
        body[key] = values[key];
      }
    }

    const response = await fetch(apiURL + "/entity/lookup", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
        "Api-Version": API_VERSION,
      }),
      body: JSON.stringify(body),
    });
    const lookupResult = await response.json();

    if (!response.ok) {
      notify(lookupResult.message, { type: "error" });
    } else {
      navigate(`/party/${party_id}/membership/create`, {
        state: {
          party_id: party_id,
          entity_id: lookupResult?.entity_id,
          showTechnicalEntityID: true,
        },
      });
    }
  };

  return (
    <div className="flex gap-3 items-center">
      <Button type="button" variant="primary" onClick={lookup}>
        Lookup
      </Button>
      <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
        Cancel
      </Button>
    </div>
  );
};

export const EntityLookupInput = () => (
  <Form>
    <FormContainer>
      <Heading level={3} size="medium">
        Lookup an entity
      </Heading>
      <div className="flex flex-col gap-3">
        <TextInput source="business_id" overrideLabel="Business ID (Person Number)" required />
        <TextInput source="name" required />
        <TextInput source="type" defaultValue="person" readOnly />
      </div>
      <LookupToolbar />
    </FormContainer>
  </Form>
);
```

Note: `IconSearch` / `IconArrowLeft` replace `TravelExploreIcon` / `UndoIcon`. Check available icons via `@elhub/ds-icons` — if these specific icons don't exist, simply omit the icon prop on `Button`.

- [ ] **Step 2: Check available EDS icons**

```bash
cd frontend && node -e "const icons = require('@elhub/ds-icons'); console.log(Object.keys(icons).filter(k => k.includes('Search') || k.includes('Arrow') || k.includes('Undo')).join('\n'))"
```

If `IconSearch` or `IconArrowLeft` are not available, remove the icon props from `Button` in the Toolbar.

- [ ] **Step 3: Type-check**

```bash
cd frontend && pnpm run type-check
```
Expected: no errors in `entity/lookup/EntityLookupInput.tsx`.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/entity/lookup/EntityLookupInput.tsx
git commit -m "refactor: migrate EntityLookupInput to EDS-ra"
```

---

## Task 4: Migrate `entity/client/EntityClientInput.tsx`

**Files:**
- Modify: `frontend/src/entity/client/EntityClientInput.tsx`

`PasswordInput` → `TextInput type="password"`, `TextInput` (react-admin) → EDS-ra `TextInput`, `InputStack` → `div className="flex flex-col gap-3"`, `Toolbar` → `FormToolbar`, `ScopesInput` kept as-is (no EDS-ra replacement).

- [ ] **Step 1: Rewrite EntityClientInput.tsx**

```tsx
import { Form, useRecordContext } from "ra-core";
import { useLocation } from "react-router-dom";
import { zEntityClientCreateRequest } from "../../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../../zod";
import { FormContainer, Heading } from "../../components/ui";
import {
  TextInput,
  AutocompleteReferenceInput,
  FormToolbar,
} from "../../components/EDS-ra/inputs";
import { ScopesInput } from "../../components/scopes";

const fields = getFields(zEntityClientCreateRequest.shape);

export const EntityClientInput = () => {
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();
  const record = { ...actualRecord, ...overrideRecord };

  return (
    <Form
      record={record}
      resolver={unTypedZodResolver(zEntityClientCreateRequest)}
      sanitizeEmptyValues
    >
      <FormContainer>
        <div className="flex flex-col gap-3">
          <AutocompleteReferenceInput
            {...fields.entity_id}
            reference="entity"
            readOnly
          />
          <TextInput {...fields.client_id} />
          <TextInput {...fields.name} />
          <AutocompleteReferenceInput
            {...fields.party_id}
            reference="party"
          />
          <ScopesInput source="scopes" label="field.entity_client.scopes" />
          <TextInput {...fields.client_secret} type="password" />
          <TextInput {...fields.public_key} />
        </div>
        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
```

Note: `public_key` used `multiline` and `minRows` in the react-admin version. The EDS-ra `TextInput` does not support multiline — use `TextAreaInput` instead if the field needs it.

- [ ] **Step 2: Check if public_key should be TextAreaInput**

If `zEntityClientCreateRequest.shape.public_key` is a long string, replace:
```tsx
<TextInput {...fields.public_key} />
```
with:
```tsx
import { TextAreaInput } from "../../components/EDS-ra/inputs";
// ...
<TextAreaInput {...fields.public_key} rows={3} />
```

- [ ] **Step 3: Type-check**

```bash
cd frontend && pnpm run type-check
```
Expected: no errors in `entity/client/EntityClientInput.tsx`.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/entity/client/EntityClientInput.tsx
git commit -m "refactor: migrate EntityClientInput to EDS-ra"
```

---

## Task 5: Migrate `party/membership/PartyMembershipInput.tsx`

**Files:**
- Modify: `frontend/src/party/membership/PartyMembershipInput.tsx`

`NumberInput` → `TextInput type="number"`, `ScopesInput` kept as-is.

- [ ] **Step 1: Rewrite PartyMembershipInput.tsx**

```tsx
import { Form, useRecordContext } from "ra-core";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { zPartyMembershipCreateRequest } from "../../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../../zod";
import { FormContainer, Heading } from "../../components/ui";
import {
  TextInput,
  AutocompleteReferenceInput,
  PartyReferenceInput,
  FormToolbar,
} from "../../components/EDS-ra/inputs";
import { ScopesInput } from "../../components/scopes";

const filterRecord = ({ party_id, entity_id, scopes }: any) => ({
  party_id,
  entity_id,
  scopes,
});

const fields = getFields(zPartyMembershipCreateRequest.shape);

export const PartyMembershipInput = () => {
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();

  const record = useMemo(
    () => filterRecord({ ...actualRecord, ...overrideRecord }),
    [actualRecord, overrideRecord],
  );

  return (
    <Form
      record={record}
      resolver={unTypedZodResolver(zPartyMembershipCreateRequest)}
      sanitizeEmptyValues
    >
      <FormContainer>
        <Heading level={3} size="medium">
          Basic information
        </Heading>
        <div className="flex flex-col gap-3">
          <PartyReferenceInput
            {...fields.party_id}
            readOnly
          />
          {overrideRecord?.showTechnicalEntityID ? (
            <TextInput
              {...fields.entity_id}
              type="number"
              readOnly
            />
          ) : (
            <AutocompleteReferenceInput
              {...fields.entity_id}
              reference="entity"
            />
          )}
          <ScopesInput source="scopes" label="field.party_membership.scopes" />
        </div>
        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
```

- [ ] **Step 2: Type-check**

```bash
cd frontend && pnpm run type-check
```
Expected: no errors in `party/membership/PartyMembershipInput.tsx`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/party/membership/PartyMembershipInput.tsx
git commit -m "refactor: migrate PartyMembershipInput to EDS-ra"
```

---

## Task 6: Migrate `system_operator_product_type/SystemOperatorProductTypeInput.tsx`

**Files:**
- Modify: `frontend/src/system_operator_product_type/SystemOperatorProductTypeInput.tsx`

`useGetIdentity` from `ra-core`, drop `required` from react-admin (Zod resolver handles it), `EnumInput` (legacy) → EDS-ra `EnumInput`, `ProductTypeInput` kept as-is (check if it already uses EDS-ra or needs no change).

- [ ] **Step 1: Check ProductTypeInput**

```bash
cat frontend/src/product_type/components.tsx
```

If `ProductTypeInput` imports from `react-admin`, note it — but do not migrate it in this task. Use it as-is.

- [ ] **Step 2: Rewrite SystemOperatorProductTypeInput.tsx**

```tsx
import { Form, useGetIdentity, useRecordContext } from "ra-core";
import { FormContainer, Heading } from "../components/ui";
import { PartyReferenceInput, useCreateOrUpdate } from "../auth";
import {
  EnumInput,
  FormToolbar,
} from "../components/EDS-ra/inputs";
import { ProductTypeInput } from "../product_type/components";
import { zSystemOperatorProductTypeCreateRequest } from "../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../zod";

const filterRecord = ({
  system_operator_id,
  product_type_id,
  status,
}: any) => ({
  system_operator_id,
  product_type_id,
  status,
});

const fields = getFields(zSystemOperatorProductTypeCreateRequest.shape);

export const SystemOperatorProductTypeInput = () => {
  const currentRecord = useRecordContext();
  const createOrUpdate = useCreateOrUpdate();

  const { data: identity, isLoading: identityLoading } = useGetIdentity();
  if (identityLoading) return <>Loading...</>;

  const isSystemOperator = identity?.role == "flex_system_operator";

  const record = filterRecord({
    ...currentRecord,
    system_operator_id:
      createOrUpdate == "create" && isSystemOperator
        ? identity?.partyID
        : currentRecord?.system_operator_id,
  });

  return (
    <Form
      record={record}
      resolver={unTypedZodResolver(zSystemOperatorProductTypeCreateRequest)}
      sanitizeEmptyValues
    >
      <FormContainer>
        <Heading level={3} size="medium">
          Basic information
        </Heading>
        <div className="flex flex-col gap-3">
          <PartyReferenceInput
            {...fields.system_operator_id}
            readOnly={isSystemOperator}
          />
          <ProductTypeInput
            source="product_type_id"
            label="field.system_operator_product_type.product_type_id"
            required
          />
          <EnumInput
            {...fields.status}
            enumKey="system_operator_product_type.status"
            required={createOrUpdate == "update"}
          />
        </div>
        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
```

Note: `PartyReferenceInput` here is imported from `../auth` (the legacy one), since `fields.system_operator_id` won't have a `reference` auto-populated. The EDS-ra `PartyReferenceInput` is in `components/EDS-ra/inputs` — use that instead and pass `reference="party"` explicitly if needed. Check the auth vs EDS-ra version and prefer EDS-ra.

- [ ] **Step 3: Resolve PartyReferenceInput import**

Check which `PartyReferenceInput` is correct:
- `components/EDS-ra/inputs/PartyReferenceInput.tsx` — EDS-ra version (use this)
- `auth/ReferenceInput.tsx` (legacy, still uses react-admin `AutocompleteInput`)

Import from EDS-ra:
```tsx
import { EnumInput, FormToolbar, PartyReferenceInput } from "../components/EDS-ra/inputs";
```
Remove the `PartyReferenceInput` from the `../auth` import.

- [ ] **Step 4: Type-check**

```bash
cd frontend && pnpm run type-check
```
Expected: no errors in `system_operator_product_type/SystemOperatorProductTypeInput.tsx`.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/system_operator_product_type/SystemOperatorProductTypeInput.tsx
git commit -m "refactor: migrate SystemOperatorProductTypeInput to EDS-ra"
```

---

## Task 7: Migrate `service_providing_group/membership/ServiceProvidingGroupMembershipInput.tsx`

**Files:**
- Modify: `frontend/src/service_providing_group/membership/ServiceProvidingGroupMembershipInput.tsx`

`MidnightDateInput` → `DateInput outputFormat="date-time"`, `ValidTimeTooltip` kept as-is (no MUI layout dependency — just embedded in a `FlexDiv`).

- [ ] **Step 1: Rewrite ServiceProvidingGroupMembershipInput.tsx**

```tsx
import { Form, useRecordContext } from "ra-core";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { zServiceProvidingGroupMembershipCreateRequest } from "../../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../../zod";
import { FormContainer, Heading, FlexDiv } from "../../components/ui";
import {
  AutocompleteReferenceInput,
  DateInput,
  FormToolbar,
} from "../../components/EDS-ra/inputs";
import { ValidTimeTooltip } from "../../components/ValidTimeTooltip";

const filterRecord = ({
  service_providing_group_id,
  controllable_unit_id,
  valid_from,
  valid_to,
}: any) => ({
  service_providing_group_id,
  controllable_unit_id,
  valid_from,
  valid_to,
});

const fields = getFields(zServiceProvidingGroupMembershipCreateRequest.shape);

export const ServiceProvidingGroupMembershipInput = () => {
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();

  const record = useMemo(
    () => filterRecord({ ...actualRecord, ...overrideRecord }),
    [actualRecord, overrideRecord],
  );

  return (
    <Form
      record={record}
      resolver={unTypedZodResolver(
        zServiceProvidingGroupMembershipCreateRequest,
      )}
      sanitizeEmptyValues
    >
      <FormContainer>
        <Heading level={3} size="medium">
          Basic information
        </Heading>
        <div className="flex flex-col gap-3">
          <AutocompleteReferenceInput
            {...fields.service_providing_group_id}
            reference="service_providing_group"
            readOnly={!!overrideRecord?.service_providing_group_id}
          />
          <AutocompleteReferenceInput
            {...fields.controllable_unit_id}
            reference="controllable_unit"
          />
        </div>

        <FlexDiv
          style={{
            gap: "var(--eds-size-2)",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Heading level={4} size="small">
            Valid time
          </Heading>
          <ValidTimeTooltip />
        </FlexDiv>

        <div className="flex flex-col gap-3">
          <DateInput {...fields.valid_from} outputFormat="date-time" />
          <DateInput {...fields.valid_to} outputFormat="date-time" />
        </div>

        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
```

- [ ] **Step 2: Type-check**

```bash
cd frontend && pnpm run type-check
```
Expected: no errors in `service_providing_group/membership/ServiceProvidingGroupMembershipInput.tsx`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/service_providing_group/membership/ServiceProvidingGroupMembershipInput.tsx
git commit -m "refactor: migrate ServiceProvidingGroupMembershipInput to EDS-ra"
```

---

## Task 8: Migrate `service_providing_group/grid_prequalification/ServiceProvidingGroupGridPrequalificationInput.tsx`

**Files:**
- Modify: `frontend/src/service_providing_group/grid_prequalification/ServiceProvidingGroupGridPrequalificationInput.tsx`

`DateTimeInput` (legacy from `components/datetime`) → EDS-ra `DateTimeInput`.

- [ ] **Step 1: Rewrite ServiceProvidingGroupGridPrequalificationInput.tsx**

```tsx
import { Form, useRecordContext } from "ra-core";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import {
  AutocompleteReferenceInput,
  DateTimeInput,
  EnumInput,
  FormToolbar,
  PartyReferenceInput,
} from "../../components/EDS-ra/inputs";
import { useCreateOrUpdate } from "../../auth";
import { zServiceProvidingGroupGridPrequalificationCreateRequest } from "../../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../../zod";
import { FormContainer, Heading } from "../../components/ui";

const filterRecord = ({
  service_providing_group_id,
  impacted_system_operator_id,
  status,
  prequalified_at,
}: any) => ({
  service_providing_group_id,
  impacted_system_operator_id,
  status,
  prequalified_at,
});

const fields = getFields(
  zServiceProvidingGroupGridPrequalificationCreateRequest.shape,
);

export const ServiceProvidingGroupGridPrequalificationInput = () => {
  const createOrUpdate = useCreateOrUpdate();
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();

  const record = useMemo(
    () => filterRecord({ ...actualRecord, ...overrideRecord }),
    [actualRecord, overrideRecord],
  );

  return (
    <Form
      record={record}
      resolver={unTypedZodResolver(
        zServiceProvidingGroupGridPrequalificationCreateRequest,
      )}
      sanitizeEmptyValues
    >
      <FormContainer>
        <Heading level={3} size="medium">
          Basic information
        </Heading>
        <div className="flex flex-col gap-3">
          <AutocompleteReferenceInput
            {...fields.service_providing_group_id}
            reference="service_providing_group"
            readOnly={!!record?.service_providing_group_id}
          />
          <PartyReferenceInput
            {...fields.impacted_system_operator_id}
            filter={{ type: "system_operator" }}
          />
          <EnumInput
            {...fields.status}
            enumKey="service_providing_group_grid_prequalification.status"
            required={createOrUpdate == "update"}
          />
          <DateTimeInput {...fields.prequalified_at} />
        </div>
        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
```

- [ ] **Step 2: Type-check**

```bash
cd frontend && pnpm run type-check
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/service_providing_group/grid_prequalification/ServiceProvidingGroupGridPrequalificationInput.tsx
git commit -m "refactor: migrate ServiceProvidingGroupGridPrequalificationInput to EDS-ra"
```

---

## Task 9: Migrate `service_providing_group/grid_suspension/ServiceProvidingGroupGridSuspensionInput.tsx`

**Files:**
- Modify: `frontend/src/service_providing_group/grid_suspension/ServiceProvidingGroupGridSuspensionInput.tsx`

- [ ] **Step 1: Rewrite ServiceProvidingGroupGridSuspensionInput.tsx**

```tsx
import { Form, useGetIdentity, useRecordContext } from "ra-core";
import {
  AutocompleteReferenceInput,
  EnumInput,
  FormToolbar,
  PartyReferenceInput,
} from "../../components/EDS-ra/inputs";
import {
  ServiceProvidingGroupGridSuspension,
  ServiceProvidingGroupGridSuspensionCreateRequest,
  ServiceProvidingGroupGridSuspensionUpdateRequest,
} from "../../generated-client";
import useLocationState from "../../hooks/useLocationState";
import {
  zServiceProvidingGroupGridSuspension,
  zServiceProvidingGroupGridSuspensionCreateRequest,
} from "../../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../../zod";
import { FormContainer, Heading } from "../../components/ui";

export type ServiceProvidingGroupGridSuspensionLocationState = {
  spggs: Partial<ServiceProvidingGroupGridSuspension>;
};

const fields = getFields(
  zServiceProvidingGroupGridSuspensionCreateRequest.shape,
);

export const ServiceProvidingGroupGridSuspensionInput = () => {
  const locationState =
    useLocationState<ServiceProvidingGroupGridSuspensionLocationState>();
  const overrideRecord = zServiceProvidingGroupGridSuspension
    .partial()
    .safeParse(locationState?.spggs ?? {});

  const actualRecord = useRecordContext<ServiceProvidingGroupGridSuspension>();
  const { data: identity } = useGetIdentity();
  const isSystemOperator = identity?.role == "flex_system_operator";

  const record:
    | ServiceProvidingGroupGridSuspensionCreateRequest
    | ServiceProvidingGroupGridSuspensionUpdateRequest = {
    ...actualRecord,
    ...overrideRecord,
  };

  return (
    <Form
      record={record}
      resolver={unTypedZodResolver(
        zServiceProvidingGroupGridSuspensionCreateRequest,
      )}
      sanitizeEmptyValues
    >
      <FormContainer>
        <Heading level={3} size="medium">
          Basic information
        </Heading>
        <div className="flex flex-col gap-3">
          <AutocompleteReferenceInput
            {...fields.service_providing_group_id}
            reference="service_providing_group"
            readOnly={
              "service_providing_group_id" in record &&
              !!record.service_providing_group_id
            }
          />
          {!isSystemOperator && (
            <PartyReferenceInput
              {...fields.impacted_system_operator_id}
              filter={{ type: "system_operator" }}
            />
          )}
        </div>
        <Heading level={3} size="medium">
          Grid suspension process
        </Heading>
        <div className="flex flex-col gap-3">
          <EnumInput
            {...fields.reason}
            enumKey="service_providing_group_grid_suspension.reason"
            required
          />
        </div>
        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
```

- [ ] **Step 2: Type-check**

```bash
cd frontend && pnpm run type-check
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/service_providing_group/grid_suspension/ServiceProvidingGroupGridSuspensionInput.tsx
git commit -m "refactor: migrate ServiceProvidingGroupGridSuspensionInput to EDS-ra"
```

---

## Task 10: Migrate `controllable_unit/suspension/ControllableUnitSuspensionInput.tsx`

**Files:**
- Modify: `frontend/src/controllable_unit/suspension/ControllableUnitSuspensionInput.tsx`

- [ ] **Step 1: Rewrite ControllableUnitSuspensionInput.tsx**

```tsx
import { Form, useGetIdentity, useRecordContext } from "ra-core";
import {
  AutocompleteReferenceInput,
  EnumInput,
  FormToolbar,
  PartyReferenceInput,
} from "../../components/EDS-ra/inputs";
import { ControllableUnitSuspension } from "../../generated-client";
import useLocationState from "../../hooks/useLocationState";
import {
  zControllableUnitSuspension,
  zControllableUnitSuspensionCreateRequest,
} from "../../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../../zod";
import { FormContainer, Heading } from "../../components/ui";

export type ControllableUnitSuspensionLocationState = {
  cus?: Partial<ControllableUnitSuspension>;
};

const fields = getFields(zControllableUnitSuspensionCreateRequest.shape);

export const ControllableUnitSuspensionInput = () => {
  const locationState =
    useLocationState<ControllableUnitSuspensionLocationState>();
  const overrideRecord = zControllableUnitSuspension
    .partial()
    .parse(locationState?.cus);
  const actualRecord = useRecordContext();
  const { data: identity } = useGetIdentity();
  const isSystemOperator = identity?.role == "flex_system_operator";

  const record = {
    ...actualRecord,
    ...overrideRecord,
  };

  return (
    <Form
      record={record}
      resolver={unTypedZodResolver(zControllableUnitSuspensionCreateRequest)}
      sanitizeEmptyValues
    >
      <FormContainer>
        <Heading level={3} size="medium">
          Basic information
        </Heading>
        <div className="flex flex-col gap-3">
          <AutocompleteReferenceInput
            {...fields.controllable_unit_id}
            reference="controllable_unit"
            readOnly={!!record?.controllable_unit_id}
          />
          {!isSystemOperator && (
            <PartyReferenceInput
              {...fields.impacted_system_operator_id}
              filter={{ type: "system_operator" }}
            />
          )}
        </div>
        <Heading level={3} size="medium">
          Controllable unit suspension process
        </Heading>
        <div className="flex flex-col gap-3">
          <EnumInput
            {...fields.reason}
            enumKey="controllable_unit_suspension.reason"
            required
          />
        </div>
        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
```

- [ ] **Step 2: Type-check**

```bash
cd frontend && pnpm run type-check
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/controllable_unit/suspension/ControllableUnitSuspensionInput.tsx
git commit -m "refactor: migrate ControllableUnitSuspensionInput to EDS-ra"
```

---

## Task 11: Fix `controllable_unit/ControllableUnitCreate.tsx`

**Files:**
- Modify: `frontend/src/controllable_unit/ControllableUnitCreate.tsx`

This file wraps `ControllableUnitCreateForm` in `<Create>` from `react-admin`. The `Create` shell is only needed to set up the react-admin `RecordContext` and resource context — but `ControllableUnitCreateForm` doesn't use `useRecordContext` and handles its own submission manually. Remove the `Create` wrapper and use `CreateBase` from `ra-core` instead (which provides context without MUI scaffolding), or simply remove it if `ControllableUnitCreateForm` doesn't need it.

- [ ] **Step 1: Check if Create wrapper is needed**

`ControllableUnitCreateForm` accepts `accountingPointId`, `endUserId`, `accountingPointBusinessId` as props and calls `createControllableUnit` directly — it does not call `useRecordContext` or `save`. The `Create` wrapper is not needed.

- [ ] **Step 2: Rewrite ControllableUnitCreate.tsx**

```tsx
import { ControllableUnitCreateForm } from "./ControllableUnitCreateForm";
import { useSearchParams } from "react-router-dom";
import { Alert } from "../components/ui";
import z from "zod";

const zControllableUnitCreateParams = z.object({
  accounting_point_id: z.coerce.number(),
  end_user_id: z.coerce.number(),
  accounting_point_business_id: z.string().optional(),
});

const ControllableUnitCreate = () => {
  const [searchParams] = useSearchParams();
  const accountingPointIdParam = searchParams.get("accounting_point_id");
  const endUserIdParam = searchParams.get("end_user_id");
  const accountingPointBusinessIdParam = searchParams.get(
    "accounting_point_business_id",
  );
  const createParams = zControllableUnitCreateParams.safeParse({
    accounting_point_id: accountingPointIdParam,
    end_user_id: endUserIdParam,
    accounting_point_business_id: accountingPointBusinessIdParam ?? undefined,
  });
  if (!createParams.success) {
    return (
      <Alert variant="error">
        Missing accounting point or end user. Please start from the lookup page.
      </Alert>
    );
  }

  const { accounting_point_id, end_user_id, accounting_point_business_id } =
    createParams.data;

  return (
    <ControllableUnitCreateForm
      accountingPointId={accounting_point_id}
      endUserId={end_user_id}
      accountingPointBusinessId={accounting_point_business_id}
    />
  );
};

export default ControllableUnitCreate;
```

- [ ] **Step 3: Type-check**

```bash
cd frontend && pnpm run type-check
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/controllable_unit/ControllableUnitCreate.tsx
git commit -m "refactor: remove react-admin Create wrapper from ControllableUnitCreate"
```

---

## Task 12: Final lint and build verification

- [ ] **Step 1: Run linter**

```bash
cd frontend && pnpm run lint
```
Expected: no errors (warnings acceptable). Fix any `react-admin` import violations flagged by ESLint.

- [ ] **Step 2: Run type-check**

```bash
cd frontend && pnpm run type-check
```
Expected: 0 errors.

- [ ] **Step 3: Build**

```bash
cd frontend && pnpm run build
```
Expected: successful build with no errors.

- [ ] **Step 4: Commit any lint fixes**

```bash
git add -u
git commit -m "style: fix lint issues after EDS-ra form migration"
```
