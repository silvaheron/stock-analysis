import argparse
import yfinance

from utils import load_assets, save_assets

BATCH_SIZE = 10

def fetch_prices(symbols):
    prices = {}

    tickers = yfinance.Tickers(" ".join(symbols))

    # USD conversion for crypto support if needed later
    usd = None

    for symbol, ticker in tickers.tickers.items():
        try:
            price = (
                ticker.fast_info.get("lastPrice")
                or ticker.info.get("regularMarketPrice")
            )

            if price is not None:
                prices[symbol] = price

        except Exception:
            print(f"Failed to fetch price for {symbol}")

    return prices

def update_prices(asset_type, assets):
    print(f"Updating {asset_type} prices...")

    tickers = list(assets.keys())

    for index in range(0, len(tickers), BATCH_SIZE):
        batch = tickers[index:index + BATCH_SIZE]

        symbols = [
            f"{ticker}.SA"
            for ticker in batch
        ]

        print(
            f"Fetching batch {index // BATCH_SIZE + 1}: "
            f"{', '.join(batch)}"
        )

        prices = fetch_prices(symbols)

        for ticker in batch:
            assets[ticker]["price"] = prices.get(f"{ticker}.SA")

    return assets

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Update asset prices using Yahoo Finance."
    )

    parser.add_argument(
        "--stocks",
        action="store_true",
        help="Update stocks prices."
    )

    parser.add_argument(
        "--reits",
        action="store_true",
        help="Update REITs prices."
    )

    args = parser.parse_args()

    if not (args.stocks or args.reits):
        parser.error(
            "You must specify at least one target: --stocks or --reits."
        )

    print("=" * 60)
    print("Prices update")
    print("=" * 60)

    if args.stocks:
        print("Stocks")
    
    if args.reits:
        print("REITs")

    print("=" * 60)


    targets = []

    if args.stocks:
        targets.append("stocks")

    if args.reits:
        targets.append("reits")


    for target in targets:
        print(f"Processing {target}...")

        assets = load_assets(target)
        assets = update_prices(target, assets)

        save_assets(target, assets)

        print(f"Successfully updated {target}.")


    print("=" * 60)
    print("Prices update completed.")
    print("=" * 60)