import { test as setup, expect } from "@playwright/test";
import { STORAGE_STATE } from "../playwright.config";

const USER = process.env.E2E_USER ?? "13370000001"; // Test Suite
const PASSWORD = process.env.E2E_PASSWORD ?? "welcome";
const PARTY = process.env.E2E_PARTY ?? "Test FISO";

setup("log in and assume party", async ({ page, baseURL }) => {
  await page.goto("/#/login");
  await page.getByRole("button", { name: "Sign in" }).click();

  // Authelia
  await page
    .locator("#username-textfield, input[name=username]")
    .first()
    .fill(USER);
  await page
    .locator("#password-textfield, input[name=password]")
    .first()
    .fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  // consent screen (only shown on first login)
  const accept = page.getByRole("button", { name: /accept/i });
  await accept.click({ timeout: 5000 }).catch(() => {});

  await page.waitForURL((url) => url.origin === new URL(baseURL!).origin);
  await expect
    .poll(async () => (await page.request.get("/auth/v1/session")).status())
    .toBe(200);

  // assume the party so that the role sees all tabs
  const parties = await page.request.get(
    `/api/v1/party?name=eq.${encodeURIComponent(PARTY)}`,
    { headers: { "Api-Version": "2026-06-08" } },
  );
  expect(parties.ok()).toBeTruthy();
  const [party] = await parties.json();
  expect(party, `party ${PARTY} not found`).toBeTruthy();
  const assumed = await page.request.post("/auth/v1/assume", {
    form: { party_id: String(party.id) },
  });
  expect(assumed.ok()).toBeTruthy();

  // drop the cached entity session; the app refetches it from the cookie
  await page.evaluate(() => {
    Object.keys(localStorage)
      .filter((key) => key.includes("flexSession"))
      .forEach((key) => localStorage.removeItem(key));
  });
  await page.context().storageState({ path: STORAGE_STATE });
});
