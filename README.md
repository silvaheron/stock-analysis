# Assets Scraper

A command-line tool for scraping financial market data from supported providers.

## Requirements

* Python 3.10 or newer
* Google Chrome

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd <repository-name>
```

Create a virtual environment (recommended).

### Linux / macOS

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### Windows (PowerShell)

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

Install the project dependencies:

```bash
pip install -r requirements.txt
```

## Usage

The scraper is executed from the command line. At least one target must be specified.

### Stocks

```bash
python scraper.py --stocks
```

### REITs

```bash
python scraper.py --reits
```

### Multiple targets

```bash
python scraper.py --stocks --reits
```

## Available options

### Stocks

| Argument           | Default        | Description                           |
| ------------------ | -------------- | ------------------------------------- |
| `--stocks`         | -              | Scrape stocks data.                   |
| `--stocks-service` | `statusinvest` | Data provider.                        |
| `--stocks-offset`  | `3000000`      | Minimum average daily trading volume. |

Example:

```bash
python scraper.py --stocks --stocks-offset 5000000
```

### REITs

| Argument          | Default         | Description                           |
| ----------------- | --------------- | ------------------------------------- |
| `--reits`         | -               | Scrape REITs data.                    |
| `--reits-service` | `fundsexplorer` | Data provider.                        |
| `--reits-offset`  | `500000`        | Minimum average daily trading volume. |

Example:

```bash
python scraper.py --reits --reits-offset 1000000
```

## Notes

* Google Chrome must be installed.
* ChromeDriver is managed automatically by `webdriver-manager`; no manual installation is required.
* Additional scraping targets and providers may be added in future releases.

## Analysis

The analysis script runs calculations over the existing assets data stored in the JSON files.

At least one target (`--stocks` or `--reits`) and one analysis method must be specified.

### Stocks

Run stock analyses:

```bash
python analysis.py --stocks --lynch --greenblatt --graham
```

### REITs

Run REIT analyses:

```bash
python analysis.py --reits --bazin --rate 8
```

### Multiple targets

Run analyses for both stocks and REITs:

```bash
python analysis.py --stocks --reits --lynch --greenblatt --graham --bazin --rate 8
```

## Available options

### Targets

| Argument   | Description                    |
| ---------- | ------------------------------ |
| `--stocks` | Run analysis on stocks data.   |
| `--reits`  | Run analysis on REITs data.    |

### Analysis methods

| Argument        | Description                                      |
| --------------- | ------------------------------------------------ |
| `--bazin`       | Calculates Bazin dividend yield valuation. REITs only. |
| `--rate`        | Required Bazin dividend rate percentage. Example: `8` means 8%. |
| `--lynch`       | Calculates Peter Lynch ratio.                   |
| `--greenblatt`  | Calculates Greenblatt ranking.                   |
| `--graham`      | Calculates Graham intrinsic value estimate.     |

### Examples

Run Bazin analysis using an 8% required dividend yield:

```bash
python analysis.py --reits --bazin --rate 8
```

Run stock valuation analyses:

```bash
python analysis.py --stocks --lynch --greenblatt --graham
```

Run all available analyses:

```bash
python analysis.py --stocks --reits --bazin --rate 8 --lynch --greenblatt --graham
```

## Output

The analysis results are merged into the existing asset JSON files:

- `stocks.json`
- `reits.json`

Existing asset data is preserved, and calculated metrics are added or updated.