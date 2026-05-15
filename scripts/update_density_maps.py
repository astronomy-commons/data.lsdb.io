import json
import sys
from pathlib import Path

import hats
import matplotlib.pyplot as plt
from matplotlib.colors import LogNorm
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

SKIP_DIRS = {"TNS/TNS", "VSX/VSX"}


def run(dirs=None):
    with open(data_dir / "catalogs.json", "r", encoding="utf-8") as f:
        catalog_groups = json.load(f)

    all_leaves = list(iter_leaf_catalogs(catalog_groups))
    if dirs:
        all_leaves = [leaf for leaf in all_leaves if leaf["dir"] in dirs]

    catalogs_to_update = []
    skipped = []
    for leaf in tqdm(all_leaves, desc="Checking maps"):
        dir_path = leaf["dir"]
        catalog_json_path = data_dir / dir_path / "catalog.json"

        if not catalog_json_path.exists():
            continue

        with open(catalog_json_path, "r", encoding="utf-8") as f:
            catalog_data = json.load(f)

        catalog_url, skip_reason = resolve_catalog_url(catalog_data)

        if skip_reason or dir_path in SKIP_DIRS:
            if skip_reason:
                skipped.append([dir_path, skip_reason])
            continue

        if catalog_url:
            catalogs_to_update.append((dir_path, catalog_url, catalog_json_path))

    if not catalogs_to_update:
        print("No maps need to be generated")
        return

    generated = []
    failed = []

    for dir_path, catalog_url, catalog_json_path in tqdm(
        catalogs_to_update, desc="Generating density maps"
    ):
        image_path = data_dir / dir_path / "point_density.webp"

        if (
            not dirs
            and image_path.exists()
            and image_path.stat().st_mtime >= catalog_json_path.stat().st_mtime
        ):
            skipped.append([dir_path, "up to date"])
            continue

        image_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            _generate_density_map(catalog_url, image_path)

            with open(catalog_json_path, "r", encoding="utf-8") as f:
                catalog_data = json.load(f)

            catalog_data.setdefault("urls", {})["point_density_map"] = image_path.relative_to(
                root_dir
            ).as_posix()

            atomic_json_write(catalog_json_path, catalog_data)
            generated.append([dir_path])
        except Exception as e:
            failed.append([dir_path, e])

    sections = [
        ("GENERATED", generated, ["catalog"]),
        ("SKIPPED", skipped, ["catalog", "reason"]),
    ]
    print_report(sections, failed=failed, failed_headers=["catalog", "error"])


def _generate_density_map(catalog_url, image_path):
    hc_catalog = read_hats_catalog(catalog_url)
    fig, _ = hats.inspection.plot_density(hc_catalog, edgecolors="face", norm=LogNorm())
    fig.savefig(image_path, format="webp", bbox_inches="tight")
    plt.close(fig)


if __name__ == "__main__":
    run(dirs=sys.argv[1:] or None)
