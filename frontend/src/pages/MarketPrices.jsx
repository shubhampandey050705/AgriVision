import Card from "../components/ui/Card";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import PriceChart from "../components/PriceChart";

export default function MarketPrices() {
  const demo = Array.from({ length: 8 }).map((_, i) => ({
    date: `D${i + 1}`,
    price: i === 3 ? 2300 : 2000 + i * 50,
  }));

  return (
    <div className="grid gap-4">
      <Card title="Market Prices">
        <div className="grid md:grid-cols-3 gap-3">
          <Select defaultValue="">
            <option value="">Commodity</option>
            <option>Wheat</option>
            <option>Paddy</option>
          </Select>

          <Select defaultValue="">
            <option value="">Mandi</option>
            <option>Delhi</option>
            <option>Lucknow</option>
          </Select>

          {/* ✅ Button styled with bg-emerald-500 */}
          <Button className="bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600 transition">
            Create alert
          </Button>
        </div>
      </Card>

      <Card title="Price trend">
        <PriceChart data={demo} />
      </Card>
    </div>
  );
}
