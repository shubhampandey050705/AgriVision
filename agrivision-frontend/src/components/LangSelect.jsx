import { useTranslation } from "react-i18next";
import Select from "./ui/Select"; // ← relative to /components

export default function LangSelect() {
  const { i18n, t } = useTranslation();
  return (
    <div className="inline-flex items-center gap-2 text-sm">
      <span className="opacity-70">{t("labels.language")}:</span>
      <Select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
      >
        <option value="en">English</option>
        <option value="hi">हिंदी</option>
      </Select>
    </div>
  );
}
