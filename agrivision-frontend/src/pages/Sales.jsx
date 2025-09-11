import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function Sales() {
  return (
    <div className="grid gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Harvest & Sales</h2>
        <Button>Add sale</Button>
      </div>
      <Card>
        <div className="text-sm opacity-80">Harvest log, buyer, price, revenue.</div>
      </Card>
    </div>
  );
}
