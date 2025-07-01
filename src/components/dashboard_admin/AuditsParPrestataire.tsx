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

interface Props {
  data: {
    nom: string;
    nb_audits: number;
  }[];
}

export default function AuditsParPrestataire({ data }: Props) {
  return (
    <Card className="bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-gacam-green mb-4">
          Audits par prestataire
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
            <XAxis dataKey="nom" tick={{ fill: "#4b5563", fontSize: 12 }} />
            <YAxis tick={{ fill: "#4b5563", fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", borderColor: "#ddd" }}
              labelStyle={{ fontWeight: 500, color: "#374151" }}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "14px" }} />
            <Bar
              dataKey="nb_audits"
              fill="#aa2329"
              radius={[6, 6, 0, 0]}
              activeBar={{ fill: "#8e312d" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
