import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_pagina_endpoints_carrega(logged_in_driver, env):
    """Verifica que a pagina de endpoints carrega"""
    logged_in_driver.get(f"{env['GATE402_URL']}/endpoints")
    time.sleep(3)

    assert '/endpoints' in logged_in_driver.current_url
    print("[OK] Endpoints page carregou")

def test_billing_tem_plano(logged_in_driver, env):
    """Verifica que a pagina de billing mostra o plano"""
    logged_in_driver.get(f"{env['GATE402_URL']}/billing")
    time.sleep(3)

    # Verifica que tem algum plano na pagina
    body_text = logged_in_driver.find_element(By.TAG_NAME, 'body').text
    assert 'Free' in body_text or 'Pro' in body_text
    print("[OK] Billing mostra plano corretamente")
