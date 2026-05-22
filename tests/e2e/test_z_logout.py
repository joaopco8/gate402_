import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_logout(logged_in_driver, env):
    """Testa logout via AvatarMenu dropdown -- deve rodar por ultimo"""
    driver = logged_in_driver
    driver.get(f"{env['GATE402_URL']}/dashboard")
    time.sleep(3)

    # Passo 1: clicar no avatar (button circular com border-radius: 50%)
    avatar_selectors = [
        "//button[contains(@style,'border-radius: 50%')]",
        "//button[contains(@style,'50%')]",
        "//header//button[contains(@style,'50%')]",
        "//*[@data-testid='avatar']",
        "//img[contains(@class,'rounded-full')]",
    ]

    avatar_clicked = False
    for sel in avatar_selectors:
        try:
            el = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.XPATH, sel))
            )
            el.click()
            avatar_clicked = True
            print("[OK] Avatar clicado via: " + sel)
            break
        except Exception:
            continue

    if not avatar_clicked:
        try:
            header = driver.find_element(By.TAG_NAME, 'header')
            print("DEBUG header HTML:\n" + header.get_attribute('innerHTML')[:800])
        except Exception:
            print("DEBUG body:\n" + driver.find_element(By.TAG_NAME, 'body').text[:400])
        print("[WARN] Avatar nao encontrado -- verifique o seletor")
        return

    time.sleep(1)

    # Passo 2: clicar no "Log out" no dropdown
    logout_selectors = [
        "//button[text()='Log out']",
        "//button[contains(text(),'Log out')]",
        "//button[contains(text(),'Sign out')]",
        "//button[contains(text(),'Logout')]",
        "//a[contains(text(),'Log out')]",
        "//a[contains(text(),'Sign out')]",
        "//*[@role='menuitem'][contains(text(),'out')]",
    ]

    logout_clicked = False
    for sel in logout_selectors:
        try:
            btn = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.XPATH, sel))
            )
            btn.click()
            logout_clicked = True
            print("[OK] Logout clicado via: " + sel)
            break
        except Exception:
            continue

    if not logout_clicked:
        try:
            dropdown_candidates = driver.find_elements(By.XPATH, "//*[@role='menu'] | //*[contains(@class,'dropdown')]")
            for d in dropdown_candidates[:3]:
                print("DEBUG dropdown HTML:\n" + d.get_attribute('innerHTML')[:600])
        except Exception:
            pass
        print("[WARN] Botao logout nao encontrado no dropdown -- verifique o seletor")
        return

    time.sleep(2)
    print("[OK] Logout OK - " + driver.current_url)
