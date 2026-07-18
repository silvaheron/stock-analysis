import argparse
import json

from pathlib import Path

def run_bazin(asset, rate):
    pass

def run_lynch(asset):
    pass

def run_greenblatt(asset):
    pass

def run_graham(asset):
    pass

def load_assets(asset_type):
    filename = f"{asset_type}.json"

    path = Path(filename)

    if not path.exists():
        print(f"File not found: {filename}")
        return {}

    with path.open("r", encoding="utf-8") as file:
        return json.load(file)

def save_assets(asset_type, assets):
    # TODO: implement JSON saving
    pass

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

        for ticker, asset in assets.items():
            result = {}

            for analysis in selected_analyses:
                output = analysis(asset)

                if output:
                    result.update(output)

            asset.update(result)

        save_assets(target, assets)

        print(f"Successfully processed {target}.")

    print("=" * 60)
    print("Analysis completed")
    print("=" * 60)
