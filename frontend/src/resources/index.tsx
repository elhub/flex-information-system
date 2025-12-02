/**
 * Main resources index - exports all resource factories
 * This enables better code organization
 */

import { Resource } from "react-admin";
import { JSX } from "react";
import { createEntityResources } from "./entityResources";
import { createPartyResources } from "./partyResources";
import { createControllableUnitResources } from "./controllableUnitResources";
import { createServiceProvidingGroupResources } from "./serviceProvidingGroupResources";
import { createServiceProviderResources } from "./serviceProviderResources";
import { createProductResources } from "./productResources";
import { createSystemResources } from "./systemResources";
import { Permissions } from "../auth/permissions";

/**
 * Creates all resources based on user permissions
 */
export const createAllResources = (permissions: Permissions) => {
  const resources: JSX.Element[] = [];

  resources.push(
    <Resource
      key="accounting_point"
      name="accounting_point"
      recordRepresentation="business_id"
    />,
  );

  // Entity resources
  const entityResource = createEntityResources(permissions);
  if (entityResource) resources.push(entityResource);

  // Party resources
  const partyResource = createPartyResources(permissions);
  if (partyResource) resources.push(partyResource);

  // Controllable Unit resources
  const cuResources = createControllableUnitResources(permissions);
  resources.push(...cuResources);

  // Service Providing Group resources
  const spgResources = createServiceProvidingGroupResources(permissions);
  resources.push(...spgResources);

  // Service Provider resources
  const spResources = createServiceProviderResources(permissions);
  resources.push(...spResources);

  // Product resources
  const productResources = createProductResources(permissions);
  resources.push(...productResources);

  // System resources
  const systemResources = createSystemResources(permissions);
  resources.push(...systemResources);

  return resources;
};
