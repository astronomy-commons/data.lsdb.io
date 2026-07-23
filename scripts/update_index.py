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

# Explicit catalog order within a group (keyed by label path, e.g. "Group" or
# "Group/Subgroup"). Labels not listed here sort after those that are.
GROUP_CATALOG_ORDER = {
    "Rubin/DP1": [
        "object_collection",
        "object_collection (lite)",
        "object_photoz",
        "object_photoz (lite)",
        "dia_object_collection",
        "CCD visit table",
        "crossmatches",
    ],
    "Rubin/DP2": [
        "object_collection",
        "object_photoz",
        "dia_object_collection",
    ],
}

RUBIN_GROUPS = {"DP1", "DP2", "PPDB"}


def insert(group, parts):
    if len(parts) == 1:
        group["catalogs"].append(parts[0])
    else:
        sub = next(
            (
                c
                for c in group["catalogs"]
                if isinstance(c, dict)
                and c.get("label") == parts[0]
                and "catalogs" in c
            ),
            None,
        )
        if sub is None:
            sub = {"label": parts[0], "catalogs": []}
            group["catalogs"].append(sub)
        insert(sub, parts[1:])


cat_index, rubin_index = {}, {}

for cat_json in sorted(
    glob.glob(os.path.join(DATA, "**/catalog.json"), recursive=True)
):
    with open(cat_json, encoding="utf-8") as f:
        d = json.load(f)

    parts = d["label"].split("/")
    top = (
        os.path.relpath(os.path.dirname(cat_json), DATA)
        .replace("\\", "/")
        .split("/")[0]
    )
    index = rubin_index if top in RUBIN_GROUPS else cat_index
    group = index.setdefault(parts[0], {"label": parts[0], "catalogs": []})
    insert(group, parts[1:] or parts)


def entry_label(entry):
    return entry if isinstance(entry, str) else entry["label"]


def sort_catalogs(entries):
    """Sort catalogs case-insensitively and alphabetically, recursing into subgroups."""
    for entry in entries:
        if isinstance(entry, dict) and "catalogs" in entry:
            sort_catalogs(entry["catalogs"])
    entries.sort(key=lambda e: entry_label(e).casefold())


for index in (cat_index, rubin_index):
    for group in index.values():
        sort_catalogs(group["catalogs"])

# Apply explicit per-group catalog ordering, overriding the alphabetical sort above.
for path, order in GROUP_CATALOG_ORDER.items():
    parts = path.split("/")
    node = cat_index.get(parts[0])
    for part in parts[1:]:
        if node is None:
            break
        node = next(
            (
                c
                for c in node["catalogs"]
                if isinstance(c, dict) and c.get("label") == part
            ),
            None,
        )
    if node is not None:
        rank = {lbl: i for i, lbl in enumerate(order)}
        node["catalogs"].sort(key=lambda c: rank.get(entry_label(c), len(order)))

# Groups are listed alphabetically (case-insensitive), with no special treatment for any group.
catalogs_index = sorted(cat_index.values(), key=lambda g: g["label"].casefold())
rubin_index = sorted(rubin_index.values(), key=lambda g: g["label"].casefold())

with open(os.path.join(DATA, "catalogs.json"), "w", encoding="utf-8") as f:
    json.dump(catalogs_index, f, indent=2, ensure_ascii=True)
n_cats = sum(len(g["catalogs"]) for g in catalogs_index)
print(f"Wrote {n_cats} entries in {len(catalogs_index)} groups to data/catalogs.json")

with open(os.path.join(DATA, "rubinCatalogs.json"), "w", encoding="utf-8") as f:
    json.dump(rubin_index, f, indent=2, ensure_ascii=True)
n_rubin = sum(len(g["catalogs"]) for g in rubin_index)
print(
    f"Wrote {n_rubin} entries in {len(rubin_index)} groups to data/rubinCatalogs.json"
)
