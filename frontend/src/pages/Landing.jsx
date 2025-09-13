import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(16,185,129,.25),rgba(59,130,246,.08),transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-4 pt-14 pb-16 md:pt-24">
          <div className="grid items-center gap-10 md:grid-cols-2">
            {/* Left copy */}
            <div>
              <span className="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-[12px] font-medium text-emerald-400">
                For Farmers • SIH 2025 Initiative
              </span>

              <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
                Smarter farming starts with{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  AgriVision
                </span>
              </h1>

              <p className="mt-4 text-base leading-relaxed text-foreground/80 md:text-lg">
                AI-powered crop recommendations, early disease detection,
                mandi price insights, and hyper-local weather—delivered in
                simple language for every farmer.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/dashboard"
                  className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-600"
                >
                  Open App
                </Link>
                <Link
                  to="/auth/register"
                  className="rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:border-foreground/40"
                >
                  Create account
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-8 grid grid-cols-3 gap-4 text-center md:max-w-md">
                <div className="rounded-xl border border-border/70 p-4">
                  <div className="text-2xl font-semibold">97%</div>
                  <div className="text-xs opacity-70">localized accuracy*</div>
                </div>
                <div className="rounded-xl border border-border/70 p-4">
                  <div className="text-2xl font-semibold">24×7</div>
                  <div className="text-xs opacity-70">advisory</div>
                </div>
                <div className="rounded-xl border border-border/70 p-4">
                  <div className="text-2xl font-semibold">9+</div>
                  <div className="text-xs opacity-70">regional langs</div>
                </div>
              </div>
              <p className="mt-2 text-xs opacity-60">
                *Combined score across weather, soil &amp; crop models in internal tests.
              </p>
            </div>

            {/* Right visual */}
            <div className="relative">
              <div className="aspect-[4/3] w-full rounded-3xl border border-border/70 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-cyan-900/30 p-2 shadow-xl">
                <div className="h-full w-full rounded-2xl bg-[url('https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center" />
              </div>
              <div className="absolute -bottom-6 left-6 hidden rounded-2xl border border-border/60 bg-background/80 p-4 shadow-lg backdrop-blur md:block">
                <p className="text-sm">
                  “पहले फसल का चुनाव मुश्किल था. अब AgriVision से मिट्टी, मौसम और
                  मंडी के हिसाब से सलाह मिलती है—उपज और दाम दोनों बेहतर!”<br />
                  <span className="text-xs opacity-70">— Rajesh, Farmer (UP)</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="text-2xl font-bold">Why farmers choose AgriVision</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "AI Crop Advice",
                desc: "Pick the right crop for your soil, rainfall and prices.",
              },
              {
                title: "Early Disease Alerts",
                desc: "Upload a leaf photo for instant risk assessment & remedies.",
              },
              {
                title: "Live Mandi Prices",
                desc: "Track nearby markets to sell at the best time.",
              },
              {
                title: "Hyper-local Weather",
                desc: "Plan irrigation & spraying with accurate local forecasts.",
              },
              {
                title: "Your Fields, Organized",
                desc: "Save field details, soil type, irrigation and notes.",
              },
              {
                title: "Works in Your Language",
                desc: "Simple guidance in regional languages and voice.",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-border/70 p-5">
                <div className="text-base font-semibold">{f.title}</div>
                <p className="mt-2 text-sm opacity-75">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border/60 bg-surface/30">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="text-2xl font-bold">Get started in minutes</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { step: "1", title: "Create account", desc: "Register with your phone and village PIN." },
              { step: "2", title: "Add your fields", desc: "Enter soil type & irrigation; we auto-fetch weather." },
              { step: "3", title: "Get guidance", desc: "See crop advice, disease risk and mandi insights." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl border border-border/70 p-6">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white">
                  {s.step}
                </div>
                <div className="mt-3 font-semibold">{s.title}</div>
                <p className="mt-1 text-sm opacity-75">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              to="/auth/register"
              className="inline-flex items-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-600"
            >
              Create your free account
            </Link>
          </div>
        </div>
      </section>

      {/* Impact / CTA */}
      <section id="impact" className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-emerald-900/30 to-cyan-900/20 p-8 md:p-12">
            <h3 className="text-xl font-bold">
              Better choices. Better yields. Better prices.
            </h3>
            <p className="mt-2 text-sm opacity-80">
              AgriVision combines science, satellite weather and market data to put
              actionable decisions in every farmer’s hand—anytime, anywhere.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                to="/dashboard"
                className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-600"
              >
                Open App
              </Link>
              <Link
                to="/auth/register"
                className="rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:border-foreground/40"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm opacity-70">
          © {new Date().getFullYear()} AgriVision • Built for Smart India Hackathon 2025
        </div>
      </footer>
    </div>
  );
}
