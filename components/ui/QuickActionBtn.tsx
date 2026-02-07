import React from "react";

export const QuickActionBtn = ({
  icon: Icon,
  label,
  color,
  bg,
  onClick,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
  bg: string;
  onClick: () => void;
  delay: string;
}) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-2 group animate-scaleIn"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div
      className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95 border border-transparent group-hover:border-white/10`}
    >
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <span className="text-[10px] text-neutral-400 font-medium group-hover:text-white transition-colors">
      {label}
    </span>
  </button>
);
