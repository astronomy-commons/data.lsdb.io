from __future__ import annotations

import sys
from pathlib import Path

from hats.catalog.catalog_collection import CatalogCollection
from hats.catalog.index.index_catalog import IndexCatalog
from hats.catalog.margin_cache.margin_catalog import MarginCatalog
from hats.io.summary_file import write_catalog_summary_file, write_sky_coverage_pngs
from hats.loaders import read_hats


def _sub_catalog_paths(collection: CatalogCollection) -> list[Path]:
    paths = [collection.main_catalog_dir]
    if collection.all_margins:
        for margin_name in collection.all_margins:
            paths.append(collection.collection_path / margin_name)
    if collection.all_indexes:
        for index_path in collection.all_indexes.values():
            paths.append(collection.collection_path / index_path)
    return paths


def process_path(catalog_path: str) -> None:
    catalog = read_hats(catalog_path)
    write_catalog_summary_file(catalog_path, fmt="markdown")
    write_catalog_summary_file(catalog_path, fmt="html")

    if not isinstance(catalog, (MarginCatalog, IndexCatalog)):
        write_sky_coverage_pngs(catalog_path)

    print(f"[done] {catalog_path}")

    if isinstance(catalog, CatalogCollection):
        write_sky_coverage_pngs(catalog.main_catalog_dir)
        print(f"[done] {catalog.main_catalog_dir} (pngs)")

        for sub_path in _sub_catalog_paths(catalog):
            try:
                write_catalog_summary_file(sub_path, fmt="markdown")
                write_catalog_summary_file(sub_path, fmt="html")
                print(f"[done]   {sub_path}")
            except Exception as e:
                print(f"[skip]   {sub_path}: {e}")


def main():
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <paths.txt>")
        return
    with open(sys.argv[1]) as f:
        for line in f:
            path = line.strip()
            if path != "":
                try:
                    process_path(path)
                except Exception as e:
                    print(f"[error] {path}: {e}")


if __name__ == "__main__":
    main()
