import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_navegar_para_wallet(logged_in_driver, env):
    """Testa navegacao para Wallet"""
    logged_in_driver.get(f"{env['GATE402_URL']}/dashboard")
    time.sleep(2)

    wallet_link = WebDriverWait(logged_in_driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//a[contains(@href, '/wallet')]"))
    )
    wallet_link.click()
    time.sleep(2)

    assert '/wallet' in logged_in_driver.current_url
    print("[OK] Wallet carregou - " + logged_in_driver.current_url)

def test_navegar_para_endpoints(logged_in_driver, env):
    """Testa navegacao para Endpoints"""
    logged_in_driver.get(f"{env['GATE402_URL']}/dashboard")
    time.sleep(2)

    endpoints_link = WebDriverWait(logged_in_driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//a[contains(@href, '/endpoints')]"))
    )
    endpoints_link.click()
    time.sleep(2)

    assert '/endpoints' in logged_in_driver.current_url
    print("[OK] Endpoints carregou - " + logged_in_driver.current_url)

def test_navegar_para_playground(logged_in_driver, env):
    """Testa navegacao para Playground"""
    logged_in_driver.get(f"{env['GATE402_URL']}/dashboard")
    time.sleep(2)

    playground_link = WebDriverWait(logged_in_driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//a[contains(@href, '/playground')]"))
    )
    playground_link.click()
    time.sleep(2)

    assert '/playground' in logged_in_driver.current_url
    print("[OK] Playground carregou - " + logged_in_driver.current_url)

def test_navegar_para_billing(logged_in_driver, env):
    """Testa navegacao para Billing"""
    logged_in_driver.get(f"{env['GATE402_URL']}/dashboard")
    time.sleep(2)

    billing_link = WebDriverWait(logged_in_driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//a[contains(@href, '/billing')]"))
    )
    billing_link.click()
    time.sleep(2)

    assert '/billing' in logged_in_driver.current_url
    print("[OK] Billing carregou - " + logged_in_driver.current_url)
