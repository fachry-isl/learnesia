#!/bin/sh
set -e

# Anonymous /app/node_modules volumes can outlive image rebuilds and hide
# dependencies installed at build time (e.g. after migrating Vite → Next).
if [ ! -x node_modules/.bin/next ]; then
  echo "Installing frontend dependencies..."
  npm install
fi

exec npm run dev
