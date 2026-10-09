import { test, expect, type Page, type Locator } from "@playwright/test";

const API_VERSION = "2026-06-08";
// Seed ids depend on insertion order, so the unit is looked up by name.
const CONTROLLABLE_UNIT_NAME = process.env.E2E_CU_NAME ?? "Test Solar";

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

const openShowPage = async (page: Page) => {
  await page.goto(`/#/controllable_unit/${controllableUnitId}/show`);
  await expect(page.getByRole("heading", { level: 2 })).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
};

const expectScreenshot = (page: Page, fileName: string) =>
  expect(page.getByTestId("resource-show-layout")).toHaveScreenshot(fileName, {
    mask: [
      page.getByTestId("resource-show-content"),
      summaryValueOf(page, "Recorded at"),
    ],
  });

const expectResourceShowLayout = async (page: Page) => {
  await expect(
    page.getByRole("heading", { level: 2, name: CONTROLLABLE_UNIT_NAME }),
  ).toBeVisible();
  await expect(page.getByText("Active", { exact: true })).toBeVisible();
  await expect(summaryValueOf(page, "Accounting point")).toBeVisible();
  await expect(page.getByRole("button", { name: /more/i })).toBeVisible();
};

test.describe("ResourceShowLayout", () => {
  test("renders the shared show layout with its resource content", async ({
    page,
  }) => {
    await openShowPage(page);
    await expectResourceShowLayout(page);
    await expectScreenshot(page, "controllable-unit.png");
  });
});
