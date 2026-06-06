import { createElement } from "react";

const StatCard = ({ title, value, subtitle, icon, color = "bg-[#ede9fe] text-[#6d28d9]" }) => {
  return (
    <div className="metric-card flex min-h-[132px] items-center justify-between gap-4">
      <div className="relative z-10 min-w-0">
        <p className="text-sm font-bold text-[#635f86]">{title}</p>

        <h3 className="mt-2 text-3xl font-black tracking-normal text-[#16123a]">
          {value}
        </h3>

        {subtitle && (
          <p className="mt-1 text-xs font-semibold text-[#817aa3]">
            {subtitle}
          </p>
        )}
      </div>

      {icon && (
        <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-[8px] ${color}`}>
          {createElement(icon, { size: 22 })}
        </div>
      )}
    </div>
  );
};

export default StatCard;
