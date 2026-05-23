import time
from selenium.webdriver.common.by import By

AUTHENTICATED_PATHS = ['/dashboard', '/onboarding', '/wallet', '/endpoints']

def test_login_com_email(logged_in_driver, env):
    """Testa login com email e senha via API Supabase."""
    final = logged_in_driver.current_url
    assert any(p in final for p in AUTHENTICATED_PATHS), \
        f"Esperava pagina pos-login, got: {final}"
    print("[OK] Login OK - " + final)

def test_dashboard_carregou(logged_in_driver, env):
    """Verifica que o dashboard carregou com dados"""
    logged_in_driver.get(f"{env['GATE402_URL']}/dashboard")
    time.sleep(3)

    assert '/auth/login' not in logged_in_driver.current_url
    assert '/dashboard' in logged_in_driver.current_url

    body_text = logged_in_driver.find_element(By.TAG_NAME, 'body').text
    assert len(body_text) > 100
    print("[OK] Dashboard carregou com conteudo")

