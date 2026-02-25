import { AuthProvider, fetchUtils, getStorage } from "react-admin";
import permissions from "./permissions";
import { authURL } from "../httpConfig";

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

export function authProvider(): AuthProvider {
  const getIdentity = async () => {
    const sessionInfoString = getStorage().getItem(sessionInfoKey);
    if (!sessionInfoString) return Promise.reject();

    const sessionInfo = JSON.parse(sessionInfoString);

    const role = sessionInfo["role"];
    const entity_name = sessionInfo["entity_name"];
    const party_name = sessionInfo["party_name"];

    const avatar = await toDataURL(roleAvatars[role]);

    return Promise.resolve<any>({
      id: sessionInfo["sub"],
      entityID: sessionInfo["entity_id"],
      entityName: entity_name,
      partyID: sessionInfo["party_id"],
      partyName: party_name,
      fullName: party_name ? `${entity_name} as ${party_name}` : entity_name,
      role: role,
      avatar,
    });
  };

  return {
    login: async ({ party_id }) => {
      // we are abusing the login function to assume a party
      // if party_id is null, we are resetting the assumed party
      const sessionInfoString = getStorage().getItem(sessionInfoKey);
      if (!sessionInfoString) return Promise.reject();
      const sessionInfo = JSON.parse(sessionInfoString);

      if (party_id !== null && sessionInfo["party_id"] !== undefined) {
        // we are assuming a party, so we have to be entity
        return Promise.reject("must be entity when assuming party");
      }

      if (party_id === null && sessionInfo["party_id"] === undefined) {
        // we are entity, so nothing to unassume
        return Promise.resolve({ redirectTo: false });
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
      if (!sessionInfoString) return Promise.resolve([]); // no session, no permissions
      const sessionInfo = JSON.parse(sessionInfoString);
      const role = sessionInfo["role"];
      return Promise.resolve(
        role ? permissions(role) : permissions("flex_entity"),
      );
    },
  };
}
