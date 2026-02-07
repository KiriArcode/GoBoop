import React from "react";

export const NavButton = ({
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-16 h-12 gap-1 transition-all duration-300 ${isActive ? "text-white" : "text-neutral-600 hover:text-neutral-400"}`}
  >
    <Icon
      className={`w-6 h-6 transition-all ${isActive ? "fill-current scale-110" : ""}`}
      strokeWidth={isActive ? 2.5 : 1.5}
    />
    <span
      className={`text-[10px] font-medium transition-opacity ${isActive ? "opacity-100" : "opacity-0"}`}
    >
      {label}
    </span>
  </button>
);
