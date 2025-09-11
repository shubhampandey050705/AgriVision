import useTheme from "../hooks/useTheme";
import { useTranslation } from "react-i18next";
import Select from "./ui/Select"; // ← relative to /components

export default function ThemeToggle() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-flex items-center gap-2 text-sm">
      <span className="opacity-70">{t("labels.theme")}:</span>
      <Select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">{t("labels.light")}</option>
        <option value="dark">{t("labels.dark")}</option>
        <option value="system">{t("labels.system")}</option>
      </Select>
    </div>
  );
}
