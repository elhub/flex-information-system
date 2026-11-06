import {
  AuthProvider,
  fetchUtils,
  getStorage,
  UserIdentity,
} from "react-admin";
import { QueryClient } from "@tanstack/react-query";
import permissions from "./permissions";
import { authURL } from "../httpConfig";
import type { PartyRole } from "../generated-client/types.gen";

import anonymous_avatar from "./avatars/ANO.png";
import balance_responsible_party_avatar from "./avatars/BRP.png";
import end_user_avatar from "./avatars/EU.png";
import energy_supplier_avatar from "./avatars/ES.png";
import entity_avatar from "./avatars/ENT.png";
import flexibility_information_system_operator_avatar from "./avatars/FISO.png";
import market_operator_avatar from "./avatars/MO.png";
import organisation_avatar from "./avatars/ORG.png";
import service_provider_avatar from "./avatars/SP.png";
import system_operator_avatar from "./avatars/SO.png";
import third_party_avatar from "./avatars/TP.png";

const toDataURL = (url: string) =>
  fetch(url)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }),
    );

const roleAvatars: any = {
  flex_anonymous: anonymous_avatar,
  flex_balance_responsible_party: balance_responsible_party_avatar,
  flex_energy_supplier: energy_supplier_avatar,
  flex_end_user: end_user_avatar,
  flex_entity: entity_avatar,
  flex_flexibility_information_system_operator:
    flexibility_information_system_operator_avatar,
  flex_market_operator: market_operator_avatar,
  flex_organisation: organisation_avatar,
  flex_service_provider: service_provider_avatar,
  flex_system_operator: system_operator_avatar,
  flex_third_party: third_party_avatar,
};

export const sessionInfoKey = "flexSession";

interface FlexIdentityBase extends UserIdentity {
  id: string;
  entityID: number;
  entityName: string;
  fullName: string;
  avatar: string;
}

// Identity where a party has been assumed (all PartyRole roles).
export interface FlexPartyIdentity extends FlexIdentityBase {
  role: PartyRole;
  partyID: number;
  partyName?: string;
}

// Identity without an assumed party (entity-level or anonymous access).
interface FlexEntityIdentity extends FlexIdentityBase {
  role: "flex_anonymous" | "flex_entity";
  partyID?: never;
  partyName?: never;
}

export type FlexIdentity = FlexPartyIdentity | FlexEntityIdentity;

let storageListenerRegistered = false;

export function authProvider(queryClient: QueryClient): AuthProvider {
  // when another tab assumes/unassumes a party (or logs out), refresh this tab
  if (!storageListenerRegistered) {
    storageListenerRegistered = true;
    window.addEventListener("storage", (event) => {
      if (event.key !== null && event.key !== sessionInfoKey) return;
      queryClient.invalidateQueries({ queryKey: ["auth"] });

      // follow the other tab: unassumed -> assume page, assumed -> dashboard
      try {
        const before = event.oldValue ? JSON.parse(event.oldValue) : null;
        const after = event.newValue ? JSON.parse(event.newValue) : null;
        if (!before || !after) return;
        if (before.party_id === after.party_id) return;
        window.location.hash =
          after.party_id === undefined ? "#/login/assumeParty" : "#/";
      } catch {
        // ignore malformed values
      }
    });
  }

  const getIdentity = async () => {
    const sessionInfoString = getStorage().getItem(sessionInfoKey);
    if (!sessionInfoString) return Promise.reject();

    const sessionInfo = JSON.parse(sessionInfoString);

    const role = sessionInfo["role"];
    const entity_name = sessionInfo["entity_name"];
    const party_name = sessionInfo["party_name"];

    const avatar = await toDataURL(roleAvatars[role]);

    return Promise.resolve<FlexIdentity>({
      id: sessionInfo["sub"],
      entityID: sessionInfo["entity_id"],
      entityName: entity_name,
      partyID: sessionInfo["party_id"],
      partyName: party_name,
      fullName: party_name ? `${entity_name} as ${party_name}` : entity_name,
      role: role,
      avatar: avatar as string,
    });
  };

  return {
    login: async ({ party_id }) => {
      // we are abusing the login function to assume a party
      // if party_id is null, we are resetting the assumed party
      const sessionInfoString = getStorage().getItem(sessionInfoKey);
      if (!sessionInfoString) return Promise.reject();
      const sessionInfo = JSON.parse(sessionInfoString);

      if (party_id === null && sessionInfo["party_id"] === undefined) {
        // we are entity, so nothing to unassume
        return Promise.resolve({ redirectTo: false });
      }

      if (party_id !== null && sessionInfo["party_id"] !== undefined) {
        // the backend only assumes from an entity session, so go back to
        // entity first. This also covers a stale localStorage (e.g. another
        // tab assumed a party), where the DELETE can fail because the cookie
        // is already a bare entity. Then the POST below decides.
        try {
          await fetchUtils.fetchJson(`${authURL}/assume`, {
            method: "DELETE",
          });
        } catch {
          // ignore
        }
      }

      if (party_id !== null) {
        // assume party
        const { status, body } = await fetchUtils.fetchJson(
          `${authURL}/assume`,
          {
            method: "POST",
            headers: new Headers({
              "Content-Type": "application/x-www-form-urlencoded",
            }),
            body: "party_id=" + party_id,
          },
        );

        if (status !== 200) {
          return Promise.reject();
        }

        getStorage().setItem(sessionInfoKey, body);
      } else {
        // unassume party
        const { status, body } = await fetchUtils.fetchJson(
          `${authURL}/assume`,
          {
            method: "DELETE",
          },
        );

        if (status !== 200) {
          return Promise.reject();
        }

        getStorage().setItem(sessionInfoKey, body);
      }

      return Promise.resolve({ redirectTo: false });
    },
    logout: async () => {
      getStorage().clear();
      return Promise.resolve();
    },
    getIdentity: getIdentity,
    checkAuth: async () => {
      const sessionInfoString = getStorage().getItem(sessionInfoKey);
      let sessionInfo = null;
      if (!sessionInfoString) {
        const { status, body, json } = await fetchUtils.fetchJson(
          `${authURL}/session`,
        );

        if (status == 200) {
          sessionInfo = json;
          getStorage().setItem(sessionInfoKey, body);
          // make sure permissions are refetched with the correct role
          queryClient.invalidateQueries({
            queryKey: ["auth", "getPermissions"],
          });
        }
      } else {
        sessionInfo = JSON.parse(sessionInfoString);
      }

      if (!sessionInfo) {
        // still no session means that we are not logged in and must reject
        // returning reject will call logout and redirect to the login page
        return Promise.reject();
      }

      if (sessionInfo["exp"] * 1000 < Date.now()) {
        // session expired
        getStorage().removeItem(sessionInfoKey);
        return Promise.reject();
      }

      return Promise.resolve();
    },
    checkError: async (error) => {
      const status = error.status;
      if (status === 401 || status === 403) {
        // a 401/403 can mean that the token has expired
        // if it has, then we want to force login again
        const sessionInfoString = getStorage().getItem(sessionInfoKey);
        if (!sessionInfoString) {
          return Promise.reject();
        }

        const sessionInfo = JSON.parse(sessionInfoString);
        const clockSkew = 300000; // ...it happens. 5 mins for good measure

        if (sessionInfo["exp"] * 1000 - clockSkew < Date.now()) {
          getStorage().removeItem(sessionInfoKey);

          return Promise.reject();
        }
      }
      return Promise.resolve();
    },
    getPermissions: () => {
      const sessionInfoString = getStorage().getItem(sessionInfoKey);

      // no session, no permissions
      if (!sessionInfoString)
        return Promise.resolve(permissions("flex_anonymous"));

      const sessionInfo = JSON.parse(sessionInfoString);
      const role = sessionInfo["role"];
      return Promise.resolve(
        role ? permissions(role) : permissions("flex_entity"),
      );
    },
  };
}
