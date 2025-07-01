import { useMesDemandes } from "@/hooks/useMesDemandes";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  CalendarDays,
  ExternalLink,
  ClipboardList,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function DashboardProjectManager() {
  const { demandes, loading } = useMesDemandes();

  if (loading) {
    return <p className="p-6 text-muted-foreground">Chargement...</p>;
  }

  const total = demandes.length;
  const valides = demandes.filter((d) => d.etat === "Validée").length;
  const rejetes = demandes.filter((d) => d.etat === "Rejetée").length;

  return (
    <div className="p-6 space-y-8">
      {/* Title */}
      <h2 className="text-3xl font-bold text-gray-800">Tableau de bord</h2>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-300">
          <CardContent className="p-5 flex items-center gap-4">
            <ClipboardList className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total des demandes</p>
              <p className="text-xl font-bold text-blue-800">{total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-300">
          <CardContent className="p-5 flex items-center gap-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Demandes validées</p>
              <p className="text-xl font-bold text-green-800">{valides}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-300">
          <CardContent className="p-5 flex items-center gap-4">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Demandes rejetées</p>
              <p className="text-xl font-bold text-red-800">{rejetes}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des demandes */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">📋 Mes demandes d'audit</h3>
        {demandes.length === 0 ? (
          <p className="text-gray-500 italic">Aucune demande trouvée.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {demandes.map((demande) => (
              <Card
                key={demande.id}
                className="shadow-sm border rounded-xl hover:shadow-md transition"
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-bold text-gray-800">{demande.nom_app}</h4>
                    <Badge
                      variant={
                        demande.etat === "Validée"
                          ? "success"
                          : demande.etat === "Rejetée"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {demande.etat}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {demande.description || "Aucune description fournie."}
                  </p>

                  <div className="flex items-center text-sm text-gray-500 gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {new Date(demande.date_creation).toLocaleDateString()}
                  </div>

                  <a
                    href={`http://localhost:8000/${demande.fiche_demande_path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                    >
                    <FileText className="w-4 h-4" />
                    Voir la fiche PDF
                    <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
