import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function Inventory() {
  return (
    <div className="grid gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Inputs Inventory</h2>
        <Button>Add item</Button>
      </div>
      <Card>
        <div className="text-sm opacity-80">Seeds, fertilizers, pesticides with qty & expiry.</div>
      </Card>
    </div>
  );
}
