import { Card, CardContent } from "@/components/ui/card";

interface Prestataire {
  nom: string;
  affectations: number;
}

interface Props {
  prestataires: Prestataire[];
}

export default function PrestatairesTop({ prestataires }: Props) {
  return (
    <Card className="bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-gacam-green mb-4">
          Top Prestataires
        </h2>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {prestataires.map((p, index) => (
            <li key={index} className="flex justify-between py-2">
              <span className="font-medium text-gray-800 dark:text-gray-200">{p.nom}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {p.affectations} affectations
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
