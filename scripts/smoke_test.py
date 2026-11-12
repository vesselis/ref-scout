"""Smoke test for CourtVision (requires Python + Playwright)."""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:3100")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    page.set_default_timeout(60000)

    page.goto(f"{BASE}/login")
    page.wait_for_load_state("networkidle")
    assert page.get_by_text("CourtVision", exact=True).is_visible(), "brand not visible"
    assert page.locator("input[type=email]").count() == 1, "email input missing"
    assert page.locator("input[type=password]").count() == 1, "password input missing"
    print("PASS: /login renders brand + sign-in form")
    page.screenshot(path="/tmp/courtvision-login.png", full_page=True)

    page.goto(f"{BASE}/reports")
    page.wait_for_load_state("networkidle")
    assert "/login" in page.url, f"expected /reports -> /login, got {page.url}"
    print(f"PASS: /reports redirects to {page.url}")

    page.goto(f"{BASE}/")
    page.wait_for_load_state("networkidle")
    assert "/login" in page.url, f"expected / -> /login, got {page.url}"
    print(f"PASS: / redirects to {page.url}")

    browser.close()

print("SMOKE TEST PASSED")
