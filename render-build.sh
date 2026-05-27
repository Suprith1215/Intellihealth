#!/usr/bin/env bash
# exit on error
set -o errexit

# Install frontend dependencies and build
npm install --prefix client
npm run build --prefix client

# Install Python backend dependencies
pip install -r requirements.txt
