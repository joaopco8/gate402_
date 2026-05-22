import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_login_com_email(driver, env):
    """Testa login com email e senha"""
    # Garante que esta deslogado primeiro
    driver.delete_all_cookies()
    driver.get(f"{env['GATE402_URL']}/auth/login")
    time.sleep(3)

    # Verifica se tem campo de email
    try:
        email_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
        )
    except Exception:
        # Se nao achou, pode ter redirecionado para dashboard (ja logado)
        if '/dashboard' in driver.current_url:
            print("[OK] Ja estava logado - " + driver.current_url)
            return
        raise

    email_input.clear()
    email_input.send_keys(env['GATE402_EMAIL'])

    password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
    password_input.clear()
    password_input.send_keys(env['GATE402_PASSWORD'])

    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    # Aguarda qualquer destino pos-login (dashboard, onboarding, wallet, endpoints)
    WebDriverWait(driver, 30).until(
        lambda d: any(p in d.current_url for p in ['/dashboard', '/onboarding', '/wallet', '/endpoints', '/post-login'])
        and '/auth/login' not in d.current_url
    )

    # Se foi para post-login, aguarda destino final
    if '/post-login' in driver.current_url:
        WebDriverWait(driver, 30).until(
            lambda d: any(p in d.current_url for p in ['/dashboard', '/onboarding', '/wallet', '/endpoints'])
        )

    final = driver.current_url
    assert any(p in final for p in ['/dashboard', '/onboarding', '/wallet', '/endpoints']), \
        f"Esperava pagina pos-login, got: {final}"
    print("[OK] Login OK - " + final)

def test_dashboard_carregou(driver, env):
    """Verifica que o dashboard carregou com dados"""
    driver.get(f"{env['GATE402_URL']}/dashboard")
    time.sleep(3)

    assert '/auth/login' not in driver.current_url
    assert '/dashboard' in driver.current_url

    # Verifica que tem conteudo na pagina
    body_text = driver.find_element(By.TAG_NAME, 'body').text
    assert len(body_text) > 100
    print("[OK] Dashboard carregou com conteudo")

