import React from "react";

export const SectionHeader = ({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) => (
  <div className="flex justify-between items-center mb-3 mt-6 px-1">
    <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
      {title}
    </h2>
    {action}
  </div>
);
