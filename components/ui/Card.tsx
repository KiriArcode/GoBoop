import React from "react";

export const Card = ({
  children,
  className = "",
  onClick,
  highlight = false,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  highlight?: boolean;
}) => (
  <div
    onClick={onClick}
    className={`
      relative overflow-hidden rounded-2xl p-4 transition-all duration-300
      ${onClick ? "cursor-pointer active:scale-[0.98]" : ""}
      ${
        highlight
          ? "bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 shadow-lg shadow-black/50"
          : "bg-[#1A1A1A] border border-neutral-800"
      }
      ${className}
    `}
  >
    {children}
  </div>
);
