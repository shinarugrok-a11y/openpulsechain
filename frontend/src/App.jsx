import { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import deployment from "./deployment.json";

// Well-known Hardhat local development accounts. These private keys are public,
// funded only on a local test chain, and MUST NEVER be used on a real network.
const DEV_SENDER = {
  address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  privateKey:
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
};
const DEV_RECIPIENT = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

const short = (addr) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

export default function App() {
  const [status, setStatus] = useState("Connecting to the local PulseChain node…");
  const [error, setError] = useState("");
  const [info, setInfo] = useState(null);
  const [balances, setBalances] = useState(null);
  const [busy, setBusy] = useState(false);

  const provider = useMemo(
    () => new ethers.JsonRpcProvider(deployment.rpcUrl),
    []
  );

  const isDeployed = deployment.address && deployment.abi.length > 0;

  const refresh = useCallback(async () => {
    if (!isDeployed) return;
    const token = new ethers.Contract(deployment.address, deployment.abi, provider);
    const [name, symbol, decimals, totalSupply, senderBal, recipientBal, net] =
      await Promise.all([
        token.name(),
        token.symbol(),
        token.decimals(),
        token.totalSupply(),
        token.balanceOf(DEV_SENDER.address),
        token.balanceOf(DEV_RECIPIENT),
        provider.getNetwork(),
      ]);

    setInfo({
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: ethers.formatUnits(totalSupply, decimals),
      chainId: Number(net.chainId),
      address: deployment.address,
    });
    setBalances({
      sender: ethers.formatUnits(senderBal, decimals),
      recipient: ethers.formatUnits(recipientBal, decimals),
    });
    setStatus("Connected");
  }, [isDeployed, provider]);

  useEffect(() => {
    if (!isDeployed) {
      setStatus("");
      setError(
        "No deployment found. Start the local chain and run the deploy script."
      );
      return;
    }
    refresh().catch((e) => {
      setStatus("");
      setError(`Failed to read contract: ${e.message}`);
    });
  }, [isDeployed, refresh]);

  const sendTokens = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const wallet = new ethers.Wallet(DEV_SENDER.privateKey, provider);
      const token = new ethers.Contract(deployment.address, deployment.abi, wallet);
      const amount = ethers.parseUnits("100", info.decimals);
      const tx = await token.transfer(DEV_RECIPIENT, amount);
      setStatus(`Transaction sent: ${short(tx.hash)} — waiting for confirmation…`);
      await tx.wait();
      setStatus(`Transfer confirmed: ${short(tx.hash)}`);
      await refresh();
    } catch (e) {
      setError(`Transfer failed: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }, [info, provider, refresh]);

  return (
    <div className="page">
      <header className="hero">
        <div className="logo">◎</div>
        <h1>Open PulseChain</h1>
        <p className="subtitle">
          A local EVM dApp reading and writing on-chain state end to end.
        </p>
        <span className={`badge ${status === "Connected" ? "ok" : ""}`}>
          {status === "Connected" ? "● Connected" : "○ Offline"}
        </span>
      </header>

      {error && <div className="alert">{error}</div>}

      {info && (
        <section className="grid">
          <div className="card">
            <span className="label">Token</span>
            <span className="value">
              {info.name} <em>({info.symbol})</em>
            </span>
          </div>
          <div className="card">
            <span className="label">Total supply</span>
            <span className="value">
              {Number(info.totalSupply).toLocaleString()} {info.symbol}
            </span>
          </div>
          <div className="card">
            <span className="label">Chain ID</span>
            <span className="value">{info.chainId}</span>
          </div>
          <div className="card">
            <span className="label">Contract</span>
            <span className="value mono">{short(info.address)}</span>
          </div>
        </section>
      )}

      {balances && (
        <section className="panel">
          <h2>Balances</h2>
          <div className="row">
            <span className="mono">{short(DEV_SENDER.address)}</span>
            <span className="amount">
              {Number(balances.sender).toLocaleString()} {info.symbol}
            </span>
          </div>
          <div className="row">
            <span className="mono">{short(DEV_RECIPIENT)}</span>
            <span className="amount">
              {Number(balances.recipient).toLocaleString()} {info.symbol}
            </span>
          </div>
          <button className="btn" onClick={sendTokens} disabled={busy}>
            {busy ? "Sending…" : `Transfer 100 ${info.symbol}`}
          </button>
          <p className="hint">{status}</p>
        </section>
      )}
    </div>
  );
}
