import { useTranslation } from "react-i18next";
import ThemeToggle from "./ThemeToggle";
import LangSelect from "./LangSelect";
import { motion } from "framer-motion";
import { Leaf, Sprout } from "lucide-react";

export default function TopBar() {
  const { t } = useTranslation();
  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 border-b border-neutral-200/70 dark:border-neutral-800/70 bg-white/60 dark:bg-neutral-950/50 backdrop-blur"
    >
      <div className="container py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <Sprout className="w-5 h-5 text-brand-500" />
          {t("appName")}
          <Leaf className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="flex items-center gap-3">
          <LangSelect />
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
}
