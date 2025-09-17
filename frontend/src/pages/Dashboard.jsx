// src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";

import Card from "../components/ui/Card";
import Tabs from "../components/ui/Tabs";
import Skeleton from "../components/ui/Skeleton";
import Badge from "../components/ui/Badge";
import StatRing from "../components/StatRing";
import PriceChart from "../components/PriceChart";

import { fetchMarketPrices } from "../utils/api";
import { predictYield } from "../services/ml";

// -----------------------------
// Helpers
// -----------------------------
const API = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

// Download CSV
const downloadCSV = (rows, filename = "recommendations.csv") => {
  if (!rows?.length) return;
  const header = Object.keys(rows[0]);
  const csv = [
    header.join(","),
    ...rows.map((r) => header.map((h) => JSON.stringify(r[h] ?? "")).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// Numeric fields we coerce from inputs:
const NUM_FIELDS = [
  "ph",
  "moisture",
  "n",
  "p",
  "k",
  "rain_sum",
  "tmin_avg",
  "tmax_avg",
  "humidity_avg",
  "wind_avg",
  "area_ha",
  "lat",
  "lon",
  "sowing_month",
];

// Default sample
const DEFAULT_SAMPLE = {
  ph: 6.6,
  moisture: 22.5,
  n: 90,
  p: 40,
  k: 38,
  rain_sum: 180,
  tmin_avg: 21,
  tmax_avg: 33.5,
  humidity_avg: 64,
  wind_avg: 8,
  area_ha: 1.5,
  lat: 26.85,
  lon: 80.95,
  sowing_month: 6,

  prev_crop_1: "Wheat",
  prev_crop_2: "Mustard",
  village: "GautamBudhNagar",
  state: "UP",
  irrigation: "canal",
  crop: "Rice", // overwritten per-crop in batch
};

// Farmer-friendly labels (English + Hindi)
const LABELS = {
  en: {
    cropRecommendations: "Crop Recommendations",
    recommendBtn: "Recommend best crop",
    exportCsv: "Export CSV",
    modelUnit: "Model unit: quintals per hectare",
    noRecs: "No recommendations yet — click “Recommend best crop”.",
    marketPrices: "Market Prices",
    yieldScore: "Yield & Sustainability",
    yield: "Yield",
    sustainability: "Sustainability",
    topPredicted: "Top predicted yield",
    fieldInputs: "Field Inputs",
    saveScenario: "Save scenario",
    reset: "Reset",
    tip: "Tip: change values → “Recommend best crop”",
    soilProfile: "Soil profile",
    weatherWindow: "Weather window",
    advisory: "Advisory",
    learnMore: "Learn more",
    soilMore:
      "pH, N, P, K and moisture affect crop growth. Aim for balanced nutrients and neutral pH (6.5–7.5) for most crops.",
    weatherMore:
      "Rainfall and temperature during sowing & growth heavily impact yield. Use local forecast to plan sowing.",
    advisoryMore:
      "Use the best crop predicted here, then follow localized sowing windows, spacing, and fertilizer schedule.",
    // field labels
    ph: "Soil pH",
    moisture: "Soil moisture (%)",
    n: "Nitrogen (N)",
    p: "Phosphorus (P)",
    k: "Potassium (K)",
    rain_sum: "Rain (7–30 days total, mm)",
    tmin_avg: "Min temp (°C)",
    tmax_avg: "Max temp (°C)",
    humidity_avg: "Humidity (%)",
    wind_avg: "Wind (km/h)",
    area_ha: "Farm size (ha)",
    lat: "Latitude",
    lon: "Longitude",
    sowing_month: "Sowing month (1–12)",
    prev_crop_1: "Previous crop 1",
    prev_crop_2: "Previous crop 2",
    village: "Village",
    state: "State",
    irrigation: "Irrigation type",
    selectAll: "Select all",
    language: "Language",
  },
  hi: {
    cropRecommendations: "फसल सिफारिश",
    recommendBtn: "सर्वश्रेष्ठ फसल बताएं",
    exportCsv: "CSV डाउनलोड",
    modelUnit: "मॉडल इकाई: क्विंटल/हेक्टेयर",
    noRecs: "अभी सिफारिश नहीं — “सर्वश्रेष्ठ फसल बताएं” दबाएँ।",
    marketPrices: "बाजार भाव",
    yieldScore: "उपज व टिकाऊपन",
    yield: "उपज",
    sustainability: "टिकाऊपन",
    topPredicted: "अनुमानित सर्वोच्च उपज",
    fieldInputs: "खेत की जानकारी",
    saveScenario: "सेव करें",
    reset: "रीसेट",
    tip: "संख्याएँ बदलें → “सर्वश्रेष्ठ फसल बताएं”",
    soilProfile: "मिट्टी विवरण",
    weatherWindow: "मौसम जानकारी",
    advisory: "सलाह",
    learnMore: "और जानें",
    soilMore:
      "pH, N, P, K और नमी फसल पर असर डालते हैं। ज़्यादातर फसलों के लिए pH 6.5–7.5 अच्छा माना जाता है।",
    weatherMore:
      "बुवाई व वृद्धि के दौरान बरसात और तापमान उपज को प्रभावित करते हैं। बुवाई का समय मौसम के आधार पर चुनें।",
    advisoryMore:
      "यहाँ सुझाई गई फसल के अनुसार स्थानीय बुवाई समय, दूरी और खाद तालिका अपनाएँ।",
    // field labels
    ph: "मिट्टी pH",
    moisture: "नमी (%)",
    n: "नाइट्रोजन (N)",
    p: "फॉस्फोरस (P)",
    k: "पोटैशियम (K)",
    rain_sum: "बारिश (7–30 दिन, मिमी)",
    tmin_avg: "न्यूनतम तापमान (°C)",
    tmax_avg: "अधिकतम तापमान (°C)",
    humidity_avg: "आर्द्रता (%)",
    wind_avg: "हवा (किमी/घं.)",
    area_ha: "खेत आकार (हेक्टेयर)",
    lat: "अक्षांश",
    lon: "देशांतर",
    sowing_month: "बुवाई महीना (1–12)",
    prev_crop_1: "पिछली फसल 1",
    prev_crop_2: "पिछली फसल 2",
    village: "गाँव",
    state: "राज्य",
    irrigation: "सिंचाई प्रकार",
    selectAll: "सभी चुनें",
    language: "भाषा",
  },
};

// -----------------------------
// Component
// -----------------------------
export default function Dashboard() {
  const { i18n } = useTranslation();

  // --- Language bootstrapping & toggle ---
  // Load saved language or infer from i18n (default to 'en')
  useEffect(() => {
    const saved = localStorage.getItem("agrivision.lang");
    const target = saved || (i18n.language?.startsWith("hi") ? "hi" : "en");
    if (i18n.language !== target) i18n.changeLanguage(target);
    // reflect on <html lang="...">
    document.documentElement.lang = target;
  }, [i18n]);

  const setLang = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("agrivision.lang", lng);
    document.documentElement.lang = lng;
  };

  const lang = i18n.language?.startsWith("hi") ? "hi" : "en";
  const L = LABELS[lang];

  // schema & crops from backend
  const [cropList, setCropList] = useState([]);
  const [featuresNum, setFeaturesNum] = useState([]);
  const [featuresCat, setFeaturesCat] = useState([]);

  // UI state
  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem("agrivision.sample");
    return saved ? JSON.parse(saved) : DEFAULT_SAMPLE;
  });
  const [selectedCrops, setSelectedCrops] = useState([]);
  const activeCrops = selectedCrops.length ? selectedCrops : cropList;

  const [prices, setPrices] = useState(null);
  const [recs, setRecs] = useState(null); // [{name, yield, score, reason, rank}]
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // derived score for rings
  const topYield = useMemo(() => (recs?.[0]?.yield ?? 0), [recs]);
  const scores = useMemo(
    () => ({
      yield: Math.max(0, Math.min(100, Math.round((topYield / 40) * 100))), // simple scaling (40 q/ha ~ 100)
      sustainability: 65, // placeholder
    }),
    [topYield]
  );

  // Load schema & crops
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API}/api/ml/meta`);
        setCropList(Array.isArray(data?.crops) ? data.crops : []);
        setFeaturesNum(Array.isArray(data?.features_num) ? data.features_num : NUM_FIELDS);
        setFeaturesCat(
          Array.isArray(data?.features_cat)
            ? data.features_cat
            : ["prev_crop_1", "prev_crop_2", "village", "state", "irrigation"]
        );
      } catch {
        // fallback to safe defaults
        setCropList(["Chickpea", "Cotton", "Maize", "Rice"]);
        setFeaturesNum(NUM_FIELDS);
        setFeaturesCat(["prev_crop_1", "prev_crop_2", "village", "state", "irrigation"]);
      }
    })();
  }, []);

  // Prices card
  useEffect(() => {
    (async () => {
      try {
        const p = await fetchMarketPrices();
        setPrices(p?.series || []);
      } catch {
        setPrices([]);
      }
    })();
  }, []);

  // Price shaping
  const priceSeries = (prices || []).slice(0, 8).map((m, i) => ({
    date: m.date || `D${i + 1}`,
    price: Number(String(m.price).replace(/[^\d.]/g, "")) || 0,
  }));

  // Handlers
  const onChange = (e) => {
    const { name, value } = e.target || {};
    setForm((f) => ({
      ...f,
      [name]: NUM_FIELDS.includes(name) ? Number(value) : value,
    }));
  };

  const resetForm = () => setForm(DEFAULT_SAMPLE);
  const saveScenario = () => localStorage.setItem("agrivision.sample", JSON.stringify(form));

  const handleRecommend = async () => {
    setBusy(true);
    setErr("");
    setRecs(null);
    try {
      const list = activeCrops.length ? activeCrops : cropList;
      if (!list.length) throw new Error("No crops available");
      const batch = list.map((c) => ({ ...form, crop: c }));
      const res = await predictYield(batch); // { predictions, units, count }
      const preds = res?.predictions || [];

      const maxY = Math.max(...preds, 0.0001);
      const rows = list
        .map((name, idx) => ({
          name,
          yield: preds[idx] ?? 0,
          score: Math.round(((preds[idx] ?? 0) / maxY) * 100),
          reason: lang === "hi" ? "अनुमानित उपज के आधार पर" : "Based on predicted yield",
        }))
        .sort((a, b) => b.yield - a.yield)
        .map((r, i) => ({ ...r, rank: i + 1 }));

      setRecs(rows);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Failed to predict");
      setRecs([]);
    } finally {
      setBusy(false);
    }
  };

  const exportCSV = () => {
    if (!recs?.length) return;
    downloadCSV(
      recs.map((r) => ({
        rank: r.rank,
        crop: r.name,
        predicted_yield_q_per_ha: Number(r.yield.toFixed(3)),
        relative_score_percent: r.score,
      }))
    );
  };

  // Pretty field label
  const label = (k) => {
    const lk = L[k];
    if (lk) return lk;
    // fallback: titleize
    return k.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="grid gap-4">
      {/* Top Row */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Recommendations */}
        <Card title={L.cropRecommendations}>
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={handleRecommend}
              className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5 rounded"
              disabled={busy}
            >
              {busy ? (lang === "hi" ? "गणना हो रही…" : "Predicting…") : L.recommendBtn}
            </button>
            <button
              onClick={exportCSV}
              className="bg-slate-800 hover:bg-slate-900 text-white text-sm px-3 py-1.5 rounded disabled:opacity-50"
              disabled={!recs?.length}
            >
              {L.exportCsv}
            </button>
            <span className="text-xs opacity-70">{L.modelUnit}</span>
          </div>

          {err && <div className="text-red-600 text-sm mb-2">Error: {String(err)}</div>}

          {!recs ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ) : recs.length ? (
            <ul className="space-y-2 text-sm">
              {recs.map((c) => (
                <li key={c.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-[160px]">
                    <Badge>#{c.rank}</Badge>
                    <span className="font-medium">{c.name}</span>
                  </div>
                  <div className="flex-1 h-2 bg-slate-200 rounded overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${c.score}%` }}
                      title={`${c.score}%`}
                    />
                  </div>
                  <div className="min-w-[120px] text-right tabular-nums">
                    {c.yield.toFixed(2)} q/ha
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="opacity-70 text-sm">{L.noRecs}</div>
          )}
        </Card>

        {/* Prices */}
        <Card title={L.marketPrices}>
          {prices === null ? (
            <Skeleton className="h-56 w-full" />
          ) : prices.length ? (
            <PriceChart data={priceSeries} />
          ) : (
            <div className="opacity-70 text-sm">
              {lang === "hi" ? "कोई डेटा नहीं (API जोड़ें)" : "No data (connect API)"}
            </div>
          )}
        </Card>

        {/* Rings */}
        <Card title={L.yieldScore}>
          <div className="flex gap-6 items-center">
            <StatRing value={scores.yield} label={L.yield} />
            <StatRing value={scores.sustainability} label={L.sustainability} />
          </div>
          <div className="text-xs opacity-70 mt-2">
            {L.topPredicted}: <b>{topYield.toFixed(2)} q/ha</b>
          </div>
        </Card>
      </div>

      {/* Field Inputs */}
      <Card title={L.fieldInputs}>
        {/* Learn more (inline, collapsible) */}
        <details className="mb-3">
          <summary className="text-xs cursor-pointer opacity-80">{L.learnMore}</summary>
          <div className="text-xs opacity-75 mt-2 space-y-1">
            <div>• {L.soilMore}</div>
            <div>• {L.weatherMore}</div>
            <div>• {L.advisoryMore}</div>
          </div>
        </details>

        <div className="grid md:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-3">
          {/* Numeric inputs */}
          {featuresNum.map((k) => (
            <label key={k} className="text-sm flex flex-col gap-1">
              <span className="font-medium">{label(k)}</span>
              <input
                name={k}
                value={form[k] ?? ""}
                onChange={onChange}
                type="number"
                className="border rounded px-2 py-1"
              />
            </label>
          ))}

          {/* Categorical inputs */}
          {featuresCat.map((k) => (
            <label key={k} className="text-sm flex flex-col gap-1">
              <span className="font-medium">{label(k)}</span>
              <input
                name={k}
                value={form[k] ?? ""}
                onChange={onChange}
                type="text"
                className="border rounded px-2 py-1"
              />
            </label>
          ))}
        </div>

        {/* Crop chooser */}
        <div className="col-span-full flex flex-wrap gap-2 mt-3">
          {(cropList || []).map((c) => {
            const on = selectedCrops.includes(c);
            return (
              <button
                key={c}
                onClick={() =>
                  setSelectedCrops(on ? selectedCrops.filter((x) => x !== c) : [...selectedCrops, c])
                }
                className={`px-3 py-1 rounded text-sm border ${
                  on
                    ? "bg-green-600 text-white border-green-700"
                    : "bg-slate-100 dark:bg-slate-800 border-slate-300"
                }`}
                title={lang === "hi" ? "इस फसल को चुनें/हटाएँ" : "Toggle this crop"}
              >
                {c}
              </button>
            );
          })}
          {!!cropList.length && (
            <button
              onClick={() => setSelectedCrops([])}
              className="px-3 py-1 rounded text-sm border bg-slate-200 dark:bg-slate-700"
              title={lang === "hi" ? "सभी का उपयोग करें" : "Use all crops"}
            >
              {L.selectAll}
            </button>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded"
            onClick={saveScenario}
          >
            {L.saveScenario}
          </button>
          <button
            className="bg-slate-200 hover:bg-slate-300 text-sm px-3 py-1.5 rounded"
            onClick={resetForm}
          >
            {L.reset}
          </button>
          <div className="text-xs opacity-70 self-center">{L.tip}</div>
        </div>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs
          tabs={[
            {
              id: "soil",
              label: L.soilProfile,
              content: (
                <div className="text-sm opacity-80 space-y-2">
                  <div>
                    {lang === "hi"
                      ? "pH, NPK, नमी — अपने खेत की रिपोर्ट से यहाँ भरें।"
                      : "pH, NPK, moisture — fill from your soil test report."}
                  </div>
                  <details>
                    <summary className="text-xs cursor-pointer opacity-80">{L.learnMore}</summary>
                    <div className="text-xs opacity-75 mt-1">{L.soilMore}</div>
                  </details>
                </div>
              ),
            },
            {
              id: "weather",
              label: L.weatherWindow,
              content: (
                <div className="text-sm opacity-80 space-y-2">
                  <div>
                    {lang === "hi"
                      ? "अगले 7–30 दिनों की बारिश/तापमान देखें और ऊपर Rain/Temp भरें।"
                      : "Check next 7–30 days rain/temperature and fill Rain/Temp above."}
                  </div>
                  <details>
                    <summary className="text-xs cursor-pointer opacity-80">{L.learnMore}</summary>
                    <div className="text-xs opacity-75 mt-1">{L.weatherMore}</div>
                  </details>
                </div>
              ),
            },
            {
              id: "advice",
              label: L.advisory,
              content: (
                <div className="text-sm opacity-80 space-y-2">
                  <div>
                    {lang === "hi"
                      ? "ऊपर चुनी/सुझाई गई फसल के अनुसार स्थानीय सलाह दिखाएँ।"
                      : "Show localized guidance for the chosen/suggested crop."}
                  </div>
                  <details>
                    <summary className="text-xs cursor-pointer opacity-80">{L.learnMore}</summary>
                    <div className="text-xs opacity-75 mt-1">{L.advisoryMore}</div>
                  </details>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
