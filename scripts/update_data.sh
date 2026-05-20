#!/bin/bash
# Update all generated assets for one or more catalogs.
# With no arguments, updates all catalogs.
# Usage: ./scripts/update_data.sh [<label> ...]
# Example: ./scripts/update_data.sh 'DELVE/DELVE DR2' 'DES/DES DR2 (US-East, S3)'
SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -d ".venv" ]; then
  echo "Creating virtual environment..."
  python -m venv .venv
fi

source .venv/bin/activate

pip install --upgrade -q -r $SCRIPTS_DIR/requirements.txt

python $SCRIPTS_DIR/update_index.py
python $SCRIPTS_DIR/update_metadata.py "$@"
python $SCRIPTS_DIR/update_mean_maps.py "$@"
python $SCRIPTS_DIR/update_density_maps.py "$@"
