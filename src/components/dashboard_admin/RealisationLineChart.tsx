import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

interface RealisationData {
  mois: number;
  audits_realises: number;
}

interface Props {
  data: RealisationData[];
}

const monthLabels = [
  "", "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sep", "Oct", "Nov", "Déc"
];

export default function RealisationLineChart({ data }: Props) {
  const formattedData = data.map(item => ({
    mois: monthLabels[item.mois],
    audits_realises: item.audits_realises,
  }));

  return (
    <Card className="bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-gacam-green mb-4">
          Taux de réalisation (audits terminés)
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={formattedData}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
            <XAxis dataKey="mois" tick={{ fill: "#4b5563", fontSize: 12 }} />
            <YAxis tick={{ fill: "#4b5563", fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", borderColor: "#ddd" }}
              labelStyle={{ fontWeight: 500, color: "#374151" }}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "14px" }} />
            <Line
              type="monotone"
              dataKey="audits_realises"
              stroke="#01783f"
              strokeWidth={3}
              dot={{ r: 4, fill: "#01783f" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
