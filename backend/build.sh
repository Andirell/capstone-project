#!/usr/bin/env bash
# Build script for Render / Railway style hosts.
set -o errexit
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate --no-input
python manage.py seed_jobs
