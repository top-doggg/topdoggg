#!/bin/bash
set -e
cd "$(dirname "$0")"
bun install --frozen-lockfile --linker hoisted --backend=copyfile
bun run build
vercel deploy --prod --yes
