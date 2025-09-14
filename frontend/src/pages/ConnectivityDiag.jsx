// src/pages/ConnectivityDiag.jsx
import { useEffect, useState } from "react";

export default function ConnectivityDiag() {
  const API = import.meta.env.VITE_API_URL || "";
  const [health, setHealth] = useState(null);
  const [fields, setFields] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const h = await fetch(`${API}/api/healthz`);
        setHealth({ status: h.status, body: await h.json() });
      } catch (e) {
        setHealth({ error: String(e) });
      }
      try {
        const r = await fetch(`${API}/api/field`);
        setFields({ status: r.status, body: await r.json() });
      } catch (e) {
        setFields({ error: String(e) });
      }
    })();
  }, [API]);

  const createDummy = async () => {
    setMsg("");
    try {
      const r = await fetch(`${API}/api/field`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Diag Plot",
          village: "TestVille",
          area: 1.23,
          soilType: "Loamy",
          irrigation: "Drip",
        }),
      });
      const j = await r.json();
      setMsg(`Create status ${r.status}: ${JSON.stringify(j)}`);
    } catch (e) {
      setMsg(`Create error: ${String(e)}`);
    }
  };

  return (
    <div style={{padding:16}}>
      <h2>Connectivity Diagnostics</h2>
      <pre>API: {API}</pre>
      <h3>Health</h3>
      <pre>{JSON.stringify(health, null, 2)}</pre>
      <h3>GET /api/field</h3>
      <pre>{JSON.stringify(fields, null, 2)}</pre>
      <button onClick={createDummy} style={{padding:8, border:'1px solid #ccc'}}>
        Create dummy Field
      </button>
      {msg && <pre>{msg}</pre>}
    </div>
  );
}
