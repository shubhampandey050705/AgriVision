import { useRef, useState } from "react";
import { motion } from "framer-motion";

export default function FileDrop({ onFile }) {
  const ref = useRef(null);
  const [hover, setHover] = useState(false);

  const handle = (file) => {
    if (file && onFile) onFile(file);
  };

  return (
    <motion.div
      onDragOver={(e)=>{ e.preventDefault(); setHover(true); }}
      onDragLeave={()=>setHover(false)}
      onDrop={(e)=>{ e.preventDefault(); setHover(false); handle(e.dataTransfer.files?.[0]); }}
      className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer ${hover ? "border-sky-500 bg-sky-50/50 dark:bg-sky-900/10" : "border-neutral-300 dark:border-neutral-700"}`}
      onClick={()=> ref.current?.click()}
    >
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e)=> handle(e.target.files?.[0])} />
      <div className="text-sm opacity-80">Drop an image here or click to browse</div>
    </motion.div>
  );
}
