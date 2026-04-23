// frontend/src/dashboard/dashboardUtils.ts

export const addMonths = (dateStr: string, months: number): string => {
  const d = new Date(dateStr);
  const originalDay = d.getDate();
  const targetMonth = d.getMonth() + months;
  d.setDate(1);
  d.setMonth(targetMonth);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(originalDay, lastDay));
  return d.toISOString().split("T")[0];
};

export const ACTIVE_STATUSES = new Set(["requested", "in_progress"]);
