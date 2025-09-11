// src/components/ui/Tabs.jsx
import { useState } from "react";
import { cn } from "./cn";

export default function Tabs({ tabs = [], defaultId }) {
  const initial = defaultId ?? tabs[0]?.id;
  const [active, setActive] = useState(initial);

  return (
    <div>
      <div className="flex gap-2 mb-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-sm border transition-colors",
              active === t.id
                ? "bg-brand-500 text-white border-brand-500 shadow-glow"
                : "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200/70 dark:hover:bg-neutral-700"
            )}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        {tabs.map((t) =>
          t.id === active ? (
            <div key={t.id} role="tabpanel">
              {t.content}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
