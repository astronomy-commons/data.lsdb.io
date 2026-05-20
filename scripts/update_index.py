#!/usr/bin/env python3
"""
Regenerates data/catalogs.json and data/rubinCatalogs.json
from the per-catalog catalog.json files under data/.

Run ad-hoc after adding or removing a catalog directory:
  python scripts/update_index.py
"""

import glob
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")

PINNED_GROUPS = ["Rubin DP1"]

# Explicit catalog order within a group. Labels not listed here sort after those that are.
GROUP_CATALOG_ORDER = {
    "Rubin DP1": [
        "object_collection",
        "object_collection (lite)",
        "object_photoz",
        "object_photoz (lite)",
        "dia_object_collection",
        "CCD visit table",
        "crossmatches",
    ],
}

RUBIN_GROUPS = {
    "DP1",
    "DP2_HATS_V1",
    "DP2_Pilot",
    "DP2_rc2",
    "PPDB",
    "v30_0_4_rc1",
    "v30_0_6_rc1",
    "w_2025_49",
}


def insert(group, parts):
    if len(parts) == 1:
        group["catalogs"].append(parts[0])
    else:
        sub = next(
            (c for c in group["catalogs"] if isinstance(c, dict) and c.get("label") == parts[0] and "catalogs" in c),
            None,
        )
        if sub is None:
            sub = {"label": parts[0], "catalogs": []}
            group["catalogs"].append(sub)
        insert(sub, parts[1:])


cat_index, rubin_index = {}, {}

for cat_json in sorted(glob.glob(os.path.join(DATA, "**/catalog.json"), recursive=True)):
    with open(cat_json, encoding="utf-8") as f:
        d = json.load(f)

    parts = d["label"].split("/")
    top = os.path.relpath(os.path.dirname(cat_json), DATA).replace("\\", "/").split("/")[0]
    index = rubin_index if top in RUBIN_GROUPS else cat_index
    group = index.setdefault(parts[0], {"label": parts[0], "catalogs": []})
    insert(group, parts[1:] or parts)


for label, order in GROUP_CATALOG_ORDER.items():
    if label in cat_index:
        rank = {lbl: i for i, lbl in enumerate(order)}
        cat_index[label]["catalogs"].sort(key=lambda c: rank.get(c if isinstance(c, str) else c["label"], len(order)))

pinned = [cat_index[g] for g in PINNED_GROUPS if g in cat_index]
rest = [v for k, v in cat_index.items() if k not in set(PINNED_GROUPS)]
catalogs_index = pinned + rest
rubin_index = list(rubin_index.values())

with open(os.path.join(DATA, "catalogs.json"), "w", encoding="utf-8") as f:
    json.dump(catalogs_index, f, indent=2, ensure_ascii=True)
n_cats = sum(len(g["catalogs"]) for g in catalogs_index)
print(f"Wrote {n_cats} entries in {len(catalogs_index)} groups to data/catalogs.json")

with open(os.path.join(DATA, "rubinCatalogs.json"), "w", encoding="utf-8") as f:
    json.dump(rubin_index, f, indent=2, ensure_ascii=True)
n_rubin = sum(len(g["catalogs"]) for g in rubin_index)
print(f"Wrote {n_rubin} entries in {len(rubin_index)} groups to data/rubinCatalogs.json")
