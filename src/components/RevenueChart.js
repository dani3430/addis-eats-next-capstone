"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { etb } from "@/lib/format";

export default function RevenueChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 24, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="area" />
        {/* Bars must start at zero: the length of a bar IS the value. */}
        <YAxis domain={[0, "auto"]} tickFormatter={etb} width={90} />
        <Tooltip formatter={(value) => [etb(value), "Revenue"]} />
        <Bar dataKey="revenue" name="Revenue" fill="#92400e">
          {/* The amount on each bar, so the chart does not depend on colour. */}
          <LabelList dataKey="revenue" position="top" formatter={etb} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}