import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import KPISection from "@/components/dashboard_admin/KPISection";
import AuditTypeChart from "@/components/dashboard_admin/AuditTypeChart";
import MonthlyAuditBar from "@/components/dashboard_admin/MonthlyAuditBar";
import RealisationLineChart from "@/components/dashboard_admin/RealisationLineChart";
import PrestatairesTop from "@/components/dashboard_admin/PrestatairesTop";
import AuditsParPrestataire from "@/components/dashboard_admin/AuditsParPrestataire";
import PrestataireKPIList from "@/components/dashboard_admin/PrestataireKPIList";
import api from "@/api";

import { useAuth } from "@/context/AuthProvider";
import { Navigate } from "react-router-dom";
import UserLogsTable from "@/components/logs/UserLogsTable";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [moisPlans, setMoisPlans] = useState([]);
  const [tauxRealisation, setTauxRealisation] = useState([]);
  const [topPrestataires, setTopPrestataires] = useState([]);
  const [prestatairesKPI, setPrestatairesKPI] = useState([]);

  const { keycloak } = useAuth();

  if (!keycloak.tokenParsed?.realm_access?.roles.includes('admin')) {
    return <Navigate to="/not-authorized" />;
  }

  useEffect(() => {
    const fetchData = async () => {

      try {
        const [kpis, plans, taux, prestataires, prestatairesKPIData] = await Promise.all([
          api.get("/admin/kpis"),
          api.get("/admin/audits-par-mois"),
          api.get("/admin/taux-realisation-audits"),
          api.get("/admin/affect-prestataires"),
          api.get("/admin/prestataires-kpi"),
        ]);

        setPrestatairesKPI(prestatairesKPIData.data);
        setData(kpis.data);
        setMoisPlans(plans.data);
        setTauxRealisation(taux.data);
        setTopPrestataires(prestataires.data);
      } catch (error) {
        console.error("Erreur lors du chargement du dashboard:", error);
      }
    };

    fetchData();
  }, []);

  if (!data) return <div className="text-center mt-10">Chargement...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Tableau de bord</h1>

      <KPISection data={data} />

      <div className="grid md:grid-cols-2 gap-6">
        <AuditTypeChart types={data.types_audit} />
        <PrestatairesTop prestataires={topPrestataires} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <PrestataireKPIList prestataires={prestatairesKPI} />
        <UserLogsTable />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <MonthlyAuditBar data={moisPlans} />
        <RealisationLineChart data={tauxRealisation} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <AuditsParPrestataire data={data.audits_par_prestataire} />
      </div>
    </div>
  );
}
