# Scripts

Python scripts for maintaining catalog data. They share a virtual environment at `.venv/` (created automatically on first run of `update_data.sh`).

## Usage

```bash
./scripts/update_data.sh [dir ...]   # update one or all catalogs
```

To run individual scripts, activate the virtual environment first:

```bash
source .venv/bin/activate
python scripts/update_index.py    # run from repo root
```

## Scripts

| Script                             | Description                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `update_data.sh [dir ...]`         | Runs all update scripts for the given catalogs (or all if no args). Use after adding or modifying a catalog. |
| `update_index.py`                  | Rebuilds `data/catalogs.json` and `data/rubinCatalogs.json` from per-catalog `catalog.json` files.           |
| `update_metadata.py [dir ...]`     | Fetches live metadata (row count, size, etc.) from each HATS catalog. Requires network access.               |
| `update_mean_maps.py [dir ...]`    | Scans `assets/img/maps/column_means/` and updates `column_mean_maps` in each `catalog.json`.                 |
| `update_density_maps.py [dir ...]` | Generates point density map images. Skips catalogs whose map is already up to date.                          |
| `check_catalogs.py`                | Verifies all catalog URLs are reachable. Run by the `connectivity-checks` CI workflow.                       |
