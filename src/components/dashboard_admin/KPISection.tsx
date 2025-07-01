import { Card, CardContent } from "@/components/ui/card";

interface KPIData {
  auditeurs_total: number;
  prestataires_total: number;
  taux_occupation_auditeurs: number;
  audits_total: number;
  audits_en_cours: number;
  audits_suspendu: number;
  audits_termines: number;
  affectations_total: number;
  budget_total_alloue: number;
  realisation_total: number;
  solde_total: number;
  taux_conso_budget: number;
  prestataires_inactifs: number;
}

interface Props {
  data: KPIData;
}

export default function KPISection({ data }: Props) {
  const kpis = [
    { label: "Total Auditeurs", value: data.auditeurs_total },
    { label: "Total Prestataires", value: data.prestataires_total },
    { label: "Taux d'occupation", value: `${data.taux_occupation_auditeurs}%` },
    { label: "Total des Audits", value: data.audits_total },
    { label: "Audits en cours", value: data.audits_en_cours },
    { label: "Audits suspendus", value: data.audits_suspendu },
    { label: "Audits terminés", value: data.audits_termines },
    { label: "Total Affectations", value: data.affectations_total },
    { label: "Budget total alloué", value: `${data.budget_total_alloue} MAD` },
    { label: "Montant réalisé", value: `${data.realisation_total} MAD` },
    { label: "Solde restant", value: `${data.solde_total} MAD` },
    { label: "Taux de conso budget", value: `${data.taux_conso_budget}%` },
    { label: "Prestataires inactifs", value: data.prestataires_inactifs },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => (
        <Card
          key={idx}
          className="bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md"
        >
          <CardContent className="p-5">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{kpi.label}</p>
            <p className="text-2xl font-bold text-gacam-green">{kpi.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
