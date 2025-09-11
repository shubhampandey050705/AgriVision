import { cn } from "./cn";
export default function Input({ className, ...props }) {
  return (
    <input
      className={cn("w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-brand-400", className)}
      {...props}
    />
  );
}
