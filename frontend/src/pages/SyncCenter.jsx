import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { listQueue, clearQueue } from "../utils/db";

export default function SyncCenter() {
  const [queue, setQueue] = useState([]);

  const load = async () => setQueue(await listQueue());

  useEffect(() => { load(); }, []);

  return (
    <div className="grid gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Sync Center</h2>
        <div className="flex gap-2">
          <Button onClick={load}>Refresh</Button>
          <Button variant="outline" onClick={async ()=>{ await clearQueue(); await load(); }}>Clear queue</Button>
        </div>
      </div>
      <Card>
        {!queue.length ? (
          <div className="text-sm opacity-70">No pending requests. You’re up to date.</div>
        ) : (
          <ul className="text-sm space-y-2">
            {queue.map(item => (
              <li key={item.id} className="flex justify-between">
                <span>{item.type}</span><span className="opacity-70">{new Date(item.ts).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
