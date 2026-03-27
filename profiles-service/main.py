import os
import json
from typing import List, Optional
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


def build_malt_url(q: str, page: int, filters: dict, search_id: Optional[str]) -> str:
    params = {"q": q, "page": str(page)}

    optional_keys = [
        "category", "badge", "lang",
        "lat", "lon", "city", "location", "countryCode",
        "administrativeAreaLevel1Code", "administrativeAreaLevel2Code",
        "minPrice", "maxPrice", "businessSector",
    ]
    for key in optional_keys:
        if filters.get(key) is not None:
            params[key] = str(filters[key])

    if filters.get("remoteEuropa"):
        params["remoteEuropa"] = "true"
    if filters.get("fallback"):
        params["fallback"] = "true"

    if search_id:
        params["searchid"] = search_id

    # Multi-value params: exp, excludedProfiles
    multi_params = []
    for level in filters.get("exp") or []:
        multi_params.append(("exp", level))
    for pid in filters.get("excludedProfiles") or []:
        multi_params.append(("excludedProfiles", pid))

    from urllib.parse import urlencode
    qs = urlencode(params)
    if multi_params:
        qs += "&" + urlencode(multi_params)
    return f"{MALT_PROFILES_URL}?{qs}"


async def scrape_profiles(q: str, num_pages: int, filters: dict) -> list:
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
            search_id = None

            for page_num in range(1, num_pages + 1):
                try:
                    url = build_malt_url(q, page_num, filters, search_id)
                    response = await page.goto(
                        url,
                        wait_until="domcontentloaded",
                        timeout=30000,
                    )
                    if response and response.status == 200:
                        text = await response.text()
                        data = json.loads(text)
                        # Reuse searchId from first response on subsequent pages
                        if search_id is None and data.get("searchId"):
                            search_id = data["searchId"]
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
    # Experience level (multi-value): ENTRY, INTERMEDIATE, EXPERT, EXPERT_PLUS
    exp: Optional[List[str]] = Query(default=None),
    # Job category e.g. mobile_developer, web_developer
    category: Optional[str] = Query(default=None),
    # Badge: SUPER_MALTER
    badge: Optional[str] = Query(default=None),
    # Language
    lang: Optional[str] = Query(default=None),
    # Location (all required together for on-site/hybrid results)
    lat: Optional[float] = Query(default=None),
    lon: Optional[float] = Query(default=None),
    city: Optional[str] = Query(default=None),
    location: Optional[str] = Query(default=None),
    countryCode: Optional[str] = Query(default=None),
    administrativeAreaLevel1Code: Optional[str] = Query(default=None),
    administrativeAreaLevel2Code: Optional[str] = Query(default=None),
    # Price range
    minPrice: Optional[int] = Query(default=None),
    maxPrice: Optional[int] = Query(default=None),
    # Business sector e.g. sports, finance, health
    businessSector: Optional[str] = Query(default=None),
    # Remote Europa flag
    remoteEuropa: Optional[bool] = Query(default=None),
    # Fallback flag (used internally by Malt pagination)
    fallback: Optional[bool] = Query(default=None),
    # Profiles to exclude (multi-value)
    excludedProfiles: Optional[List[str]] = Query(default=None),
    x_api_secret: str = Header(default=""),
):
    check_secret(x_api_secret)

    filters = {
        "exp": exp,
        "category": category,
        "badge": badge,
        "lang": lang,
        "lat": lat,
        "lon": lon,
        "city": city,
        "location": location,
        "countryCode": countryCode,
        "administrativeAreaLevel1Code": administrativeAreaLevel1Code,
        "administrativeAreaLevel2Code": administrativeAreaLevel2Code,
        "minPrice": minPrice,
        "maxPrice": maxPrice,
        "businessSector": businessSector,
        "remoteEuropa": remoteEuropa,
        "fallback": fallback,
        "excludedProfiles": excludedProfiles,
    }

    try:
        all_profiles = await scrape_profiles(q, pages, filters)
    except Exception:
        raise HTTPException(status_code=502, detail="No profiles found or upstream unavailable.")

    if not all_profiles:
        raise HTTPException(status_code=502, detail="No profiles found or upstream unavailable.")

    return {"profiles": all_profiles, "total": len(all_profiles)}


@app.get("/health")
def health():
    return {"status": "ok"}
