import { test, expect, type Page, type Locator } from "@playwright/test";

const API_VERSION = "2026-06-08";
// Seed ids depend on insertion order, so the unit is looked up by name.
const CONTROLLABLE_UNIT_NAME = process.env.E2E_CU_NAME ?? "Test Solar";

const TAB_NAMES = [
  "technical_resources",
  "service_providing_groups",
  "accounting_point_location",
  "service_provider",
  "balance_responsible_party",
  "history",
] as const;

const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
// e.g. "1. okt. 2026, 07:36", as formatted by toDateTimeString
const DATE_TIME_PATTERN = /^\d{1,2}\. \S+ \d{4}, \d{2}:\d{2}$/;

let controllableUnitId: number;

test.beforeAll(async ({ request }) => {
  const response = await request.get(
    `/api/v1/controllable_unit?name=eq.${encodeURIComponent(CONTROLLABLE_UNIT_NAME)}`,
    { headers: { "Api-Version": API_VERSION } },
  );
  expect(response.ok()).toBeTruthy();
  const [controllableUnit] = await response.json();
  expect(
    controllableUnit,
    `controllable unit "${CONTROLLABLE_UNIT_NAME}" not found`,
  ).toBeTruthy();
  controllableUnitId = controllableUnit.id;
});

const summaryValueOf = (page: Page, label: string): Locator =>
  page.getByText(`${label}:`).locator("xpath=following-sibling::*");

const valuesThatChangeBetweenLoads = (page: Page): Locator[] => [
  page.getByText(UUID_PATTERN),
  summaryValueOf(page, "Regulation direction"),
  summaryValueOf(page, "Recorded at"),
  page.getByRole("cell").filter({ hasText: DATE_TIME_PATTERN }),
];

const openShowPage = async (page: Page, tabName?: string) => {
  const tabQuery = tabName ? `?tab=${tabName}` : "";
  await page.goto(`/#/controllable_unit/${controllableUnitId}/show${tabQuery}`);
  await expect(page.getByRole("heading", { level: 2 })).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
};

const waitForMapToRender = (page: Page) =>
  page
    .locator(".leaflet-container, canvas")
    .first()
    .waitFor()
    .catch(() => {});

const expectScreenshot = (page: Page, fileName: string) =>
  expect(page).toHaveScreenshot(fileName, {
    mask: valuesThatChangeBetweenLoads(page),
    fullPage: true,
  });

test.describe("controllable unit show page", () => {
  for (const tabName of TAB_NAMES) {
    test(`tab: ${tabName}`, async ({ page }) => {
      await openShowPage(page, tabName);
      if (tabName === "accounting_point_location") {
        await waitForMapToRender(page);
      }
      await expectScreenshot(page, `${tabName}.png`);
    });
  }

  test("more actions menu", async ({ page }) => {
    await openShowPage(page);
    await page.getByRole("button", { name: /more/i }).first().click();
    await expectScreenshot(page, "more-menu.png");
  });
});
