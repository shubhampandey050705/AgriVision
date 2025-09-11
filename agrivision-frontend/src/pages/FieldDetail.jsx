import { useParams, Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Tabs from "../components/ui/Tabs";

export default function FieldDetail() {
  const { id } = useParams();
  const tabs = [
    { id: "summary", label: "Summary", content: <div className="text-sm opacity-80">Crop, tasks, last irrigation, alerts.</div> },
    { id: "soil", label: "Soil", content: <div className="text-sm opacity-80">pH, NPK, organic carbon.</div> },
    { id: "timeline", label: "Timeline", content: <div className="text-sm opacity-80">Sowing → Harvest milestones.</div> },
  ];
  return (
    <div className="space-y-4">
      <div className="text-sm"><Link className="underline" to="/app/fields">← Back to fields</Link></div>
      <Card title={`Field #${id}`}>
        <Tabs tabs={tabs} />
      </Card>
    </div>
  );
}
