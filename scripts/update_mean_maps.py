"""
Fetches available images for column mean maps from each HATS catalog
and writes it back into the per-catalog catalog.json files.

Run ad-hoc when catalog mean maps need refreshing:
  python scripts/update_mean_maps.py
"""

import glob
import json
import sys
from pathlib import Path

from tqdm import tqdm

from _utils import (
    atomic_json_write,
    iter_leaf_catalogs,
    print_report,
    resolve_catalog_url,
    slug,
)

root_dir = Path(__file__).resolve().parent.parent
data_dir = root_dir / "data"


def run(dirs=None):
    with open(data_dir / "catalogs.json", "r", encoding="utf-8") as f:
        all_leaves = list(iter_leaf_catalogs(json.load(f)))
    if dirs:
        dirs = {slug(d) for d in dirs}
        all_leaves = [leaf for leaf in all_leaves if leaf["dir"] in dirs]

    updated = {"label": [], "column count": []}
    skipped = []

    for leaf in tqdm(all_leaves, desc="Updating column mean maps"):
        catalog_json_path = data_dir / leaf["dir"] / "catalog.json"
        if not catalog_json_path.exists():
            continue

        with open(catalog_json_path, "r", encoding="utf-8") as f:
            catalog_data = json.load(f)

        label = leaf["label"]

        _, skip_reason = resolve_catalog_url(catalog_data)
        if skip_reason:
            skipped.append([label, skip_reason])
            continue

        column_files = _get_available_column_files(leaf["dir"])
        if column_files:
            catalog_data["column_mean_maps"] = sorted(column_files)
            atomic_json_write(catalog_json_path, catalog_data)
            updated["label"].append(label)
            updated["column count"].append(len(column_files))

    print_report(
        [
            ("UPDATED", updated, "keys"),
            ("SKIPPED", skipped, ["label", "reason"]),
        ]
    )


def _get_available_column_files(dir_path):
    pattern = str(data_dir / dir_path / "column_means" / "*.webp")
    return [Path(f).stem for f in glob.glob(pattern)]


if __name__ == "__main__":
    run(dirs=sys.argv[1:] or None)
