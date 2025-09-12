import Card from "../components/ui/Card";
import ThemeToggle from "../components/ThemeToggle";
import LangSelect from "../components/LangSelect";

export default function Settings() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card title="Preferences">
        <div className="flex gap-4 items-center">
          <LangSelect />
          <ThemeToggle />
        </div>
      </Card>
      <Card title="Notifications">
        <div className="text-sm opacity-80">Enable SMS / email alerts (wire to backend).</div>
      </Card>
      <Card title="Account">
        <div className="text-sm opacity-80">Profile, data export, delete account.</div>
      </Card>
    </div>
  );
}
