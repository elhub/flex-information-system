import { Resource, Create, ResourceContextProvider } from "react-admin";
import { Route, Navigate } from "react-router-dom";
import { JSX } from "react";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { EditRedirectPreviousPage, CreateRedirectPreviousPage } from "./shared";
import { Permissions } from "../auth/permissions";
import { ControllableUnitList } from "../controllable_unit/ControllableUnitList";
import { ControllableUnitShow } from "../controllable_unit/show/ControllableUnitShow";
import { ControllableUnitInput } from "../controllable_unit/ControllableUnitInput";
import { ControllableUnitLookupInput } from "../controllable_unit/lookup/ControllableUnitLookupInput";
import { ControllableUnitLookupResult } from "../controllable_unit/lookup/ControllableUnitLookupResult";
import { ControllableUnitHistoryList } from "../controllable_unit/ControllableUnitHistoryList";
import { ControllableUnitSuspensionInput } from "../controllable_unit/suspension/ControllableUnitSuspensionInput";
import { ControllableUnitSuspensionShow } from "../controllable_unit/suspension/ControllableUnitSuspensionShow";
import { ControllableUnitSuspensionHistoryList } from "../controllable_unit/suspension/ControllableUnitSuspensionHistoryList";
import { ControllableUnitServiceProviderShow } from "../controllable_unit/service_provider/ControllableUnitServiceProviderShow";
import { ControllableUnitServiceProviderInput } from "../controllable_unit/service_provider/ControllableUnitServiceProviderInput";
import { ControllableUnitServiceProviderHistoryList } from "../controllable_unit/service_provider/ControllableUnitServiceProviderHistoryList";
import { TechnicalResourceShow } from "../controllable_unit/technical_resource/TechnicalResourceShow";
import { TechnicalResourceInput } from "../controllable_unit/technical_resource/TechnicalResourceInput";
import { TechnicalResourceHistoryList } from "../controllable_unit/technical_resource/TechnicalResourceHistoryList";
import {
  CommentShow,
  CommentInput,
  CommentHistoryList,
} from "../components/comments";
import { ControllableUnitSuspensionList } from "../controllable_unit";
import { ControllableUnitServiceProviderList } from "../controllable_unit/service_provider/ControllableUnitServiceProviderList";
import { ControllableUnitBalanceResponsiblePartyList } from "../controllable_unit/balance_responsible_party/ControllableUnitBalanceResponsiblePartyList";
import ControllableUnitCreate from "../controllable_unit/ControllableUnitCreate";

export const createControllableUnitResources = (permissions: Permissions) => {
  const resources: JSX.Element[] = [];

  // Permission checks
  const canRead = permissions.allow("controllable_unit", "read");
  const canCreate = permissions.allow("controllable_unit", "create");
  const canUpdate = permissions.allow("controllable_unit", "update");

  if (canRead) {
    resources.push(
      <Resource
        key="controllable_unit"
        name="controllable_unit"
        list={ControllableUnitList}
        show={
          <ResourceContextProvider value="controllable_unit">
            <ControllableUnitShow />
          </ResourceContextProvider>
        }
        icon={BookmarkIcon}
        edit={
          canUpdate ? (
            <EditRedirectPreviousPage>
              <ControllableUnitInput />
            </EditRedirectPreviousPage>
          ) : undefined
        }
        create={canCreate ? <ControllableUnitInput /> : undefined}
        recordRepresentation="name"
      >
        {/* lookup */}
        <Route path="lookup" element={<ControllableUnitLookupInput />} />
        <Route
          path="lookup/result"
          element={<ControllableUnitLookupResult />}
        />
        <Route path="/lookup/create" element={<ControllableUnitCreate />} />
        {/* controllable unit history */}
        <Route
          path=":controllable_unit_id/history"
          element={<ControllableUnitHistoryList />}
        />
        <Route
          path=":controllable_unit_id/history/:id/show"
          element={
            <ResourceContextProvider value="controllable_unit_history">
              <ControllableUnitShow />
            </ResourceContextProvider>
          }
        />
        {/* controllable unit suspension */}
        <Route
          path=":controllable_unit_id/suspension/create"
          element={
            <ResourceContextProvider value="controllable_unit_suspension">
              <CreateRedirectPreviousPage>
                <ControllableUnitSuspensionInput />
              </CreateRedirectPreviousPage>
            </ResourceContextProvider>
          }
        />
        <Route
          path=":controllable_unit_id/suspension"
          element={<ControllableUnitSuspensionList />}
        />

        <Route
          path=":controllable_unit_id/suspension_history"
          element={<ControllableUnitSuspensionHistoryList />}
        />
        <Route
          path=":controllable_unit_id/suspension_history/:id/show"
          element={
            <ResourceContextProvider value="controllable_unit_suspension_history">
              <ControllableUnitSuspensionShow />
            </ResourceContextProvider>
          }
        />
        <Route
          path=":controllable_unit_id/suspension/:id"
          element={
            <ResourceContextProvider value="controllable_unit_suspension">
              <EditRedirectPreviousPage>
                <ControllableUnitSuspensionInput />
              </EditRedirectPreviousPage>
            </ResourceContextProvider>
          }
        />
        <Route
          path=":controllable_unit_id/suspension/:id/show"
          element={
            <ResourceContextProvider value="controllable_unit_suspension">
              <ControllableUnitSuspensionShow />
            </ResourceContextProvider>
          }
        />
        {/* controllable unit suspension comments */}
        <Route
          path=":controllable_unit_id/suspension/:controllable_unit_suspension_id/comment/:id/show"
          element={
            <ResourceContextProvider value="controllable_unit_suspension_comment">
              <CommentShow />
            </ResourceContextProvider>
          }
        />
        <Route
          path=":controllable_unit_id/suspension/:controllable_unit_suspension_id/comment/create"
          element={
            <ResourceContextProvider value="controllable_unit_suspension_comment">
              <CreateRedirectPreviousPage>
                <CommentInput />
              </CreateRedirectPreviousPage>
            </ResourceContextProvider>
          }
        />
        <Route
          path=":controllable_unit_id/suspension/:controllable_unit_suspension_id/comment/:id"
          element={
            <ResourceContextProvider value="controllable_unit_suspension_comment">
              <EditRedirectPreviousPage>
                <CommentInput />
              </EditRedirectPreviousPage>
            </ResourceContextProvider>
          }
        />
        <Route
          path=":controllable_unit_id/suspension/:controllable_unit_suspension_id/comment_history"
          element={<CommentHistoryList />}
        />
        <Route
          path=":controllable_unit_id/suspension/:controllable_unit_suspension_id/comment_history/:id/show"
          element={
            <ResourceContextProvider value="controllable_unit_suspension_comment_history">
              <CommentShow />
            </ResourceContextProvider>
          }
        />
        {/* controllable unit service provider relation */}
        <Route
          path=":controllable_unit_id/service_provider"
          element={<ControllableUnitServiceProviderList />}
        />
        <Route
          path=":controllable_unit_id/service_provider/:id/show"
          element={
            <ResourceContextProvider value="controllable_unit_service_provider">
              <ControllableUnitServiceProviderShow />
            </ResourceContextProvider>
          }
        />
        <Route
          path=":controllable_unit_id/service_provider/create"
          element={
            <ResourceContextProvider value="controllable_unit_service_provider">
              <Create
                redirect={(_: any, _id: any, record: any) =>
                  `controllable_unit/${record.controllable_unit_id}/show`
                }
              >
                <ControllableUnitServiceProviderInput />
              </Create>
            </ResourceContextProvider>
          }
        />
        <Route
          path=":controllable_unit_id/service_provider/:id"
          element={
            <ResourceContextProvider value="controllable_unit_service_provider">
              <EditRedirectPreviousPage>
                <ControllableUnitServiceProviderInput />
              </EditRedirectPreviousPage>
            </ResourceContextProvider>
          }
        />
        <Route
          path=":controllable_unit_id/service_provider_history"
          element={<ControllableUnitServiceProviderHistoryList />}
        />
        <Route
          path=":controllable_unit_id/service_provider_history/:id/show"
          element={
            <ResourceContextProvider value="controllable_unit_service_provider_history">
              <ControllableUnitServiceProviderShow />
            </ResourceContextProvider>
          }
        />
        {/* technical resource */}
        <Route
          path=":controllable_unit_id/technical_resource"
          element={<Navigate to="../show" relative="path" replace={true} />}
        />
        <Route
          path=":controllable_unit_id/technical_resource/:id/show"
          element={
            <ResourceContextProvider value="technical_resource">
              <TechnicalResourceShow />
            </ResourceContextProvider>
          }
        />
        <Route
          path=":controllable_unit_id/technical_resource/create"
          element={
            <ResourceContextProvider value="technical_resource">
              <Create
                redirect={(_: any, _id: any, record: any) =>
                  `controllable_unit/${record.controllable_unit_id}/show`
                }
              >
                <TechnicalResourceInput />
              </Create>
            </ResourceContextProvider>
          }
        />
        <Route
          path=":controllable_unit_id/technical_resource/:id"
          element={
            <ResourceContextProvider value="technical_resource">
              <EditRedirectPreviousPage>
                <TechnicalResourceInput />
              </EditRedirectPreviousPage>
            </ResourceContextProvider>
          }
        />
        <Route
          path=":controllable_unit_id/technical_resource_history"
          element={<TechnicalResourceHistoryList />}
        />
        <Route
          path=":controllable_unit_id/technical_resource_history/:id/show"
          element={
            <ResourceContextProvider value="technical_resource_history">
              <TechnicalResourceShow />
            </ResourceContextProvider>
          }
        />
        <Route
          path=":controllable_unit_id/balance_responsible_party"
          element={
            <ResourceContextProvider value="controllable_unit">
              <ControllableUnitBalanceResponsiblePartyList />
            </ResourceContextProvider>
          }
        />
      </Resource>,
    );
  }

  // CUSP and CU suspension also need to exist as standalone resources
  // (access with flat URL)

  const canReadCUSP = permissions.allow(
    "controllable_unit_service_provider",
    "read",
  );
  const canCreateCUSP = permissions.allow(
    "controllable_unit_service_provider",
    "create",
  );

  if (canReadCUSP) {
    resources.push(
      <Resource
        key="controllable_unit_service_provider"
        name="controllable_unit_service_provider"
        list={ControllableUnitServiceProviderList}
        show={ControllableUnitServiceProviderShow}
        create={
          canCreateCUSP ? (
            <Create redirect={() => `controllable_unit`}>
              <ControllableUnitServiceProviderInput />
            </Create>
          ) : (
            (null as any)
          )
        }
      />,
    );
  }

  const canReadCUS = permissions.allow("controllable_unit_suspension", "read");
  const canCreateCUS = permissions.allow(
    "controllable_unit_suspension",
    "create",
  );

  if (canReadCUS) {
    resources.push(
      <Resource
        key="controllable_unit_suspension"
        name="controllable_unit_suspension"
        list={ControllableUnitSuspensionList}
        show={ControllableUnitSuspensionShow}
        create={
          canCreateCUS ? (
            <CreateRedirectPreviousPage>
              <ControllableUnitSuspensionInput />
            </CreateRedirectPreviousPage>
          ) : (
            (null as any)
          )
        }
      >
        {/* controllable unit suspension history */}
        <Route
          path=":controllable_unit_suspension_id/history"
          element={<ControllableUnitSuspensionHistoryList />}
        />
        <Route
          path=":controllable_unit_suspension_id/history/:id/show"
          element={
            <ResourceContextProvider value="controllable_unit_suspension_history">
              <ControllableUnitSuspensionShow />
            </ResourceContextProvider>
          }
        />
      </Resource>,
    );
  }

  return resources;
};
