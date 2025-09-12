import { cn } from "./cn";

export default function Button({ as:Comp="button", className, variant="primary", size="md", ...props }) {
  const base = "inline-flex items-center justify-center rounded-xl font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = {
    sm: "text-sm px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-5 py-2.5"
  };
  const variants = {
    primary: "bg-brand-500 text-white hover:bg-brand-600 shadow-glow",
    subtle: "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200/70 dark:hover:bg-neutral-700",
    outline: "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40",
    ghost: "hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50"
  };
  return <Comp className={cn(base, sizes[size], variants[variant], className)} {...props} />;
}
