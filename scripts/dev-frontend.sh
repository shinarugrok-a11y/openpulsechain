#!/usr/bin/env bash
# Waits for the local Hardhat node, deploys the contract, then starts the
# frontend dev server. Used by the "frontend" terminal in the Cloud Agent
# environment so the dApp always has a fresh deployment to talk to.
set -euo pipefail

cd "$(dirname "$0")/.."

RPC_URL="${RPC_URL:-http://127.0.0.1:8545}"

echo "Waiting for local chain at ${RPC_URL}…"
for i in $(seq 1 60); do
  if curl -s -X POST "$RPC_URL" \
    -H 'Content-Type: application/json' \
    --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
    | grep -q result; then
    echo "Local chain is up."
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "Timed out waiting for the local chain." >&2
    exit 1
  fi
  sleep 1
done

echo "Deploying PulseToken…"
npm run deploy:local

echo "Starting frontend dev server…"
npm run frontend:dev
