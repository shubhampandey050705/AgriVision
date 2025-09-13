// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "../components/ui/Card";
import Tabs from "../components/ui/Tabs";
import Skeleton from "../components/ui/Skeleton";
import Badge from "../components/ui/Badge";
import StatRing from "../components/StatRing";
import PriceChart from "../components/PriceChart";
import { fetchRecommendations, fetchMarketPrices } from "../utils/api";

export default function Dashboard() {
  const { t } = useTranslation();
  const [recs, setRecs] = useState(null);
  const [prices, setPrices] = useState(null);
  const [scores, setScores] = useState({ yield: 72, sustainability: 65 });

  useEffect(() => {
    (async ()=>{
      try {
        const [r, p] = await Promise.allSettled([
          fetchRecommendations({ location: { lat: 26.8, lon: 82.0 } }),
          fetchMarketPrices()
        ]);
        if (r.status === "fulfilled") setRecs(r.value?.crops || []);
        else setRecs([]);
        if (p.status === "fulfilled") setPrices(p.value?.series || []);
        else setPrices([]);
      } catch {
        setRecs([]);
        setPrices([]);
      }
    })();
  }, []);

  const priceSeries = (prices || []).slice(0, 8).map((m, i) => ({
    date: m.date || `D${i+1}`,
    price: Number(String(m.price).replace(/[^\d.]/g,"")) || 0
  }));

  return (
    <div className="grid gap-4">
      <div className="grid md:grid-cols-3 gap-4">
        <Card title={t("labels.cropRecommendations")}>
          {!recs ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ) : recs.length ? (
            <ul className="space-y-2 text-sm">
              {recs.map((c)=>(
                <li key={c.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge>{Math.round(c.score)}%</Badge>
                    <span className="font-medium">{c.name}</span>
                  </div>
                  <span className="opacity-60">{c.reason || "Suitable"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="opacity-70 text-sm">No data (connect API)</div>
          )}
        </Card>

        <Card title={t("labels.marketPrices")}>
          {prices === null ? (
            <Skeleton className="h-56 w-full" />
          ) : prices.length ? (
            <PriceChart data={priceSeries} />
          ) : (
            <div className="opacity-70 text-sm">No data (connect API)</div>
          )}
        </Card>

        <Card title={t("labels.yieldScore")}>
          <div className="flex gap-6 items-center">
            <StatRing value={scores.yield} label="Yield" />
            <StatRing value={scores.sustainability} label="Sustainability" />
          </div>
        </Card>
      </div>

      <Card>
        <Tabs
          tabs={[
            {
              id: "soil",
              label: "Soil profile",
              content: <div className="text-sm opacity-80">pH, NPK, moisture (hook to your API).</div>
            },
            {
              id: "weather",
              label: "Weather window",
              content: <div className="text-sm opacity-80">Next 7-day rainfall & temp (hook to API).</div>
            },
            {
              id: "advice",
              label: "Advisory",
              content: <div className="text-sm opacity-80">Localized agronomy tips from your ML/LLM.</div>
            }
          ]}
        />
      </Card>
    </div>
  );
}
