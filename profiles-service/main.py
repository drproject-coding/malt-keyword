import os
import json
from fastapi import FastAPI, Query, HTTPException, Header
from playwright.async_api import async_playwright
from playwright_stealth import stealth_async

app = FastAPI()

MALT_BASE_URL = "https://www.malt.fr"
MALT_PROFILES_URL = f"{MALT_BASE_URL}/search/api/profiles"
PAGES_MAX = 5
API_SECRET = os.environ.get("API_SECRET", "")


def check_secret(x_api_secret: str = Header(default="")):
    if API_SECRET and x_api_secret != API_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")


async def scrape_profiles(q: str, num_pages: int) -> list:
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
            ],
        )
        context = await browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1280, "height": 800},
        )
        page = await context.new_page()
        await stealth_async(page)

        try:
            # Load main page first to pass Cloudflare challenge and get cf_clearance cookie
            await page.goto(MALT_BASE_URL, wait_until="networkidle", timeout=30000)

            all_profiles = []
            for page_num in range(1, num_pages + 1):
                try:
                    response = await page.goto(
                        f"{MALT_PROFILES_URL}?q={q}&page={page_num}",
                        wait_until="domcontentloaded",
                        timeout=30000,
                    )
                    if response and response.status == 200:
                        text = await response.text()
                        data = json.loads(text)
                        all_profiles.extend(data.get("profiles", []))
                except Exception:
                    continue

            return all_profiles
        finally:
            await browser.close()


@app.get("/profiles")
async def profiles(
    q: str = Query(..., min_length=2),
    pages: int = Query(default=3, ge=1, le=PAGES_MAX),
    x_api_secret: str = Header(default=""),
):
    check_secret(x_api_secret)

    try:
        all_profiles = await scrape_profiles(q, pages)
    except Exception:
        raise HTTPException(status_code=502, detail="No profiles found or upstream unavailable.")

    if not all_profiles:
        raise HTTPException(status_code=502, detail="No profiles found or upstream unavailable.")

    return {"profiles": all_profiles, "total": len(all_profiles)}


@app.get("/health")
def health():
    return {"status": "ok"}
