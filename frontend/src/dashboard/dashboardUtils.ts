export const ACTIVE_STATUSES = new Set(["requested", "in_progress"]);

export const RESOLVED_SPPA = new Set([
  "qualified",
  "not_qualified",
  "communication_test",
]);
export const RESOLVED_SPGPA = new Set([
  "prequalified",
  "verified",
  "temporary_qualified",
  "rejected",
  "prequalification_pending",
]);
export const RESOLVED_SPGGP = new Set([
  "approved",
  "conditionally_approved",
  "not_approved",
]);
