import os
import asyncio
from fastapi import FastAPI, Query, HTTPException, Header
from curl_cffi.requests import AsyncSession

app = FastAPI()

MALT_PROFILES_URL = "https://www.malt.fr/search/api/profiles"
PAGES_MAX = 5
API_SECRET = os.environ.get("API_SECRET", "")


def check_secret(x_api_secret: str = Header(default="")):
    if API_SECRET and x_api_secret != API_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.get("/profiles")
async def profiles(
    q: str = Query(..., min_length=2),
    pages: int = Query(default=3, ge=1, le=PAGES_MAX),
    x_api_secret: str = Header(default=""),
):
    check_secret(x_api_secret)

    async with AsyncSession(impersonate="chrome120") as session:
        tasks = [
            session.get(MALT_PROFILES_URL, params={"q": q, "page": p})
            for p in range(1, pages + 1)
        ]
        responses = await asyncio.gather(*tasks, return_exceptions=True)

    all_profiles = []
    for r in responses:
        if isinstance(r, Exception):
            continue
        if r.status_code != 200:
            continue
        try:
            data = r.json()
            all_profiles.extend(data.get("profiles", []))
        except Exception:
            continue

    if not all_profiles:
        raise HTTPException(status_code=502, detail="No profiles found or upstream unavailable.")

    return {"profiles": all_profiles, "total": len(all_profiles)}


@app.get("/health")
def health():
    return {"status": "ok"}
