import os
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from dotenv import dotenv_values
import time

config = dotenv_values("tests/e2e/.env.test")

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

    # Headless em CI, com janela em desenvolvimento local
    is_ci = os.environ.get('CI', 'false').lower() == 'true'
    if is_ci:
        options.add_argument("--headless=new")
        options.add_argument("--disable-gpu")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )
    driver.implicitly_wait(5)
    yield driver
    driver.quit()

def do_login(driver, env):
    """Idempotent login -- skips if already authenticated."""
    driver.get(f"{env['GATE402_URL']}/auth/login")
    time.sleep(3)

    # Already redirected -- session still valid
    if any(p in driver.current_url for p in ['/dashboard', '/onboarding', '/wallet', '/endpoints']):
        print("[OK] Already logged in - " + driver.current_url)
        return

    # Fill login form
    try:
        email_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
        )
    except Exception:
        if '/dashboard' in driver.current_url:
            return
        raise

    email_input.clear()
    email_input.send_keys(env['GATE402_EMAIL'])

    password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
    password_input.clear()
    password_input.send_keys(env['GATE402_PASSWORD'])

    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    # Wait through full redirect chain: /post-login -> /onboarding | /dashboard
    WebDriverWait(driver, 30).until(
        lambda d: any(p in d.current_url for p in ['/dashboard', '/onboarding', '/wallet', '/endpoints'])
    )
    print("[OK] Login complete - " + driver.current_url)

@pytest.fixture(scope="session")
def logged_in_driver(driver, env):
    """Session-scoped driver guaranteed to be authenticated."""
    do_login(driver, env)
    yield driver

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rep = outcome.get_result()

    if rep.when == 'call' and rep.failed:
        driver = item.funcargs.get('logged_in_driver') or item.funcargs.get('driver')
        if driver:
            os.makedirs('tests/e2e/screenshots', exist_ok=True)
            name = item.name.replace('/', '_').replace(' ', '_')
            path = f"tests/e2e/screenshots/{name}.png"
            try:
                driver.save_screenshot(path)
                print(f"\n[screenshot] {path}")
            except Exception:
                pass
