import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function ScoutingLogs() {
  return (
    <div className="grid gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Field Scouting</h2>
        <Button>Add observation</Button>
      </div>
      <Card title="Recent">
        <div className="text-sm opacity-80">Logs with photos, GPS, severity.</div>
      </Card>
    </div>
  );
}
