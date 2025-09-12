import { cn } from "./cn";
export default function Select({ className, ...props }) {
  return (
    <select
      className={cn("rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400", className)}
      {...props}
    />
  );
}
