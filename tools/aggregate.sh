#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK_DIR="${ROOT_DIR}/.work"
DOCS_DIR="${ROOT_DIR}/docs"

VERSION="${VERSION:-}"
FRONTEND_VERSION="${FRONTEND_VERSION:-}"
BACKEND_VERSION="${BACKEND_VERSION:-}"
INFRA_VERSION="${INFRA_VERSION:-}"
RELEASE_VERSION="${RELEASE_VERSION:-}"
REQUIRE_TAGS="${REQUIRE_TAGS:-false}"

REPOS=(
  "https://github.com/52-git/demo-frontend.git frontend FRONTEND_VERSION"
  "https://github.com/52-git/demo-backend.git backend BACKEND_VERSION"
  "https://github.com/52-git/demo-infra.git infra INFRA_VERSION"
)

usage() {
  cat <<'EOF'
Usage: tools/aggregate.sh [--release-version <tag>] [--version <tag>] [--frontend-version <tag>] [--backend-version <tag>] [--infra-version <tag>] [--require-tags true|false]

Environment:
  RELEASE_VERSION   Release version used for output folder (default: VERSION or snapshot)
  VERSION           Tag/version to aggregate (same as --version)
  FRONTEND_VERSION  Frontend tag/version override
  BACKEND_VERSION   Backend tag/version override
  INFRA_VERSION     Infra tag/version override
  REQUIRE_TAGS      Fail if any repo lacks the tag (default: false)
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --version)
      VERSION="$2"
      shift 2
      ;;
    --release-version)
      RELEASE_VERSION="$2"
      shift 2
      ;;
    --frontend-version)
      FRONTEND_VERSION="$2"
      shift 2
      ;;
    --backend-version)
      BACKEND_VERSION="$2"
      shift 2
      ;;
    --infra-version)
      INFRA_VERSION="$2"
      shift 2
      ;;
    --require-tags)
      REQUIRE_TAGS="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown arg: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

RELEASE_VERSION="${RELEASE_VERSION:-${VERSION:-snapshot}}"

rm -rf "${WORK_DIR}"
mkdir -p "${WORK_DIR}"

RELEASE_DIR="${DOCS_DIR}/releases/${RELEASE_VERSION}"
mkdir -p "${RELEASE_DIR}"

for item in "${REPOS[@]}"; do
  url="$(echo "${item}" | awk '{print $1}')"
  name="$(echo "${item}" | awk '{print $2}')"
  version_var="$(echo "${item}" | awk '{print $3}')"
  version_value="${!version_var}"
  version_value="${version_value:-$VERSION}"

  if [ -n "${version_value}" ]; then
    if git ls-remote --tags --exit-code "${url}" "refs/tags/${version_value}" >/dev/null 2>&1; then
      git clone --depth 1 --branch "${version_value}" "${url}" "${WORK_DIR}/${name}"
    elif [ "${REQUIRE_TAGS}" = "true" ]; then
      echo "Tag ${version_value} not found in ${name}" >&2
      exit 1
    else
      echo "Tag ${version_value} not found in ${name}, using default branch"
      git clone --depth 1 "${url}" "${WORK_DIR}/${name}"
    fi
  else
    git clone --depth 1 "${url}" "${WORK_DIR}/${name}"
  fi

  if [ ! -d "${WORK_DIR}/${name}/docs" ]; then
    echo "docs folder not found in ${name}"
    exit 1
  fi

  rm -rf "${RELEASE_DIR:?}/${name}"
  mkdir -p "${RELEASE_DIR}/${name}"
  rsync -a --delete "${WORK_DIR}/${name}/docs/" "${RELEASE_DIR}/${name}/"
done

cat > "${RELEASE_DIR}/versions.env" <<EOF
RELEASE_VERSION=${RELEASE_VERSION}
FRONTEND_VERSION=${FRONTEND_VERSION:-${VERSION:-default}}
BACKEND_VERSION=${BACKEND_VERSION:-${VERSION:-default}}
INFRA_VERSION=${INFRA_VERSION:-${VERSION:-default}}
EOF

cat > "${RELEASE_DIR}/index.md" <<EOF
# ${RELEASE_VERSION}

- [Frontend](frontend/README.md)
- [Backend](backend/README.md)
- [Infra](infra/README.md)
EOF

versions_page="${DOCS_DIR}/versions.md"
{
  echo "# 版本选择"
  echo
  echo "| Release | demo-frontend | demo-backend | demo-infra |"
  echo "| --- | --- | --- | --- |"
  if [ -d "${DOCS_DIR}/releases" ]; then
    for release in $(ls -1 "${DOCS_DIR}/releases" | sort -V); do
      if [ -f "${DOCS_DIR}/releases/${release}/versions.env" ]; then
        set -a
        # shellcheck disable=SC1090
        . "${DOCS_DIR}/releases/${release}/versions.env"
        set +a
        echo "| [${release}](releases/${release}/index.md) | ${FRONTEND_VERSION} | ${BACKEND_VERSION} | ${INFRA_VERSION} |"
      fi
    done
  fi
} > "${versions_page}"

if grep -q "releases/" "${ROOT_DIR}/mkdocs.yml"; then
  perl -0pi -e "s#releases/[^/]+/#releases/${RELEASE_VERSION}/#g" "${ROOT_DIR}/mkdocs.yml"
else
  perl -0pi -e "s#frontend/#releases/${RELEASE_VERSION}/frontend/#g; s#backend/#releases/${RELEASE_VERSION}/backend/#g; s#infra/#releases/${RELEASE_VERSION}/infra/#g" "${ROOT_DIR}/mkdocs.yml"
fi

echo "Aggregation completed."
