import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

interface MonthlyData {
  mois: number;
  nombre: number;
}

interface Props {
  data: MonthlyData[];
}

const monthLabels = [
  "", "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sep", "Oct", "Nov", "Déc"
];

export default function MonthlyAuditBar({ data }: Props) {
  const formattedData = data.map(item => ({
    mois: monthLabels[item.mois],
    nombre: item.nombre,
  }));

  return (
    <Card className="bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-gacam-green mb-4">
          Audits planifiés par mois
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={formattedData}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
            <XAxis dataKey="mois" tick={{ fill: "#4b5563", fontSize: 12 }} />
            <YAxis tick={{ fill: "#4b5563", fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", borderColor: "#ddd" }}
              labelStyle={{ fontWeight: 500, color: "#374151" }}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "14px" }} />
            <Bar
              dataKey="nombre"
              fill="#01783f"
              radius={[6, 6, 0, 0]}
              activeBar={{ fill: "#1e6a3c" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
