const noticeTypes = [
  {
    id: "no.elhub.flex.accounting_point_grid_location.source_insufficient",
    shortId: "accounting_point_grid_location.source_insufficient",
    label: "Insufficient Grid Location Source",
  },
  {
    id: "no.elhub.flex.accounting_point_grid_location.missing",
    shortId: "accounting_point_grid_location.missing",
    label: "Grid Location Missing",
  },
  {
    id: "no.elhub.flex.controllable_unit_service_provider.valid_time.outside_contract",
    shortId: "controllable_unit_service_provider.valid_time.outside_contract",
    label: "Inconsistency: Valid time on CUSP vs End User",
  },
  {
    id: "no.elhub.flex.controllable_unit_suspension.not_active",
    shortId: "controllable_unit_suspension.not_active",
    label: "Inconsistency: Inactive CU is suspended",
  },
  {
    id: "no.elhub.flex.controllable_unit_suspension.lingering",
    shortId: "controllable_unit_suspension.lingering",
    label: "Lingering suspension on Controllable Unit",
  },
  {
    id: "no.elhub.flex.party.missing",
    shortId: "party.missing",
    label: "Party missing",
  },
  {
    id: "no.elhub.flex.party.outdated",
    shortId: "party.outdated",
    label: "Party outdated",
  },
  {
    id: "no.elhub.flex.party.residual",
    shortId: "party.residual",
    label: "Party residual",
  },
  {
    id: "no.elhub.flex.service_provider_product_application.status.requested",
    shortId: "service_provider_product_application.status.requested",
    label: "SP product application status requested",
  },
  {
    id: "no.elhub.flex.service_providing_group.balance_responsible_party.multiple",
    shortId: "service_providing_group.balance_responsible_party.multiple",
    label: "Inconsistency: Multiple BRPs in a single SPG",
  },
  {
    id: "no.elhub.flex.service_providing_group_grid_prequalification.status.requested",
    shortId: "service_providing_group_grid_prequalification.status.requested",
    label: "SPG grid prequalification status requested",
  },
  {
    id: "no.elhub.flex.service_providing_group_membership.valid_time.outside_contract",
    shortId: "service_providing_group_membership.valid_time.outside_contract",
    label: "Inconsistency: SPG contains expired CU(s)",
  },
  {
    id: "no.elhub.flex.service_providing_group_product_application.status.requested",
    shortId: "service_providing_group_product_application.status.requested",
    label: "SPG product application status requested",
  },
  {
    id: "no.elhub.flex.service_provider_product_suspension.product_id.not_qualified",
    shortId: "service_provider_product_suspension.product_id.not_qualified",
    label: "Inconsistency: SP product type suspension",
  },
  {
    id: "no.elhub.flex.service_provider_product_suspension.lingering",
    shortId: "service_provider_product_suspension.lingering",
    label: "Inactivity: Lingering product suspension",
  },
  {
    id: "no.elhub.flex.service_providing_group_grid_suspension.not_grid_prequalified",
    shortId: "service_providing_group_grid_suspension.not_grid_prequalified",
    label: "Inconsistency: Suspended SPG not grid prequalified",
  },
  {
    id: "no.elhub.flex.service_providing_group_grid_suspension.lingering",
    shortId: "service_providing_group_grid_suspension.lingering",
    label: "Inactivity: SPG suspension",
  },
  {
    id: "no.elhub.flex.service_providing_group_product_suspension.product_id.not_qualified",
    shortId:
      "service_providing_group_product_suspension.product_id.not_qualified",
    label: "Inconsistency: SPG product suspension",
  },
  {
    id: "no.elhub.flex.service_providing_group_product_suspension.lingering",
    shortId: "service_providing_group_product_suspension.lingering",
    label: "Inactivity: SPG product suspension",
  },
];

export default noticeTypes;
