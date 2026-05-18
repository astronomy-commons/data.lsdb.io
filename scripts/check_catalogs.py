"""
Attempts to load every catalog via hats and reports success, load time, and any failures.

Run ad-hoc to verify catalog URLs are reachable:
  python scripts/check_catalogs.py

Also executed automatically by the connectivity-checks CI workflow.
"""

import json
import time
from pathlib import Path

import numpy as np
from tqdm import tqdm

from _utils import iter_leaf_catalogs, print_report, read_hats_catalog, resolve_catalog_url

data_dir = Path(__file__).resolve().parent.parent / "data"


def run():
    with open(data_dir / "catalogs.json", "r", encoding="utf-8") as f:
        all_leaves = list(iter_leaf_catalogs(json.load(f)))

    bad_catalogs = []
    skipped = []
    features = {"label": [], "builder": [], "creation_date": [], "load_time (s)": []}

    for leaf in tqdm(all_leaves, desc="Checking catalogs"):
        label = leaf["label"]
        catalog_json_path = data_dir / leaf["dir"] / "catalog.json"

        if not catalog_json_path.exists():
            skipped.append([label, "catalog.json not found"])
            continue

        with open(catalog_json_path, "r", encoding="utf-8") as f:
            catalog_data = json.load(f)

        catalog_url, skip_reason = resolve_catalog_url(catalog_data)
        if skip_reason:
            skipped.append([label, skip_reason])
            continue

        start = time.perf_counter()
        try:
            cat = read_hats_catalog(catalog_url)
            extra_properties = cat.catalog_info.extra_dict()
            features["label"].append(label)
            features["builder"].append(extra_properties.get("hats_builder", "UNKNOWN"))
            features["creation_date"].append(extra_properties.get("hats_creation_date", "UNKNOWN"))
            features["load_time (s)"].append(time.perf_counter() - start)
        except Exception as ee:
            print("=================", label, "=================")
            print(ee)
            bad_catalogs.append([label, ee])

    order = np.argsort(features["creation_date"], kind="stable")
    sorted_features = {k: np.array(v)[order].tolist() for k, v in features.items()}

    sections = [
        ("SUCCESS", sorted_features, "keys"),
        ("SKIPPED", skipped, ["label", "message"]),
    ]
    if not print_report(sections, failed=bad_catalogs, failed_headers=["label", "message"]):
        raise RuntimeError(f"There were problems with {len(bad_catalogs)} catalog(s)")


if __name__ == "__main__":
    run()
