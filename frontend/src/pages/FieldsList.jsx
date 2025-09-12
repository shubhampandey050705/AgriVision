import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

export default function FieldsList() {
  // TODO: fetch fields list
  const fields = []; // demo
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Fields</h2>
        <Link to="/app/fields/new"><Button>Add field</Button></Link>
      </div>

      {!fields.length ? (
        <Card>
          <div className="opacity-70 text-sm">No fields yet. Click “Add field”.</div>
        </Card>
      ) : fields.map(f => (
        <Card key={f.id}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{f.name}</div>
              <div className="text-sm opacity-70">{f.area} acres • {f.village}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge>{f.crop || "No crop"}</Badge>
              <Link to={`/app/fields/${f.id}`} className="underline text-sm">Open</Link>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
