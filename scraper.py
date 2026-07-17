import argparse
import csv
import json
import re
import time

from pathlib import Path

from selenium import webdriver
from selenium.common.exceptions import TimeoutException
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

def rename_download(new_name, timeout=30):
    download_dir = Path.cwd()

    old_file = download_dir / "statusinvest-busca-avancada.csv"
    new_file = download_dir / new_name

    start = time.time()
    while time.time() - start < timeout:
        # Wait until Chrome finishes downloading
        if old_file.exists() and not (download_dir / "statusinvest-busca-avancada.csv.crdownload").exists():
            old_file.replace(new_file)
            return

        time.sleep(0.5)

    raise TimeoutError("Download did not finish.")

def download_assets(driver, wait, asset_type):
    print(f"Downloading {asset_type} data...")
    
    if asset_type == "stocks":
        driver.get("https://statusinvest.com.br/acoes/busca-avancada")
    elif asset_type == "reits":
        driver.get("https://statusinvest.com.br/fundos-imobiliarios/busca-avancada")
    else:
        raise ValueError(f"Unknown asset type: {asset_type}")

    # Close footer (if it appears)
    try:
        close_footer = WebDriverWait(driver, 3).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "#footer-fixed > a"))
        )
        close_footer.click()
    except TimeoutException:
        pass

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

    rename_download(f"{asset_type.lower()}.csv")

    print(f"Assets downloaded successfully.")

def parse_brazilian_number(value: str) -> float:
    """
    Converts strings like:
        14.777.474,04 -> 14777474.04
        2.890,65      -> 2890.65
    """
    if not value:
        return 0.0

    return float(
        value.strip()
             .replace(".", "")
             .replace(",", ".")
    )

def filter_assets(offset, asset_type):
    print(f"Filtering {asset_type} data...")

    csv_file = Path(__file__).parent / f"{asset_type}.csv"

    assets = []

    with open(csv_file, encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f, delimiter=";")

        for row in reader:
            row = {k.strip(): v for k, v in row.items()}

            liquidity = parse_brazilian_number(
                row["LIQUIDEZ MEDIA DIARIA"]
            )

            if liquidity >= offset:
                assets.append(row["TICKER"])

    print("Data filtered successfully.")

    return assets

def get_statusinvest_metrics(driver, symbol):
    url = f"https://statusinvest.com.br/acoes/{symbol.lower()}"
    driver.get(url)

    sector_div = driver.find_element(By.CSS_SELECTOR, "div.info.pr-md-2:not(.pl-md-2)")
    sector = sector_div.find_element(By.TAG_NAME, "strong").text

    sector_sub_div = driver.find_element(By.CSS_SELECTOR, "div.info.pl-md-2.pr-md-2")
    sector_sub = sector_sub_div.find_element(By.TAG_NAME, "strong").text

    segment_div = driver.find_element(By.CSS_SELECTOR, "div.info.pl-md-2:not(.pr-md-2)")
    segment = segment_div.find_element(By.TAG_NAME, "strong").text

    dy = driver.find_element(By.XPATH, "//h3[normalize-space(text())='D.Y']/parent::a/following-sibling::div//strong").text
    pl = driver.find_element(By.XPATH, "//h3[normalize-space(text())='P/L']/parent::a/following-sibling::div//strong").text
    pv = driver.find_element(By.XPATH, "//h3[normalize-space(text())='P/VP']/parent::a/following-sibling::div//strong").text
    roe = driver.find_element(By.XPATH, "//h3[normalize-space(text())='ROE']/parent::a/following-sibling::div//strong").text
    roa = driver.find_element(By.XPATH, "//h3[normalize-space(text())='ROA']/parent::a/following-sibling::div//strong").text
    roic = driver.find_element(By.XPATH, "//h3[normalize-space(text())='ROIC']/parent::a/following-sibling::div//strong").text
    eps = driver.find_element(By.XPATH, "//h3[normalize-space(text())='VPA']/parent::a/following-sibling::div//strong").text
    bvps = driver.find_element(By.XPATH, "//h3[normalize-space(text())='LPA']/parent::a/following-sibling::div//strong").text
    ev_ebit = driver.find_element(By.XPATH, "//h3[normalize-space(text())='EV/EBIT']/parent::a/following-sibling::div//strong").text
    cagr = driver.find_element(By.XPATH,"//h3[normalize-space()='CAGR Lucros 5 anos']/following-sibling::div//strong").text

    return {
        "sector": sector,
        "sector_sub": sector_sub,
        "segment": segment,
        "dy": dy,
        "pl": pl,
        "pv": pv,
        "roe": roe,
        "roa": roa,
        "roic": roic,
        "eps": eps,
        "bvps": bvps,
        "ev_ebit": ev_ebit,
        "cagr": cagr,
    }

def get_stock_metrics(driver, symbol, service):
    if service == "statusinvest":
        return get_statusinvest_metrics(driver, symbol)
    
    raise ValueError(f"Unknown service: {service}")

def save_metrics(ticker: str, metrics: dict, asset_type: str):
    file = Path(f"{asset_type}.json")

    if file.exists():
        with file.open("r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        data = {}

    data[ticker] = metrics

    with file.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

def get_reits(driver):
    driver.get("https://fiis.com.br/lista-de-fundos-imobiliarios/")

    cookies_button = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, "hs-eu-cookie-confirmation-button-group")))
    cookies_button.click()

    time.sleep(1)

    wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "div.tickerBox")))

    containers = driver.find_elements(By.CSS_SELECTOR, "div.tickerBox")

    results = {}

    for box in containers:
        try:
            symbol = box.find_element(By.CSS_SELECTOR, "div.tickerBox__title").text.strip()
            if not symbol:
                continue

            type_text = box.find_element(By.CSS_SELECTOR, "span.tickerBox__type").text.strip()

            parts = type_text.split(":")
            sector = parts[0].strip().title()
            sector_sub = parts[1].strip().title() if len(parts) > 1 else ""

            info_values = box.find_elements(By.CSS_SELECTOR, ".tickerBox__info__box")
            if len(info_values) >= 2:
                dy_text = info_values[0].text.strip()
                company_assets = info_values[1].text.strip()
                if dy_text == "-" or company_assets == "-":
                    continue
            else:
                continue

            results[symbol] = {
                "sector": sector,
                "sector_sub": sector_sub
            }
        except Exception as e:
            continue

    return results

def parse_fundsexplorer_number(value):
    value = value.upper().strip()

    multiplier = 1
    if "K" in value:
        multiplier = 1_000
    elif "M" in value:
        multiplier = 1_000_000

    numeric = re.sub(r'[^\d,\.]', '', value)
    numeric = float(numeric.replace('.', '').replace(',', '.'))

    return numeric * multiplier

def get_fundsexplorer_data(driver, symbol, offset):
    driver.get(f"https://www.fundsexplorer.com.br/funds/{symbol}")

    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".indicators__box")))

    dy = driver.find_element(By.XPATH, "//div[@class='indicators__box'][.//p[normalize-space(text())='Dividend Yield']]//p[2]/b").text.strip()
    pv = driver.find_element(By.XPATH, "//div[@class='indicators__box'][.//p[normalize-space(text())='P/VP']]//p[2]/b").text.strip()

    avg_liquid = driver.find_element(By.XPATH, "//div[@class='indicators__box'][.//p[normalize-space(text())='Liquidez Média Diária']]//p[2]/b").text.strip()

    try:
        liquidity = parse_fundsexplorer_number(avg_liquid)
        if liquidity < offset:
            return
    except ValueError:
        return

    return {
        "dy": dy,
        "pv": pv,
        "liquidity": liquidity
    }

def get_reit_metrics(driver, symbol, service, offset):
    if service == "fundsexplorer":
        return get_fundsexplorer_data(driver, symbol, offset)

    raise ValueError(f"Unknown service: {service}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Scrape assets data."
    )

    parser.add_argument(
        "--stocks",
        action="store_true",
        help="Scrape stocks data."
    )

    parser.add_argument(
        "--reits",
        action="store_true",
        help="Scrape REITs data."
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
        download_assets(driver, wait, "stocks")
        for ticker in filter_assets(args.stocks_offset, "stocks"):
            metrics = get_stock_metrics(driver, ticker, args.stocks_service)
            save_metrics(ticker, metrics, "stocks")

    if args.reits:
        download_assets(driver, wait, "reits")

        reits_data = get_reits(driver)

        for ticker in filter_assets(args.reits_offset, "reits"):
            metrics = get_reit_metrics(driver, ticker, args.reits_service, args.reits_offset)
            if metrics is not None:
                save_metrics(ticker, {
                    **reits_data.get(ticker, {}),
                    **metrics
                }, "reits")

    driver.quit()
