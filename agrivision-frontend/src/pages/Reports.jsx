import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function Reports() {
  return (
    <div className="grid gap-4">
      <Card title="Season summary">
        <div className="text-sm opacity-80">Yield vs plan, costs, input usage.</div>
        <div className="mt-3"><Button>Export PDF</Button></div>
      </Card>
    </div>
  );
}
