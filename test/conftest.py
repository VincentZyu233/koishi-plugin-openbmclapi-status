import os
import pytest
import httpx

DEFAULT_API_BASE = "https://bd.bangbang93.com"

@pytest.fixture(scope="session")
def api_base() -> str:
    return os.getenv("OPENBMCLAPI_API_BASE", DEFAULT_API_BASE).rstrip("/")

@pytest.fixture(scope="session")
def client(api_base: str):
    proxy = os.getenv("HTTP_PROXY") or os.getenv("http_proxy")
    with httpx.Client(base_url=api_base, timeout=15.0, proxy=proxy, follow_redirects=True) as c:
        yield c
