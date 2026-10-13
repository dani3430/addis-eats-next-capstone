"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function OrdersPerDayChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 16, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" interval="preserveStartEnd" minTickGap={16} />
        <YAxis
          domain={[0, "auto"]}
          allowDecimals={false}
          width={48}
          label={{ value: "Orders", angle: -90, position: "insideLeft" }}
        />
        <Tooltip formatter={(value) => [value, "Orders"]} />
        <Line
          type="monotone"
          dataKey="orders"
          name="Orders"
          stroke="#92400e"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}