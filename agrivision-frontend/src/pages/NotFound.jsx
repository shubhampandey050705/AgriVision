import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto">
      <Card title="404 — Page not found">
        <div className="text-sm opacity-80 mb-3">
          The page you’re looking for doesn’t exist.
        </div>
        <Link to="/app"><Button>Go to Dashboard</Button></Link>
      </Card>
    </div>
  );
}
