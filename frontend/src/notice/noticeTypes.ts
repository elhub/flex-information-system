import type { Notice as GNotice } from "../generated-client";

type NoticeTypeDef = {
  id: GNotice["type"];
  shortId: string;
  label: string;
  description?: string;
  action?: NoticeTypeAction;
};

type NoticeTypeAction = {
  description: string;
  text?: string;
};

const noticeTypes = [
  {
    id: "no.elhub.flex.accounting_point_grid_location.source_insufficient",
    shortId: "accounting_point_grid_location.source_insufficient",
    label: "Insufficient Grid Location Source",
    description:
      "The grid location of this accounting point is guessed by the system. Due to the size of the connected controllable unit(s), its grid location must come from a reliable source (DSO or grid model). The grid location thus needs to be verified and confirmed.",
    action: {
      description:
        "Check the grid location information on the accounting point. If correct: set the voltage level and confirm. If incorrect: choose the correct grid location, set the voltage level and confirm.",
      text: "Check the grid location information here",
    },
  },
  {
    id: "no.elhub.flex.accounting_point_grid_location.missing",
    shortId: "accounting_point_grid_location.missing",
    label: "Grid Location Missing",
    description: "Accounting point has no grid location registered.",
    action: {
      description: "Register a grid location for the accounting point.",
      text: "Register location for the accounting point here",
    },
  },
  {
    id: "no.elhub.flex.controllable_unit_service_provider.valid_time.outside_contract",
    shortId: "controllable_unit_service_provider.valid_time.outside_contract",
    label: "Inconsistency: Valid time on CUSP vs End User",
    description:
      "Inconsistency: CUSP valid while end user is not valid on the AP.",
    action: {
      description: "Update CUSP to match the updated end user data from Elhub.",
    },
  },
  {
    id: "no.elhub.flex.controllable_unit_suspension.not_active",
    shortId: "controllable_unit_suspension.not_active",
    label: "Inconsistency: Inactive CU is suspended",
    description: "Inconsistency: suspending a CU that is no longer active.",
    action: {
      description: "Delete the suspension because it is useless.",
    },
  },
  {
    id: "no.elhub.flex.controllable_unit_suspension.lingering",
    shortId: "controllable_unit_suspension.lingering",
    label: "Lingering suspension on Controllable Unit",
    description:
      "Inactivity: nothing has happened on the suspension in 2 weeks.",
    action: {
      description:
        "Suspension is a temporary procedure. Consider reinstating the CU and use other lighter mechanisms to limit the use of the CU.",
    },
  },
  {
    id: "no.elhub.flex.party.missing",
    shortId: "party.missing",
    label: "Party missing",
    description:
      "This party is present in the party register, but is not yet created in the flexibility information system.",
    action: {
      description:
        "Create party to match the latest data fetched from the party register.",
    },
  },
  {
    id: "no.elhub.flex.party.outdated",
    shortId: "party.outdated",
    label: "Party outdated",
    description:
      "This party's information has changed in the party register and the system data is out of date.",
    action: {
      description:
        "Update party to match the latest data fetched from the party register.",
    },
  },
  {
    id: "no.elhub.flex.party.residual",
    shortId: "party.residual",
    label: "Party residual",
    description:
      "This party should no longer be active in the flexibility information system as it is not present in the party register.",
    action: {
      description:
        "Terminate party to match the latest data fetched from the party register.",
    },
  },
  {
    id: "no.elhub.flex.service_provider_product_application.status.requested",
    shortId: "service_provider_product_application.status.requested",
    label: "SP product application status requested",
    description: "SP product application status requested.",
    action: {
      description: "Initiate SP product qualification and update status.",
    },
  },
  {
    id: "no.elhub.flex.service_providing_group.balance_responsible_party.multiple",
    shortId: "service_providing_group.balance_responsible_party.multiple",
    label: "Inconsistency: Multiple BRPs in a single SPG",
    description: "Inconsistency: Multiple BRPs in a single SPG.",
    action: {
      description:
        "Make sure the SPG only contains CU currently associated to the same BRP on their accounting point.",
    },
  },
  {
    id: "no.elhub.flex.service_providing_group_grid_prequalification.status.requested",
    shortId: "service_providing_group_grid_prequalification.status.requested",
    label: "SPG grid prequalification status requested",
    description: "SPG grid prequalification status requested.",
    action: {
      description: "Initiate SPG grid prequalification and update status.",
    },
  },
  {
    id: "no.elhub.flex.service_providing_group_membership.valid_time.outside_contract",
    shortId: "service_providing_group_membership.valid_time.outside_contract",
    label: "Inconsistency: SPG contains expired CU(s)",
    description: "Inconsistency: SPG contains expired CU(s).",
    action: {
      description: "Validate and update SPG membership.",
    },
  },
  {
    id: "no.elhub.flex.service_providing_group_product_application.status.requested",
    shortId: "service_providing_group_product_application.status.requested",
    label: "SPG product application status requested",
    description: "SPG product application status requested.",
    action: {
      description: "Initiate SPG product prequalification and update status.",
    },
  },
  {
    id: "no.elhub.flex.service_provider_product_suspension.product_type.not_qualified",
    shortId: "service_provider_product_suspension.product_type.not_qualified",
    label: "Inconsistency: SP product type suspension",
    description:
      "Inconsistency: suspending a SP on a product type that they are no longer qualified for.",
    action: {
      description: "Delete the suspension because it is useless.",
    },
  },
  {
    id: "no.elhub.flex.service_provider_product_suspension.lingering",
    shortId: "service_provider_product_suspension.lingering",
    label: "Inactivity: Lingering product suspension",
    description:
      "Inactivity: nothing has happened on the suspension in 2 weeks.",
    action: {
      description:
        "Suspension is a temporary procedure. Consider reinstating the SP or removing their qualification.",
    },
  },
  {
    id: "no.elhub.flex.service_providing_group_grid_suspension.not_grid_prequalified",
    shortId: "service_providing_group_grid_suspension.not_grid_prequalified",
    label: "Inconsistency: Suspended SPG not grid prequalified",
    description:
      "Inconsistency: suspending a SPG that they no longer consider grid prequalified.",
    action: {
      description: "Delete the suspension because it is useless.",
    },
  },
  {
    id: "no.elhub.flex.service_providing_group_grid_suspension.lingering",
    shortId: "service_providing_group_grid_suspension.lingering",
    label: "Inactivity: SPG suspension",
    description:
      "Inactivity: nothing has happened on the suspension in 2 weeks.",
    action: {
      description:
        "Suspension is a temporary procedure. Consider reinstating the SPG or removing their grid prequalification.",
    },
  },
  {
    id: "no.elhub.flex.service_providing_group_product_suspension.product_id.not_qualified",
    shortId:
      "service_providing_group_product_suspension.product_id.not_qualified",
    label: "Inconsistency: SPG product suspension",
    description:
      "Inconsistency: suspending a SPG on a product type that they are no longer qualified for.",
    action: {
      description: "Delete the suspension because it is useless.",
    },
  },
  {
    id: "no.elhub.flex.service_providing_group_product_suspension.lingering",
    shortId: "service_providing_group_product_suspension.lingering",
    label: "Inactivity: SPG product suspension",
    description:
      "Inactivity: nothing has happened on the suspension in 2 weeks.",
    action: {
      description:
        "Suspension is a temporary procedure. Consider reinstating the SPG or removing their qualification.",
    },
  },
] satisfies NoticeTypeDef[];

export default noticeTypes;
