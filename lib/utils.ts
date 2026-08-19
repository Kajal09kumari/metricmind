import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { DataType } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatValue(val: any, type: DataType | string = "number"): string {
  if (val === null || val === undefined || Number.isNaN(val)) return "—";

  const num = typeof val === "number" ? val : parseFloat(val);
  if (Number.isNaN(num)) return String(val);

  switch (type) {
    case "percentage":
      // If decimal (e.g. 0.386) or already percentage (e.g. 38.6)
      const pctVal = Math.abs(num) <= 1 && num !== 0 ? num * 100 : num;
      return `${pctVal.toFixed(1)}%`;

    case "currency":
      if (Math.abs(num) >= 1_000_000) {
        return `€${(num / 1_000_000).toFixed(2)}M`;
      }
      if (Math.abs(num) >= 1_000) {
        return `€${(num / 1_000).toFixed(1)}K`;
      }
      return `€${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    case "integer":
      return Math.round(num).toLocaleString();

    case "number":
    default:
      if (Number.isInteger(num)) {
        return num.toLocaleString();
      }
      return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}

export function formatDelta(val: number, type: DataType | string = "percentage"): string {
  const prefix = val > 0 ? "+" : "";
  if (type === "percentage") {
    const pctVal = Math.abs(val) <= 1 && val !== 0 ? val * 100 : val;
    return `${prefix}${pctVal.toFixed(1)}%`;
  }
  return `${prefix}${formatValue(val, type)}`;
}
