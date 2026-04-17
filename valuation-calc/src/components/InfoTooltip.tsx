"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  text: string;
}

export default function InfoTooltip({ text }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <span className="relative inline-flex ml-1" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#2d4a2d]/10 text-[#2d4a2d] hover:bg-[#2d4a2d]/20 transition-colors text-[10px] font-bold leading-none cursor-pointer"
        aria-label="More info"
      >
        i
      </button>
      {open && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-[#2d4a2d] text-white text-xs leading-relaxed p-3 shadow-lg">
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#2d4a2d]" />
          {text}
        </div>
      )}
    </span>
  );
}
