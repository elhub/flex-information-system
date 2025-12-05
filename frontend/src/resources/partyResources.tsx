import { Resource, Create, ResourceContextProvider } from "react-admin";
import { Route } from "react-router-dom";
import { EditRedirectPreviousPage } from "./shared";
import { Permissions } from "../auth/permissions";
import { PartyList } from "../party/PartyList";
import { PartyShow } from "../party/PartyShow";
import { PartyInput } from "../party/PartyInput";
import { PartyHistoryList } from "../party/PartyHistoryList";
import { PartyMembershipShow } from "../party/membership/PartyMembershipShow";
import { PartyMembershipInput } from "../party/membership/PartyMembershipInput";
import { PartyMembershipHistoryList } from "../party/membership/PartyMembershipHistoryList";

export const createPartyResources = (permissions: Permissions) => {
  // Permission checks
  const canRead = permissions.allow("party", "read");
  const canCreate = permissions.allow("party", "create");
  const canUpdate = permissions.allow("party", "update");

  if (!canRead) return null;

  return (
    <Resource
      name="party"
      list={PartyList}
      show={PartyShow}
      edit={
        canUpdate ? (
          <EditRedirectPreviousPage>
            <PartyInput />
          </EditRedirectPreviousPage>
        ) : undefined
      }
      create={
        canCreate ? (
          <Create redirect="list">
            <PartyInput />
          </Create>
        ) : undefined
      }
      recordRepresentation="name"
    >
      {/* party history */}
      <Route path=":party_id/history" element={<PartyHistoryList />} />
      <Route
        path=":party_id/history/:id/show"
        element={
          <ResourceContextProvider value="party_history">
            <PartyShow />
          </ResourceContextProvider>
        }
      ></Route>
      {/* party membership relation */}
      {/* list is part of PTY show page */}
      <Route
        path=":party_id/membership/:id/show"
        element={
          <ResourceContextProvider value="party_membership">
            <PartyMembershipShow />
          </ResourceContextProvider>
        }
      />
      <Route
        path=":party_id/membership/create"
        element={
          <ResourceContextProvider value="party_membership">
            <Create
              redirect={(_: any, _id: any, record: any) =>
                `party/${record.party_id}/show`
              }
            >
              <PartyMembershipInput />
            </Create>
          </ResourceContextProvider>
        }
      />
      <Route
        path=":party_id/membership/:id"
        element={
          <ResourceContextProvider value="party_membership">
            <EditRedirectPreviousPage>
              <PartyMembershipInput />
            </EditRedirectPreviousPage>
          </ResourceContextProvider>
        }
      />
      {/* party membership relation history */}
      <Route
        path=":party_id/membership_history"
        element={<PartyMembershipHistoryList />}
      />
      <Route
        path=":party_id/membership_history/:id/show"
        element={
          <ResourceContextProvider value="party_membership_history">
            <PartyMembershipShow />
          </ResourceContextProvider>
        }
      />
    </Resource>
  );
};
