import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function SoilHealth() {
  return (
    <div className="grid gap-4">
      <Card title="Soil Test">
        <div className="text-sm opacity-80">Upload soil report or request a test.</div>
        <div className="mt-3 flex gap-2">
          <Button>Upload report</Button>
          <Button variant="outline">Request test</Button>
        </div>
      </Card>
      <Card title="Derived nutrients">
        <div className="text-sm opacity-80">N, P, K, pH, OC readings & recommendations.</div>
      </Card>
    </div>
  );
}
