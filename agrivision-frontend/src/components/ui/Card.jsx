import { motion } from "framer-motion";
import { cn } from "./cn";

export default function Card({ title, className, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white/90 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-5 shadow-card backdrop-blur",
        className
      )}
    >
      {title && <div className="font-semibold mb-3">{title}</div>}
      {children}
    </motion.div>
  );
}
