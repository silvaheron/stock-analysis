import argparse
import csv
import re
import time

from pathlib import Path

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from webdriver_manager.chrome import ChromeDriverManager

def initialize_driver():
    download_dir = Path(__file__).resolve().parent

    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    chrome_options.add_experimental_option(
        "prefs",
        {
            "download.default_directory": str(download_dir),
            "download.prompt_for_download": False,
            "download.directory_upgrade": True,
            "safebrowsing.enabled": True,
        },
    )

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_options,
    )

    wait = WebDriverWait(driver, 10)

    return driver, wait

def download_stocks(driver, wait):
    print("Downloading stocks data...")
    
    driver.get("https://statusinvest.com.br/acoes/busca-avancada")

    # Close footer (if it appears)
    close_footer = WebDriverWait(driver, 3).until(
        EC.element_to_be_clickable(
            (By.CSS_SELECTOR, "#footer-fixed > a")
        )
    )
    close_footer.click()

    # Close advertising (if it appears)
    close_button = wait.until(
        EC.element_to_be_clickable(
            (By.CSS_SELECTOR, ".btn-close")
        )
    )
    close_button.click()

    # Click "Buscar"
    search_button = wait.until(
        EC.element_to_be_clickable(
            (By.CSS_SELECTOR, "button.find.btn-main")
        )
    )
    search_button.click()

    # Click "Download"
    download_button = wait.until(
        EC.presence_of_element_located(
            (By.CSS_SELECTOR, "a.btn-download")
        )
    )

    driver.execute_script(
        "arguments[0].click();",
        download_button
    )

    print("Stocks data downloaded successfully.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Scrappe assets data."
    )

    parser.add_argument(
        "--stocks",
        action="store_true",
        help="Scrappe stocks data."
    )

    parser.add_argument(
        "--reits",
        action="store_true",
        help="Scrappe REITs data."
    )

    parser.add_argument(
        "--stocks-service",
        default="statusinvest",
        help="Data provider for stocks (default: statusinvest)."
    )

    parser.add_argument(
        "--stocks-offset",
        type=int,
        default=3_000_000,
        help="Minimum average daily trading volume for stocks (default: 3_000_000)."
    )

    parser.add_argument(
        "--reits-service",
        default="fundsexplorer",
        help="Data provider for REITs (default: fundsexplorer)."
    )

    parser.add_argument(
        "--reits-offset",
        type=int,
        default=500_000,
        help="Minimum average daily trading volume for REITs (default: 500_000)."
    )

    args = parser.parse_args()

    if not (args.stocks or args.reits):
        parser.error("You must specify at least one target: --stocks or --reits.")

    print("=" * 60)
    print("Assets scrapping")
    print("=" * 60)

    if args.stocks:
        print("Stocks")
        print(f"  service : {args.stocks_service}")
        print(f"  offset  : {args.stocks_offset:,}")

    if args.reits:
        print("REITs")
        print(f"  service : {args.reits_service}")
        print(f"  offset  : {args.reits_offset:,}")

    print("=" * 60)

    driver, wait = initialize_driver()

    if args.stocks:
        download_stocks(driver, wait)

    driver.quit()
