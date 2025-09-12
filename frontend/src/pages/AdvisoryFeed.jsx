import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function AdvisoryFeed() {
  const items = [
    { id: 1, title: "Irrigate tomorrow", body: "Rain probability low; irrigate in the morning." },
    { id: 2, title: "Nitrogen top dressing", body: "Apply 30 kg/acre Urea at 25 DAS." }
  ];
  return (
    <div className="grid gap-3">
      {items.map(a=>(
        <Card key={a.id} title={a.title}>
          <div className="text-sm opacity-80">{a.body}</div>
          <div className="mt-3"><Button variant="subtle">Acknowledge</Button></div>
        </Card>
      ))}
    </div>
  );
}
