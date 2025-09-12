import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [village, setVillage] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || "";

  const validate = () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !village.trim()) {
      return "All fields are required.";
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return "Enter a valid email address.";
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      return "Enter a valid 10-digit phone number.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          village: village.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || `Registration failed (${res.status})`);
        return;
      }
      setOk("Account created successfully!");
      setTimeout(() => navigate("/auth/login"), 800);
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card title="Create account">
        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input placeholder="Village / PIN" value={village} onChange={(e) => setVillage(e.target.value)} />

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {ok && <p className="text-green-600 text-sm">{ok}</p>}

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </Button>

          <div className="text-sm opacity-70">
            Already have an account?{" "}
            <Link className="underline" to="/auth/login">Login</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
