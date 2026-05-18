# data.lsdb.io

Source code for the [data.lsdb.io](https://data.lsdb.io) website — a browser for large astronomical catalogs in the [HATS](https://hats.readthedocs.io) format.

## Development

**Prerequisites:** [Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm), Python 3.9+

```bash
npm install       # install JS dependencies
npm run start     # dev server at http://localhost:9000 with hot reload
```

## Deployment to Epyc

Once a PR is approved and merged to `main`, rebuild and deploy:

```bash
npm run build     # production build → dist/
rsync -r --inplace --progress dist/ <username>@epyc.astro.washington.edu:/var/www/data.lsdb.io/html/
cat scripts/post-deploy.sh | ssh <username>@epyc.astro.washington.edu "bash -s"
```

## How to expose a catalog on Epyc

To serve a catalog hosted on epyc under `https://data.lsdb.io/hats/<name>`:

```bash
cd /var/www/data.lsdb.io/html/hats
ln -s /epyc/data3/hats/catalogs/<catalog_name> <name>
```

Add a description to `/var/www/data.lsdb.io/html/hats/.htaccess`:

```
AddDescription "<description>" <name> <name>/
```

## How to add / update a catalog

### 1. Create or update catalog JSON

A catalog will belong to a group and (optionally) subgroups:

`data/<Group>/<Subgroup>/<Catalog Name>/catalog.json`

```json
{
  "label": "Group/<Subgroup>/Catalog Name",
  "name": "Catalog Name",
  "description": "A description of the catalog.",
  "urls": { "catalog": "https://data.lsdb.io/hats/my_catalog" }
}
```

See [data/README.md](data/README.md) for the full `catalog.json` schema.

### 2. Regenerate assets

Run the Python scripts that update catalog metadata, skymaps, and website index.

```bash
./scripts/update_data.sh 'Group/Catalog_Name'
```

- Omit the argument to update all catalogs.
- This script creates a virtual environment `.venv` automatically on first run.
- You should see changes to your catalog's JSON and respective skymap images.

### 3. Open a PR and deploy

Push your changes and open a pull request. Once approved and merged, follow the deployment steps above.

## Code quality

The pre-commit hook lints and formats staged JSX files on each commit:

```bash
npm run lint      # ESLint
npm run format    # Prettier
```
