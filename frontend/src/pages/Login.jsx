import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  // If you use a Vite proxy for /api -> http://127.0.0.1:5000, keep API empty.
  // Otherwise set VITE_API_URL=http://127.0.0.1:5000 in your React .env
  const API = import.meta.env.VITE_API_URL || "";

  const validatePhone = (p) => /^\d{10}$/.test(String(p || "").trim());

  const handleRequestOtp = async () => {
    setMsg("");
    if (!validatePhone(phone)) {
      setMsg("Enter a valid 10-digit phone number.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.error || `Failed to request OTP (${res.status})`);
        return;
      }
      setOtpRequested(true);
      // In dev backend we return dev_otp for quick testing
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

    if (!validatePhone(phone)) {
      setMsg("Enter a valid 10-digit phone number.");
      return;
    }
    if (!otp.trim()) {
      setMsg("Enter the OTP.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // add credentials: "include" if you switch to cookie sessions
        body: JSON.stringify({ phone: phone.trim(), otp: otp.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.error || `Login failed (${res.status})`);
        return;
      }

      // Save token if backend returns one (demo uses "token": "demo-jwt")
      if (data?.token) localStorage.setItem("token", data.token);

      setMsg("✅ Logged in!");
      // Navigate to dashboard/home
      setTimeout(() => navigate("/"), 600);
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
        <form className="space-y-3" onSubmit={handleVerifyLogin}>
          <Input
            placeholder="Phone number"
            value={phone}
            inputMode="numeric"
            pattern="\d*"
            onChange={(e) => setPhone(e.target.value)}
          />

          <div className="flex gap-2">
            <Button
              type="button"
              className="flex-1"
              onClick={handleRequestOtp}
              disabled={loading}
            >
              {loading && !otpRequested ? "Sending..." : "Get OTP"}
            </Button>
          </div>

          <Input
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            disabled={!otpRequested}
          />

          {msg && <p className="text-sm">{msg}</p>}

          <Button className="w-full" type="submit" disabled={loading || !otpRequested}>
            {loading && otpRequested ? "Verifying..." : "Verify & Login"}
          </Button>

          <div className="text-sm opacity-70">
            No account?{" "}
            <Link className="underline" to="/auth/register">
              Register
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
