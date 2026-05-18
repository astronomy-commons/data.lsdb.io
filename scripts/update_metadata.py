"""
Fetches live metadata (row count, columns, partitions, size, hats builder)
from each HATS catalog and writes it back into the per-catalog catalog.json files.

Run ad-hoc when catalog metadata needs refreshing:
  python scripts/update_metadata.py
"""

import json
import sys
from pathlib import Path

import human_readable
from hats.pixel_math.spatial_index import SPATIAL_INDEX_COLUMN
from tqdm import tqdm

from _utils import (
    atomic_json_write,
    iter_leaf_catalogs,
    print_report,
    read_hats_catalog,
    resolve_catalog_url,
)

root_dir = Path(__file__).resolve().parent.parent
data_dir = root_dir / "data"


def run(dirs=None):
    with open(data_dir / "catalogs.json", "r", encoding="utf-8") as f:
        all_leaves = list(iter_leaf_catalogs(json.load(f)))
    if dirs:
        all_leaves = [leaf for leaf in all_leaves if leaf["dir"] in dirs]

    updated = {
        "label": [],
        "rows": [],
        "columns": [],
        "partitions": [],
        "size": [],
        "builder": [],
    }
    skipped = []
    failed = []

    for leaf in tqdm(all_leaves, desc="Updating metadata"):
        label = leaf["label"]
        catalog_json_path = data_dir / leaf["dir"] / "catalog.json"

        if not catalog_json_path.exists():
            skipped.append([label, "catalog.json not found"])
            continue

        with open(catalog_json_path, "r", encoding="utf-8") as f:
            catalog_data = json.load(f)

        if label in ("TNS", "VSX"):
            skipped.append([label, "continuous updates"])
            continue

        catalog_url, skip_reason = resolve_catalog_url(catalog_data)
        if skip_reason:
            skipped.append([label, skip_reason])
            continue

        try:
            hats_catalog = read_hats_catalog(catalog_url)
            cat_info = hats_catalog.catalog_info

            md = catalog_data.setdefault("metadata", {})
            md["numRows"] = cat_info.total_rows
            column_names = hats_catalog.schema.names
            has_healpix_column = SPATIAL_INDEX_COLUMN in column_names
            md["numColumns"] = len(column_names) - int(has_healpix_column)
            md["numPartitions"] = len(hats_catalog.get_healpix_pixels())
            md["sizeOnDisk"] = human_readable.file_size(
                int(cat_info.hats_estsize) * 1024, binary=True
            )
            md["hatsBuilder"] = cat_info.extra_dict()["hats_builder"]

            atomic_json_write(catalog_json_path, catalog_data)

            updated["label"].append(label)
            updated["rows"].append(md["numRows"])
            updated["columns"].append(md["numColumns"])
            updated["partitions"].append(md["numPartitions"])
            updated["size"].append(md["sizeOnDisk"])
            updated["builder"].append(md["hatsBuilder"])
        except Exception as ee:
            failed.append([label, ee])

    sections = [
        ("UPDATED", updated, "keys"),
        ("SKIPPED", skipped, ["label", "reason"]),
    ]
    if not print_report(sections, failed=failed):
        raise RuntimeError(f"There were problems with {len(failed)} catalog(s)")


if __name__ == "__main__":
    run(dirs=sys.argv[1:] or None)
