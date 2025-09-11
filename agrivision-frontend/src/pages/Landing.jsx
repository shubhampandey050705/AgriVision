import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function Landing() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="text-center py-12">
        <h1 className="text-3xl font-bold mb-3">AgriVision</h1>
        <p className="opacity-80 mb-6">
          AI-powered crop recommendations, disease detection, market prices, and local-language advisory.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/app"><Button size="lg">Open App</Button></Link>
          <Link to="/auth/register"><Button variant="outline" size="lg">Create account</Button></Link>
        </div>
      </Card>
    </div>
  );
}
