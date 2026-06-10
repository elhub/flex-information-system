const noticeTypes = [
  {
    id: "no.elhub.flex.accounting_point_grid_location.source_insufficient",
    shortId: "accounting_point_grid_location.source_insufficient",
    label: "Insufficient Grid Location Source",
    description:
      "Accounting point has a grid location registered, but the source is not trusted (not cso or grid_model)",
    action:
      "Update the grid location source to a trusted source (cso or grid_model)",
  },
  {
    id: "no.elhub.flex.accounting_point_grid_location.missing",
    shortId: "accounting_point_grid_location.missing",
    label: "Grid Location Missing",
    description: "Accounting point has no grid location registered",
    action: "Register a grid location for the accounting point",
  },
  {
    id: "no.elhub.flex.controllable_unit_service_provider.valid_time.outside_contract",
    shortId: "controllable_unit_service_provider.valid_time.outside_contract",
    label: "Inconsistency: Valid time on CUSP vs End User",
    description:
      "Inconsistency: CUSP valid while end user is not valid on the AP",
    action: "Update CUSP to match the updated end user data from Elhub",
  },
  {
    id: "no.elhub.flex.controllable_unit_suspension.not_active",
    shortId: "controllable_unit_suspension.not_active",
    label: "Inconsistency: Inactive CU is suspended",
    description: "Inconsistency: suspending a CU that is no longer active",
    action: "Delete the suspension because it is useless",
  },
  {
    id: "no.elhub.flex.controllable_unit_suspension.lingering",
    shortId: "controllable_unit_suspension.lingering",
    label: "Lingering suspension on Controllable Unit",
    description:
      "Inactivity: nothing has happened on the suspension in 2 weeks",
    action:
      "Suspension is a temporary procedure. Consider reinstating the CU and use other lighter mechanisms to limit the use of the CU.",
  },
  {
    id: "no.elhub.flex.party.missing",
    shortId: "party.missing",
    label: "Party missing",
    description:
      "Party exists in the party register but is not registered in the system",
    action:
      "Create party to match the latest data fetched from the party register",
  },
  {
    id: "no.elhub.flex.party.outdated",
    shortId: "party.outdated",
    label: "Party outdated",
    description: "Mismatch in party data between system and the party register",
    action:
      "Update party to match the latest data fetched from the party register",
  },
  {
    id: "no.elhub.flex.party.residual",
    shortId: "party.residual",
    label: "Party residual",
    description:
      "Party registered in the system but not present in the party register",
    action:
      "Terminate party to match the latest data fetched from the party register",
  },
  {
    id: "no.elhub.flex.service_provider_product_application.status.requested",
    shortId: "service_provider_product_application.status.requested",
    label: "SP product application status requested",
    description: "SP product application status requested",
    action: "Initiate SP product qualification and update status",
  },
  {
    id: "no.elhub.flex.service_providing_group.balance_responsible_party.multiple",
    shortId: "service_providing_group.balance_responsible_party.multiple",
    label: "Inconsistency: Multiple BRPs in a single SPG",
    description: "Inconsistency: Multiple BRPs in a single SPG",
    action:
      "Make sure the SPG only contains CU currently associated to the same BRP on their accounting point",
  },
  {
    id: "no.elhub.flex.service_providing_group_grid_prequalification.status.requested",
    shortId: "service_providing_group_grid_prequalification.status.requested",
    label: "SPG grid prequalification status requested",
    description: "SPG grid prequalification status requested",
    action: "Initiate SPG grid prequalification and update status",
  },
  {
    id: "no.elhub.flex.service_providing_group_membership.valid_time.outside_contract",
    shortId: "service_providing_group_membership.valid_time.outside_contract",
    label: "Inconsistency: SPG contains expired CU(s)",
    description: "Inconsistency: SPG contains expired CU(s)",
    action: "Validate and update SPG membership",
  },
  {
    id: "no.elhub.flex.service_providing_group_product_application.status.requested",
    shortId: "service_providing_group_product_application.status.requested",
    label: "SPG product application status requested",
    description: "SPG product application status requested",
    action: "Initiate SPG product prequalification and update status",
  },
  {
    id: "no.elhub.flex.service_provider_product_suspension.product_type.not_qualified",
    shortId: "service_provider_product_suspension.product_type.not_qualified",
    label: "Inconsistency: SP product type suspension",
    description:
      "Inconsistency: suspending a SP on a product type that they are no longer qualified for",
    action: "Delete the suspension because it is useless",
  },
  {
    id: "no.elhub.flex.service_provider_product_suspension.lingering",
    shortId: "service_provider_product_suspension.lingering",
    label: "Inactivity: Lingering product suspension",
    description:
      "Inactivity: nothing has happened on the suspension in 2 weeks",
    action:
      "Suspension is a temporary procedure. Consider reinstating the SP or removing their qualification.",
  },
  {
    id: "no.elhub.flex.service_providing_group_grid_suspension.not_grid_prequalified",
    shortId: "service_providing_group_grid_suspension.not_grid_prequalified",
    label: "Inconsistency: Suspended SPG not grid prequalified",
    description:
      "Inconsistency: suspending a SPG that they no longer consider grid prequalified",
    action: "Delete the suspension because it is useless",
  },
  {
    id: "no.elhub.flex.service_providing_group_grid_suspension.lingering",
    shortId: "service_providing_group_grid_suspension.lingering",
    label: "Inactivity: SPG suspension",
    description:
      "Inactivity: nothing has happened on the suspension in 2 weeks",
    action:
      "Suspension is a temporary procedure. Consider reinstating the SPG or removing their grid prequalification.",
  },
  {
    id: "no.elhub.flex.service_providing_group_product_suspension.product_id.not_qualified",
    shortId:
      "service_providing_group_product_suspension.product_id.not_qualified",
    label: "Inconsistency: SPG product suspension",
    description:
      "Inconsistency: suspending a SPG on a product type that they are no longer qualified for",
    action: "Delete the suspension because it is useless",
  },
  {
    id: "no.elhub.flex.service_providing_group_product_suspension.lingering",
    shortId: "service_providing_group_product_suspension.lingering",
    label: "Inactivity: SPG product suspension",
    description:
      "Inactivity: nothing has happened on the suspension in 2 weeks",
    action:
      "Suspension is a temporary procedure. Consider reinstating the SPG or removing their qualification.",
  },
];

export default noticeTypes;
