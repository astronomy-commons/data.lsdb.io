import json
import tempfile
from pathlib import Path

import hats
import tabulate as _tabulate
from hats.catalog.catalog_collection import CatalogCollection


def _slug(label):
    return label.replace(" ", "_").replace("≥", "gte")


def iter_leaf_catalogs(entries, _parent_hash=""):
    for entry in entries:
        if isinstance(entry, str):
            hash_ = f"{_parent_hash}/{_slug(entry)}" if _parent_hash else _slug(entry)
            yield {"label": entry, "dir": hash_}
        elif "catalogs" in entry:
            hash_ = f"{_parent_hash}/{_slug(entry['label'])}" if _parent_hash else _slug(entry["label"])
            yield from iter_leaf_catalogs(entry["catalogs"], hash_)


def read_hats_catalog(url):
    cat = hats.read_hats(url)
    if isinstance(cat, CatalogCollection):
        cat = cat.main_catalog
    return cat


def resolve_catalog_url(catalog_data):
    """Return (url, skip_reason) for a catalog entry.

    skip_reason is a non-None string when the catalog should be skipped.
    url is None whenever skip_reason is set.
    """
    if catalog_data.get("skip_connectivity_check"):
        return None, catalog_data["skip_connectivity_check"]

    urls = catalog_data.get("urls", {})
    url = urls.get("collection") or urls.get("catalog")

    if not url:
        return None, "no catalog URL"
    if url.endswith(".parquet"):
        return None, "single parquet file"

    return url, None


def print_report(sections, failed=None, failed_headers=None):
    """Print a structured end-of-run report.

    sections: list of (title, data, headers) where data is a list-of-rows or dict-of-columns.
              Empty sections are skipped.
    failed:   optional list of failure rows; if non-empty, a PROBLEMS section is printed
              and the function returns False.

    Returns True if everything is fine (no failures), False otherwise.
    """
    print("=================  END OF PROCESSING  =================")
    for title, data, headers in sections:
        count = len(data) if isinstance(data, list) else len(next(iter(data.values()), []))
        if not count:
            continue
        print("\n.......................................................")
        print(f"................. {title:^23} .................")
        print(".......................................................")
        print(_tabulate.tabulate(data, headers=headers))

    if not failed:
        print("Everything is fine.")
        return True

    print("\n.......................................................")
    print(f"................. {'PROBLEMS':^23} .................")
    print(".......................................................")
    print(f"There were problems with {len(failed)} catalog(s)")
    print(_tabulate.tabulate(failed, headers=failed_headers or ["label", "error"]))
    print("\n=================    END OF REPORT    =================")
    return False


def atomic_json_write(path, data):
    path = Path(path)
    fd, tmp = tempfile.mkstemp(dir=path.parent, suffix=".tmp")
    try:
        with open(fd, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        Path(tmp).replace(path)
    except Exception:
        Path(tmp).unlink(missing_ok=True)
        raise
