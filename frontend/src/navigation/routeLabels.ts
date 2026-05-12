type RouteLabel = {
  pattern: RegExp;
  label: (match: RegExpMatchArray) => string;
};

const ROUTE_LABELS: RouteLabel[] = [
  { pattern: /^\/$/, label: () => "Dashboard" },
  // Top-level show pages
  {
    pattern: /^\/service_providing_group\/(\d+)\/show$/,
    label: (m) => `Service providing group ${m[1]}`,
  },
  {
    pattern: /^\/controllable_unit\/(\d+)\/show$/,
    label: (m) => `Controllable unit ${m[1]}`,
  },
  {
    // accounting_point IDs are metering point IDs (18-digit strings), not numeric DB IDs
    pattern: /^\/accounting_point\/([^/]+)\/show$/,
    label: (m) => `Accounting point ${m[1]}`,
  },
  {
    pattern: /^\/party\/(\d+)\/show$/,
    label: (m) => `Party ${m[1]}`,
  },
  {
    pattern: /^\/entity\/(\d+)\/show$/,
    label: (m) => `Entity ${m[1]}`,
  },
  {
    pattern: /^\/product_type\/(\d+)\/show$/,
    label: (m) => `Product type ${m[1]}`,
  },
  // Nested under controllable_unit
  {
    pattern: /^\/controllable_unit\/\d+\/suspension\/(\d+)\/show$/,
    label: (m) => `Suspension ${m[1]}`,
  },
  {
    pattern: /^\/controllable_unit\/\d+\/service_provider\/(\d+)\/show$/,
    label: (m) => `Service provider ${m[1]}`,
  },
  {
    pattern: /^\/controllable_unit\/\d+\/technical_resource\/(\d+)\/show$/,
    label: (m) => `Technical resource ${m[1]}`,
  },
  {
    pattern: /^\/controllable_unit\/\d+\/suspension_history\/(\d+)\/show$/,
    label: (m) => `Suspension history ${m[1]}`,
  },
  {
    pattern:
      /^\/controllable_unit\/\d+\/suspension\/\d+\/comment\/(\d+)\/show$/,
    label: (m) => `Comment ${m[1]}`,
  },
  {
    pattern:
      /^\/controllable_unit\/\d+\/service_provider_history\/(\d+)\/show$/,
    label: (m) => `Service provider history ${m[1]}`,
  },
  {
    pattern:
      /^\/controllable_unit\/\d+\/technical_resource_history\/(\d+)\/show$/,
    label: (m) => `Technical resource history ${m[1]}`,
  },
  // Nested under service_providing_group
  {
    pattern: /^\/service_providing_group\/\d+\/membership\/(\d+)\/show$/,
    label: (m) => `Membership ${m[1]}`,
  },
  {
    pattern:
      /^\/service_providing_group\/\d+\/membership_history\/(\d+)\/show$/,
    label: (m) => `Membership history ${m[1]}`,
  },
  {
    pattern:
      /^\/service_providing_group\/\d+\/grid_prequalification\/(\d+)\/show$/,
    label: (m) => `Grid prequalification ${m[1]}`,
  },
  {
    pattern:
      /^\/service_providing_group\/\d+\/grid_prequalification_history\/(\d+)\/show$/,
    label: (m) => `Grid prequalification history ${m[1]}`,
  },
  {
    pattern:
      /^\/service_providing_group\/\d+\/product_application\/(\d+)\/show$/,
    label: (m) => `Product application ${m[1]}`,
  },
  {
    pattern:
      /^\/service_providing_group\/\d+\/product_application_history\/(\d+)\/show$/,
    label: (m) => `Product application history ${m[1]}`,
  },
  {
    pattern: /^\/service_providing_group\/\d+\/grid_suspension\/(\d+)\/show$/,
    label: (m) => `Grid suspension ${m[1]}`,
  },
  {
    pattern:
      /^\/service_providing_group\/\d+\/grid_suspension_history\/(\d+)\/show$/,
    label: (m) => `Grid suspension history ${m[1]}`,
  },
  {
    pattern:
      /^\/service_providing_group\/\d+\/grid_prequalification\/\d+\/comment\/(\d+)\/show$/,
    label: (m) => `Comment ${m[1]}`,
  },
  {
    pattern:
      /^\/service_providing_group\/\d+\/product_application\/\d+\/comment\/(\d+)\/show$/,
    label: (m) => `Comment ${m[1]}`,
  },
  {
    pattern:
      /^\/service_providing_group\/\d+\/grid_suspension\/\d+\/comment\/(\d+)\/show$/,
    label: (m) => `Comment ${m[1]}`,
  },
  // Nested under entity
  {
    pattern: /^\/entity\/\d+\/client\/(\d+)\/show$/,
    label: (m) => `Client ${m[1]}`,
  },
  // Top-level list pages (fallbacks)
  {
    pattern: /^\/service_providing_group$/,
    label: () => "Service providing groups",
  },
  {
    pattern: /^\/controllable_unit$/,
    label: () => "Controllable units",
  },
  {
    pattern: /^\/accounting_point$/,
    label: () => "Accounting points",
  },
  { pattern: /^\/party$/, label: () => "Parties" },
  { pattern: /^\/entity$/, label: () => "Entities" },
  { pattern: /^\/product_type$/, label: () => "Product types" },
];

export function getLabelForPath(pathname: string): string | undefined {
  for (const { pattern, label } of ROUTE_LABELS) {
    const match = pathname.match(pattern);
    if (match) return label(match);
  }
}
