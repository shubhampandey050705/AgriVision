import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Login() {
  const [mode, setMode] = useState("password"); // "password" | "otp"
  const [identifier, setIdentifier] = useState(""); // email or phone
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;

  const isEmail = (v) => /^\S+@\S+\.\S+$/.test(String(v || "").trim());
  const isPhone = (v) => /^\d{10}$/.test(String(v || "").trim());

  const readJson = async (res) => {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return res.json();
    const t = await res.text();
    try { return JSON.parse(t); } catch { return {}; }
  };

  // ---------- Password mode ----------
  const handlePasswordLogin = async (e) => {
    e?.preventDefault?.();
    setMsg("");

    const id = identifier.trim();
    if (!isEmail(id) && !isPhone(id)) {
      setMsg("Enter a valid email or 10-digit phone number.");
      return;
    }
    if (!password.trim()) {
      setMsg("Enter your password.");
      return;
    }

    try {
      setLoading(true);
      const body = { password: password.trim() };
      if (isEmail(id)) body.email = id.toLowerCase();
      else body.phone = id;

      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await readJson(res);

      if (!res.ok) {
        setMsg(data?.error || `Login failed (${res.status})`);
        return;
      }

      if (data?.token) localStorage.setItem("token", data.token);
      if (data?.user) localStorage.setItem("agri_user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("auth-changed"));
      setMsg("✅ Logged in!");
      setTimeout(() => navigate("/"), 400);
    } catch (e) {
      console.error(e);
      setMsg("Network error while logging in.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- OTP mode (kept as-is) ----------
  const handleRequestOtp = async () => {
    setMsg("");
    if (!isPhone(phone)) return setMsg("Enter a valid 10-digit phone number.");
    try {
      setLoading(true);
      const res = await fetch(`${API}/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await readJson(res);
      if (!res.ok) return setMsg(data?.error || `Failed to request OTP (${res.status})`);
      setOtpRequested(true);
      setMsg(data?.dev_otp ? `OTP sent (DEV): ${data.dev_otp}` : "OTP sent.");
    } catch (e) {
      console.error(e);
      setMsg("Network error while requesting OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLogin = async (e) => {
    e?.preventDefault?.();
    setMsg("");
    if (!isPhone(phone)) return setMsg("Enter a valid 10-digit phone number.");
    if (!/^\d{4,8}$/.test(String(otp || "").trim())) return setMsg("Enter a valid numeric OTP.");
    try {
      setLoading(true);
      const res = await fetch(`${API}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), otp: otp.trim() }),
      });
      const data = await readJson(res);
      if (!res.ok) return setMsg(data?.error || `Login failed (${res.status})`);
      if (data?.token) localStorage.setItem("token", data.token);
      if (data?.user) localStorage.setItem("agri_user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("auth-changed"));
      setMsg("✅ Logged in!");
      setTimeout(() => navigate("/"), 400);
    } catch (e) {
      console.error(e);
      setMsg("Network error while verifying OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card title="Login">
        <div className="flex mb-3 gap-2">
          <Button
            type="button"
            className={`flex-1 rounded-md ${mode === "password" ? "bg-emerald-500 text-white" : ""}`}
            onClick={() => setMode("password")}
          >
            Password
          </Button>
          <Button
            type="button"
            className={`flex-1 rounded-md ${mode === "otp" ? "bg-emerald-500 text-white" : ""}`}
            onClick={() => setMode("otp")}
          >
            OTP
          </Button>
        </div>

        {mode === "password" ? (
          <form className="space-y-3" onSubmit={handlePasswordLogin}>
            <Input
              placeholder="Email or Phone"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
            />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {msg && <p className="text-sm" aria-live="polite">{msg}</p>}
            <Button className="w-full bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition disabled:opacity-50" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        ) : (
          <form className="space-y-3" onSubmit={handleVerifyLogin}>
            <Input
              placeholder="Phone number"
              value={phone}
              inputMode="numeric"
              pattern="\d*"
              maxLength={10}
              autoComplete="tel"
              onChange={(e) => setPhone(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                className="flex-1 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition disabled:opacity-50"
                onClick={handleRequestOtp}
                disabled={!isPhone(phone) || loading}
              >
                {loading && !otpRequested ? "Sending..." : "Get OTP"}
              </Button>
            </div>
            <Input
              placeholder="OTP"
              value={otp}
              inputMode="numeric"
              pattern="\d*"
              maxLength={8}
              onChange={(e) => setOtp(e.target.value)}
              disabled={!otpRequested}
              autoComplete="one-time-code"
            />
            {msg && <p className="text-sm" aria-live="polite">{msg}</p>}
            <Button className="w-full bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition disabled:opacity-50" type="submit" disabled={!otpRequested || loading}>
              {loading && otpRequested ? "Verifying..." : "Verify & Login"}
            </Button>
          </form>
        )}

        <div className="text-sm opacity-70 mt-3">
          No account? <Link className="underline" to="/auth/register">Register</Link>
        </div>
      </Card>
    </div>
  );
}
