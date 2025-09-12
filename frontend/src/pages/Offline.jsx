import Card from "../components/ui/Card";
export default function Offline() {
  return (
    <div className="max-w-lg mx-auto">
      <Card title="You’re offline">
        <div className="text-sm opacity-80">
          This is the PWA offline page. App shell works; queued actions will sync when network returns.
        </div>
      </Card>
    </div>
  );
}
