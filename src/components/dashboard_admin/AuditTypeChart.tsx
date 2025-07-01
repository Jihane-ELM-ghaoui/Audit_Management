import { Card, CardContent } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TypeAudit {
  type: string;
  count: number;
}

interface Props {
  types: TypeAudit[];
}

const COLORS = ["#01783f", "#aa2329", "#3a5c38", "#e20621", "#dc2626"];

export default function AuditTypeChart({ types }: Props) {
  return (
    <Card className="bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-gacam-green mb-4">
          Types d'audit
        </h2>
        <div className="flex flex-col md:flex-row md:items-center">
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie
                data={types}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label
              >
                {types.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", borderColor: "#ccc" }}
                labelStyle={{ color: "#555", fontWeight: 500 }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="ml-6 mt-4 md:mt-0">
            {types.map((entry, index) => (
              <div key={index} className="flex items-center mb-2">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {entry.type} <span className="text-gray-500">({entry.count})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
