import os
import json
import time
import requests as http_requests
import pytest
from dotenv import dotenv_values
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

config = dotenv_values("tests/e2e/.env.test")

SUPABASE_URL = "https://ungrnesvfazuhjcyslfb.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZ3JuZXN2ZmF6dWhqY3lzbGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4OTY5OTksImV4cCI6MjA5MzQ3Mjk5OX0.FcyeYCJt_NaW7VA9bLc1Grj2ohysw08JVuSn75A9sA8"
STORAGE_KEY = "sb-ungrnesvfazuhjcyslfb-auth-token"
AUTHENTICATED_PATHS = ['/dashboard', '/onboarding', '/wallet', '/endpoints']

@pytest.fixture(scope="session")
def env():
    return config

@pytest.fixture(scope="session")
def driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1280,900")
    options.add_argument("--disable-blink-features=AutomationControlled")

    is_ci = os.environ.get('CI', 'false').lower() == 'true'
    if is_ci:
        options.add_argument("--headless=new")
        options.add_argument("--disable-gpu")

    drv = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )
    drv.implicitly_wait(5)
    yield drv
    drv.quit()

def do_login_via_api(driver, env):
    """Login via Supabase REST API — inject session into localStorage."""
    res = http_requests.post(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        headers={
            "apikey": SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
        },
        json={
            "email": env["GATE402_EMAIL"],
            "password": env["GATE402_PASSWORD"],
        },
        timeout=15,
    )

    if res.status_code != 200:
        print(f"[login-api] failed {res.status_code}: {res.text[:200]}")
        return False

    data = res.json()
    access_token = data.get("access_token")
    if not access_token:
        print("[login-api] no access_token in response")
        return False

    session_payload = {
        "access_token": access_token,
        "refresh_token": data.get("refresh_token"),
        "expires_at": data.get("expires_at"),
        "token_type": "bearer",
        "user": data.get("user"),
    }

    # Must be on the domain before writing localStorage
    driver.get(f"{env['GATE402_URL']}/auth/login")
    time.sleep(2)

    driver.execute_script(
        "localStorage.setItem(arguments[0], arguments[1]);",
        STORAGE_KEY,
        json.dumps(session_payload),
    )

    driver.get(f"{env['GATE402_URL']}/dashboard")
    time.sleep(3)

    print(f"[login-api] injected session — {driver.current_url}")
    return any(p in driver.current_url for p in AUTHENTICATED_PATHS)

def do_login_via_form(driver, env):
    """Fallback: fill login form and wait for redirect."""
    driver.get(f"{env['GATE402_URL']}/auth/login")
    time.sleep(3)

    if any(p in driver.current_url for p in AUTHENTICATED_PATHS):
        print("[login-form] already authenticated — " + driver.current_url)
        return True

    try:
        email_input = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
        )
    except Exception:
        if any(p in driver.current_url for p in AUTHENTICATED_PATHS):
            return True
        raise

    email_input.clear()
    email_input.send_keys(env['GATE402_EMAIL'])

    pwd = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
    pwd.clear()
    pwd.send_keys(env['GATE402_PASSWORD'])

    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    try:
        WebDriverWait(driver, 45).until(
            lambda d: any(p in d.current_url for p in AUTHENTICATED_PATHS)
        )
        print("[login-form] success — " + driver.current_url)
        return True
    except Exception as e:
        print(f"[login-form] failed: {e} — {driver.current_url}")
        return False

@pytest.fixture(scope="session")
def logged_in_driver(driver, env):
    """Session-scoped driver guaranteed to be authenticated."""
    success = do_login_via_api(driver, env)
    if not success:
        print("[login] API failed, falling back to form")
        success = do_login_via_form(driver, env)
    if not success:
        raise RuntimeError(f"Login failed — current URL: {driver.current_url}")
    print(f"[fixture] logged_in_driver ready — {driver.current_url}")
    yield driver

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rep = outcome.get_result()

    if rep.when == 'call' and rep.failed:
        drv = item.funcargs.get('logged_in_driver') or item.funcargs.get('driver')
        if drv:
            os.makedirs('tests/e2e/screenshots', exist_ok=True)
            name = item.name.replace('/', '_').replace(' ', '_')
            path = f"tests/e2e/screenshots/{name}.png"
            try:
                drv.save_screenshot(path)
                print(f"\n[screenshot] {path}")
            except Exception:
                pass
