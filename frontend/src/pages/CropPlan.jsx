import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Input from "../components/ui/Input";

export default function CropPlan() {
  return (
    <div className="grid gap-4">
      <Card title="Crop Plan">
        <div className="grid md:grid-cols-3 gap-3">
          <Select defaultValue=""><option value="">Select crop</option><option>Wheat</option><option>Paddy</option></Select>
          <Select defaultValue=""><option value="">Variety</option><option>Local</option><option>HYV</option></Select>
          <Input type="date" />
        </div>
        <div className="mt-3"><Button>Generate calendar</Button></div>
      </Card>
      <Card title="Calendar">
        <div className="opacity-70 text-sm">Task calendar appears here (ICS export, mark done).</div>
      </Card>
    </div>
  );
}
