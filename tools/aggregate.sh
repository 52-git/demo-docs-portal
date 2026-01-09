#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK_DIR="${ROOT_DIR}/.work"
DOCS_DIR="${ROOT_DIR}/docs"

REPOS=(
  "https://github.com/52-git/demo-frontend.git frontend"
  "https://github.com/52-git/demo-backend.git backend"
  "https://github.com/52-git/demo-infra.git infra"
)

rm -rf "${WORK_DIR}"
mkdir -p "${WORK_DIR}"

for item in "${REPOS[@]}"; do
  url="$(echo "${item}" | awk '{print $1}')"
  name="$(echo "${item}" | awk '{print $2}')"

  git clone --depth 1 "${url}" "${WORK_DIR}/${name}"

  if [ ! -d "${WORK_DIR}/${name}/docs" ]; then
    echo "docs folder not found in ${name}"
    exit 1
  fi

  rm -rf "${DOCS_DIR:?}/${name}"
  mkdir -p "${DOCS_DIR}/${name}"
  rsync -a --delete "${WORK_DIR}/${name}/docs/" "${DOCS_DIR}/${name}/"
done

echo "Aggregation completed."
