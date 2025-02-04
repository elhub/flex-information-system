import { AuthProvider as RAAuthProvider, fetchUtils } from "react-admin";
import { jwtDecode } from "jwt-decode";
import permissions from "./permissions.json";
import { httpClient, authURL } from "../httpConfig";

import anonymous_avatar from "./avatars/ANO.png";
import balance_responsible_party_avatar from "./avatars/BRP.png";
import end_user_avatar from "./avatars/EU.png";
import energy_supplier_avatar from "./avatars/ES.png";
import entity_avatar from "./avatars/ENT.png";
import flexibility_information_system_operator_avatar from "./avatars/FISO.png";
import market_operator_avatar from "./avatars/MO.png";
import service_provider_avatar from "./avatars/SP.png";
import system_operator_avatar from "./avatars/SO.png";
import third_party_avatar from "./avatars/TP.png";

export enum GrantType {
  ClientCredentials,
  TokenExchange,
}

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
  flex_service_provider: service_provider_avatar,
  flex_system_operator: system_operator_avatar,
  flex_third_party: third_party_avatar,
};

export type AuthProvider = RAAuthProvider & {
  dropParty: () => boolean;
};

export function authProvider(): AuthProvider {
  const getIdentity = async () => {
    if (!localStorage.getItem("token")) return Promise.reject();

    const { json } = await httpClient(`${authURL}/userinfo`).catch(() => {
      localStorage.removeItem("token");
      return Promise.reject();
    });

    const role = json["current_role"];
    const entity_name = json["entity_name"];
    const party_name = json["party_name"];

    const avatar = await toDataURL(roleAvatars[role]);

    return Promise.resolve<any>({
      id: json["sub"],
      entity_id: json["entity_id"],
      entity_name,
      party_id: json["party_id"],
      party_name,
      fullName: party_name ? `${entity_name} as ${party_name}` : entity_name,
      role: role,
      avatar,
    });
  };

  const clientCredentials = ({ email, password }: any) =>
    fetchUtils
      .fetchJson(`${authURL}/token`, {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/x-www-form-urlencoded",
        }),
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: email,
          client_secret: password,
        } as any).toString(),
      })
      .then(({ status, json }) => {
        // TODO: change when error is the body itself
        if (status != 200) return Promise.reject(json.message);

        localStorage.setItem("entity_token", json.access_token);
        localStorage.setItem("token", json.access_token);
        const decodedToken = jwtDecode<any>(json.access_token);
        localStorage.setItem("role", decodedToken.role);
      });

  const tokenExchange = ({ party_id }: any) =>
    fetchUtils
      .fetchJson(`${authURL}/token`, {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }),
        body: new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
          actor_token: localStorage.getItem("token"),
          actor_token_type: "urn:ietf:params:oauth:token-type:jwt",
          scope: `assume:party:${party_id}`,
        } as any).toString(),
      })
      .then(({ status, json }) => {
        // TODO: change when error is the body itself
        if (status != 200) return Promise.reject(json.message);

        localStorage.setItem("token", json.access_token);
        const decodedToken = jwtDecode<any>(json.access_token);
        localStorage.setItem("role", decodedToken.role);
      });

  return {
    login: ({ grantType, auth }) => {
      switch (grantType as GrantType) {
        case GrantType.ClientCredentials:
          return clientCredentials(auth);
        case GrantType.TokenExchange:
          return tokenExchange(auth);
      }
    },
    logout: async () => {
      localStorage.clear();
      return Promise.resolve();
    },
    dropParty: () => {
      const entityToken = localStorage.getItem("entity_token")!;
      const token = localStorage.getItem("token")!;
      if (token != entityToken) {
        // party assumed
        const decodedEntityToken = jwtDecode<any>(entityToken);
        localStorage.setItem("token", entityToken);
        localStorage.setItem("role", decodedEntityToken.role);
        return true;
      } else {
        // nothing to drop
        return false;
      }
    },
    getIdentity: getIdentity,
    checkAuth: async () => {
      let token = localStorage.getItem("token");
      if (!token) {
        // we are not logged in so we are going to try to get a token from the session
        const { status, json } = await fetchUtils.fetchJson(
          `${authURL}/session`,
        );
        if (status == 200) {
          token = json["access_token"];
        }
      }
      if (token) {
        // we now have a token, let's check if it is expired
        const decodedToken = jwtDecode<any>(token);
        if (decodedToken.exp * 1000 < Date.now()) {
          // token is expired lets clear it
          token = null;
        } else {
          // token is valid, lets update localstorage
          localStorage.setItem("token", token);
          const role = decodedToken.role;
          if (role == "flex_entity") {
            localStorage.setItem("entity_token", token);
          }
          localStorage.setItem("role", role);
        }
      }
      if (!token) {
        // still no token means we are not logged in and we did not get a token from the session
        // returning reject will call logout and redirect to the login page
        return Promise.reject();
      }
      return Promise.resolve();
    },
    checkError: async (error) => {
      const status = error.status;
      if (status === 401 || status === 403) {
        // a 401/403 can mean that the token has expired
        // if it has, then we want to force login again
        const token = localStorage.getItem("token");
        if (token == null) {
          return Promise.reject();
        } else {
          const decodedToken = jwtDecode<any>(token);
          const clockSkew = 300000; // ...it happens. 5 mins for good measure
          if (decodedToken.exp * 1000 - clockSkew < Date.now()) {
            localStorage.removeItem("token");

            // if entity token is there, it means the expired token is just
            // the party token, so we can go back to being just logged in
            // as an entity
            const entity_token = localStorage.getItem("entity_token");
            if (entity_token) localStorage.setItem("token", entity_token);

            return Promise.reject();
          }
        }
      }
      return Promise.resolve();
    },
    getPermissions: () => {
      const role = localStorage.getItem("role");
      const perms = permissions as any;
      return Promise.resolve(role ? perms[role] : perms["flex_entity"]);
    },
  };
}
