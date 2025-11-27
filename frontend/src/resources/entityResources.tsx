import { Resource, Create, ResourceContextProvider } from "react-admin";
import { Route } from "react-router-dom";
import { EditRedirectPreviousPage } from "./shared";
import { EntityList } from "../entity/EntityList";
import { EntityShow } from "../entity/EntityShow";
import { EntityInput } from "../entity/EntityInput";
import { EntityLookupInput } from "../entity/lookup/EntityLookupInput";
import { EntityClientShow } from "../entity/client/EntityClientShow";
import { EntityClientInput } from "../entity/client/EntityClientInput";

export const createEntityResources = (permissions: string[]) => {
  if (!permissions.includes("entity.read")) return null;

  return (
    <Resource
      name="entity"
      list={EntityList}
      show={EntityShow}
      create={
        permissions.includes("entity.create") ? (
          <Create redirect="list">
            <EntityInput />
          </Create>
        ) : (
          (null as any)
        )
      }
      edit={
        permissions.includes("entity.update") ? (
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
