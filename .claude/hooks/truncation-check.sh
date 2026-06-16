#!/bin/bash
# Wrapper: delega a lógica para o script Node (jq/python não disponíveis).
DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
node "$DIR/.claude/hooks/truncation-check.mjs"
