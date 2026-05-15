# Catalog data

Each catalog lives in `data/<Group>/<Catalog_Name>/catalog.json`. The `data/` directory also contains `catalogs.json` and `rubinCatalogs.json`, which are generated index files — do not edit them manually.

## `catalog.json` schema

```json
{
  "label": "Group/Catalog Name",
  "name": "Catalog Name",
  "description": "A description of the catalog.",
  "urls": {
    "catalog": "https://data.lsdb.io/hats/my_catalog",
    "margin_catalog": "https://data.lsdb.io/hats/my_catalog_margin",
    "collection": "https://data.lsdb.io/hats/my_collection",
    "point_density_map": "/data/Group/Catalog_Name/point_density_map.webp",
    "displayDownload": true
  },
  "metadata": {
    "numRows": 1000000,
    "numColumns": 42,
    "numPartitions": 128,
    "sizeOnDisk": "10.5 GiB",
    "hatsBuilder": "hats-import v1.0.0"
  },
  "other_urls": [
    { "label": "Official release", "url": "https://..." },
    { "label": "Column descriptions", "url": "https://..." },
    { "label": "Research paper", "url": "https://..." }
  ],
  "badges": [{ "title": "US-West" }, { "title": "HTTP" }],
  "notes": [{ "title": "Note title", "content": "Note content.", "type": "info" }],
  "column_mean_maps": [],
  "dir": "Group/Catalog_Name",
  "skip_connectivity_check": "Reason string — omit this field if not needed"
}
```

| Field                     | Description                                                                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `label`                   | The part before `/` becomes the sidebar group. Use `"Group/Subgroup/Catalog Name"` for three levels.                                       |
| `name`                    | Display name for the catalog.                                                                                                              |
| `description`             | Short description shown on the catalog page.                                                                                               |
| `urls`                    | See schema below. `catalog` or `collection` is required; others are optional.                                                              |
| `metadata`                | Populated automatically by `update_metadata.py`. Can be set manually.                                                                      |
| `other_urls`              | Additional links shown in the references section.                                                                                          |
| `badges`                  | Short tags shown next to the catalog title (e.g. region, protocol).                                                                        |
| `notes`                   | Info/warning banners shown on the catalog page. `type` can be `"info"` or `"warning"`.                                                     |
| `column_mean_maps`        | Populated automatically by `update_mean_maps.py`. Place images at `assets/img/maps/column_means/<Catalog_Label>/<column_name>.webp` first. |
| `dir`                     | Set automatically by `update_index.py`. Do not set manually.                                                                               |
| `skip_connectivity_check` | Set to a reason string to exclude from connectivity checks and asset generation. Omit if not needed.                                       |
