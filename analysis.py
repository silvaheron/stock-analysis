import argparse
import json
import math

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

def get_available_analyses(target, args):
    analyses = []

    if args.bazin:
        analyses.append(
            lambda asset: run_bazin(asset, args.rate)
        )

    if target == "stocks":
        if args.lynch:
            analyses.append(run_lynch)

        if args.greenblatt:
            analyses.append(run_greenblatt)

        if args.graham:
            analyses.append(run_graham)

    return analyses

def run_bazin(asset, rate):
    rate = rate / 100

    div_avg = asset.get("div_avg")

    if not div_avg or div_avg < 0:
        return {
            "bazin": None
        }

    return {
        "bazin": div_avg / rate
    }

def parse_percentage(value):
    if value is None:
        return 0

    value = str(value).strip()
    value = value.replace("%", "").replace(",", ".")

    if value in ("", "-", "—", "N/A"):
        return 0

    return float(value) / 100

def parse_number(value):
    if value is None:
        return None

    value = str(value).strip()

    if value in ("", "-", "—", "N/A"):
        return None

    value = value.replace(",", ".")

    try:
        return float(value)
    except ValueError:
        return None
    
def run_lynch(asset):
    pl_avg = asset.get("pl_avg")

    if pl_avg is None or pl_avg <= 0:
        return {
            "lynch": None
        }

    cagr = parse_percentage(asset.get("cagr"))
    dy_avg = asset.get("dy_avg") or 0

    lynch = (cagr + dy_avg) / pl_avg

    return {
        "lynch": lynch if lynch > 0 else None
    }

def run_greenblatt(asset):
    pass

def run_graham(asset):
    eps = parse_number(asset.get("eps"))
    bvps = parse_number(asset.get("bvps"))

    if eps is None or bvps is None:
        return {
            "graham": None
        }

    if eps < 0 or bvps < 0:
        return {
            "graham": 0
        }

    return {
        "graham": math.sqrt(22.5 * eps * bvps)
    }

def load_assets(asset_type):
    filename = f"{asset_type}.json"

    path = Path(filename)

    if not path.exists():
        print(f"File not found: {filename}")
        return {}

    with path.open("r", encoding="utf-8") as file:
        return json.load(file)

def save_assets(asset_type, assets):
    path = BASE_DIR / f"{asset_type}.json"
    temp_path = BASE_DIR / f"{asset_type}.tmp"

    with temp_path.open("w", encoding="utf-8") as file:
        json.dump(
            assets,
            file,
            ensure_ascii=False,
            indent=4
        )

    temp_path.replace(path)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Analyze assets data."
    )

    parser.add_argument(
        "--stocks",
        action="store_true",
        help="Analyze stocks data."
    )

    parser.add_argument(
        "--reits",
        action="store_true",
        help="Analyze REITs data."
    )

    parser.add_argument(
        "--bazin",
        action="store_true",
        help="Run Bazin analysis."
    )

    parser.add_argument(
        "--rate",
        type=float,
        help="Dividend yield target percentage for Bazin."
    )

    parser.add_argument(
        "--lynch",
        action="store_true",
        help="Run Lynch analysis."
    )

    parser.add_argument(
        "--greenblatt",
        action="store_true",
        help="Run Greenblatt analysis."
    )

    parser.add_argument(
        "--graham",
        action="store_true",
        help="Run Graham analysis."
    )

    args = parser.parse_args()

    if not (args.stocks or args.reits):
        parser.error(
            "You must specify at least one target: --stocks or --reits."
        )

    if not (
        args.bazin
        or args.lynch
        or args.greenblatt
        or args.graham
    ):
        parser.error(
            "You must specify at least one analysis: "
            "--bazin, --lynch, --greenblatt or --graham."
        )

    if args.bazin and args.rate is None:
        parser.error(
            "--rate is required when using --bazin."
        )

    print("=" * 60)
    print("Assets analysis")
    print("=" * 60)

    if args.stocks:
        print("Stocks: enabled")

    if args.reits:
        print("REITs: enabled")

    print()

    print("Analyses:")

    if args.bazin:
        print(f"  Bazin       : enabled ({args.rate:.2f}%)")

    if args.lynch:
        print("  Lynch       : enabled")

    if args.greenblatt:
        print("  Greenblatt  : enabled")

    if args.graham:
        print("  Graham      : enabled")

    print("=" * 60)

    selected_analyses = []

    if args.bazin:
        selected_analyses.append(
            lambda asset: run_bazin(asset, args.rate)
        )

    if args.lynch:
        selected_analyses.append(run_lynch)

    if args.greenblatt:
        selected_analyses.append(run_greenblatt)

    if args.graham:
        selected_analyses.append(run_graham)

    targets = []

    if args.stocks:
        targets.append("stocks")

    if args.reits:
        targets.append("reits")

    for target in targets:
        print(f"Processing {target}...")

        assets = load_assets(target)

        analyses = get_available_analyses(target, args)

        if not analyses:
            print(f"No compatible analyses for {target}.")
            continue

        for ticker, asset in assets.items():
            result = {}
            
            print(f"Processing {ticker}...")
            for analysis in analyses:
                output = analysis(asset)

                if output:
                    result.update(output)
            print(f"Successfully processed {ticker}.")

            asset.update(result)

        save_assets(target, assets)

        print(f"Successfully processed {target}.")

    print("=" * 60)
    print("Analysis completed")
    print("=" * 60)
