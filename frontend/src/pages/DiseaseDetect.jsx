import { useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "../components/ui/Card";
import FileDrop from "../components/FileDrop";
import { detectDisease } from "../utils/api";

export default function DiseaseDetect() {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const runDetect = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const res = await detectDisease(file);
      setResult(res);
    } catch (e) {
      setResult({ error: "Service not reachable. Connect ML API." });
    } finally { setBusy(false); }
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card title={t("nav.disease")}>
        <div className="space-y-4">
          <FileDrop onFile={setFile} />
          {file && <img src={URL.createObjectURL(file)} alt="preview" className="rounded-xl w-full object-cover max-h-80" />}
          <button
            onClick={runDetect}
            disabled={!file || busy}
            className="w-full rounded-xl bg-sky-600 text-white py-2 disabled:opacity-50"
          >
            {busy ? "Detecting…" : t("actions.detect")}
          </button>
        </div>
      </Card>

      <Card title="Result">
        <pre className="text-xs overflow-auto">{result ? JSON.stringify(result, null, 2) : "No result yet"}</pre>
      </Card>
    </div>
  );
}
