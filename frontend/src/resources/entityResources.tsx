import { Resource, Create, ResourceContextProvider } from "react-admin";
import { Route } from "react-router-dom";
import { EditRedirectPreviousPage } from "./shared";
import { Permissions } from "../auth/permissions";
import { EntityList } from "../entity/EntityList";
import { EntityShow } from "../entity/EntityShow";
import { EntityInput } from "../entity/EntityInput";
import { EntityLookupInput } from "../entity/lookup/EntityLookupInput";
import { EntityClientShow } from "../entity/client/EntityClientShow";
import { EntityClientInput } from "../entity/client/EntityClientInput";

export const createEntityResources = (permissions: Permissions) => {
  // Permission checks
  const canRead = permissions.allow("entity", "read");
  const canCreate = permissions.allow("entity", "create");
  const canUpdate = permissions.allow("entity", "update");

  if (!canRead) return null;

  return (
    <Resource
      name="entity"
      list={EntityList}
      show={EntityShow}
      create={
        canCreate ? (
          <Create redirect="list">
            <EntityInput />
          </Create>
        ) : (
          (null as any)
        )
      }
      edit={
        canUpdate ? (
          <EditRedirectPreviousPage>
            <EntityInput />
          </EditRedirectPreviousPage>
        ) : (
          (null as any)
        )
      }
      recordRepresentation="name"
    >
      {/* lookup */}
      <Route path="lookup" element={<EntityLookupInput />} />
      {/* client subresource */}
      {/* list is part of ENT show page */}
      <Route
        path=":entity_id/client/:id/show"
        element={
          <ResourceContextProvider value="entity_client">
            <EntityClientShow />
          </ResourceContextProvider>
        }
      />
      <Route
        path=":entity_id/client/create"
        element={
          <ResourceContextProvider value="entity_client">
            <Create
              redirect={(_: any, _id: any, record: any) =>
                `entity/${record.entity_id}/show`
              }
            >
              <EntityClientInput />
            </Create>
          </ResourceContextProvider>
        }
      />
      <Route
        path=":entity_id/client/:id"
        element={
          <ResourceContextProvider value="entity_client">
            <EditRedirectPreviousPage>
              <EntityClientInput />
            </EditRedirectPreviousPage>
          </ResourceContextProvider>
        }
      />
    </Resource>
  );
};
