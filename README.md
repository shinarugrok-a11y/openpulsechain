# openpulsechain

Open PulseChain project — an EVM (PulseChain-compatible) development stack with
Solidity smart contracts and a modern React dApp frontend.

## Stack

- **Contracts** — [Hardhat](https://hardhat.org/) + [OpenZeppelin](https://www.openzeppelin.com/contracts), Solidity `0.8.24`.
- **Frontend** — [Vite](https://vitejs.dev/) + React + [ethers v6](https://docs.ethers.org/v6/).
- **Local chain** — the built-in Hardhat network (chain ID `943`, PulseChain Testnet v4).

## Prerequisites

- Node.js 20+ and npm 10+.

## Getting started

```bash
npm install          # install root + frontend workspaces
npm run compile      # compile the Solidity contracts
npm test             # run the contract test suite
```

## Run the full stack locally

Open two terminals:

```bash
# Terminal 1 — start the local PulseChain-compatible node
npm run node

# Terminal 2 — deploy the contract and start the dApp
npm run dev
```

`npm run dev` waits for the node, deploys `PulseToken`, writes the deployment
metadata to `frontend/src/deployment.json`, and starts the Vite dev server at
http://127.0.0.1:5173. The dApp reads the token name, symbol, total supply and
balances directly from the local chain and can transfer tokens end to end.

## Project layout

```
contracts/           Solidity sources (PulseToken.sol)
test/                Hardhat/Chai contract tests
scripts/             deploy.js and the dev-frontend helper
frontend/            Vite + React + ethers dApp
hardhat.config.js    Hardhat configuration
```

## Cloud Agent environment

`.cursor/environment.json` installs dependencies and compiles contracts on
setup, then runs two terminals: `chain` (the local node) and `frontend`
(deploy + Vite dev server). Ports `8545` (RPC) and `5173` (dApp) are exposed.
