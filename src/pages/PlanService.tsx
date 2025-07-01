import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Download, Plus, Edit, Clock } from "lucide-react";
import api from "@/api";
import EditPlanForm from "@/components/plan/EditPlanForm";

const PlanService = () => {
  const [file, setFile] = useState(null);
  const [plans, setPlans] = useState([]);
  const [filters, setFilters] = useState({
    realisation_year: "",
    realisation_month: "",
    cloture_year: "",
    cloture_month: "",
    rapport_year: "",
    rapport_month: "",
    type_audit: "",
  });  

  const [columns, setColumns] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [audits, setAudits] = useState([]);
  const [selectedAuditId, setSelectedAuditId] = useState("");
  const [newPlan, setNewPlan] = useState({
    ref: "",
    application: "",
    type_application: "",
    type_audit: "",
    date_realisation: "",
    date_cloture: "",
    date_rapport: "",
    niveau_securite: "",
    nb_vulnerabilites: "",
    taux_remediation: "",
    commentaire_dcsg: "",
    commentaire_cp: "",
  });
  const [showNewRow, setShowNewRow] = useState(false);
  const [selectedVulns, setSelectedVulns] = useState([]);
  const [vulnDialogOpen, setVulnDialogOpen] = useState(false);


  useEffect(() => {
    fetchPlans();
    fetchAudits();
  }, []);

  const fetchPlans = async () => {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );
      const response = await api.get(`/plan/plans/`, {
        params: filteredParams,
      }, );
      setPlans(response.data);

      if (response.data.length > 0) {
        const baseKeys = [
          "ref", "application", "type_application", "type_audit", "date_realisation", "date_cloture", "date_rapport",
          "niveau_securite", "nb_vulnerabilites", "taux_remediation", "commentaire_dcsg", "commentaire_cp"
        ];
        setColumns([...baseKeys]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des plans :", error);
      toast.error("Impossible de charger les plans");
    }
  };

  const fetchAudits = async () => {
    try {
      const response = await api.get("/audit", );
      setAudits(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des audits :", error);
      toast.error("Impossible de charger les audits");
    }
  };

  useEffect(() => {
    if (columns.length > 0) {
      const initialPlan = {};
      columns.forEach(col => initialPlan[col] = "");
      setNewPlan(initialPlan);
    }
  }, [columns]);

  const handleAuditSelection = (auditId) => {
    const selectedAudit = audits.find((a) => a.id === parseInt(auditId));
    setSelectedAuditId(auditId);
    if (selectedAudit) {
      setNewPlan((prev) => ({
        ...prev,
        type_audit: selectedAudit.type_audit,
        remarques: `${selectedAudit.objectif} - ${selectedAudit.description}`
      }));
      setShowNewRow(true);
    }
  };

  const handleFileChange = (event) => setFile(event.target.files[0]);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Veuillez sélectionner un fichier avant d'uploader.");
      return;
    }
    
    const formData = new FormData();
    formData.append("file", file);
    try {
      await api.post(`/plan/upload`, formData, {
        
      });
      toast.success("Fichier uploadé avec succès !");
      fetchPlans();
    } catch (error) {
      console.error("Erreur lors de l'importation :", error);
      toast.error("Erreur lors de l'importation !");
    }
  };

  const downloadPlans = async () => {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );
  
      const response = await api.get(`/plan/plans/download/`, {
        params: filteredParams,
        responseType: "blob",
      }, );
  
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
  
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
  
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.href = url;
      link.setAttribute("download", `plans_export_${timestamp}.xlsx`);
  
      document.body.appendChild(link);
      link.click();
  
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors du téléchargement :", error);
      toast.error("Erreur lors du téléchargement des plans");
    }
  };

  const handleEditClick = (plan) => setSelectedPlan(plan);

  const handleShowVulns = (vulns) => {
    setSelectedVulns(vulns || []);
    setVulnDialogOpen(true);
  };

  const severityColors = {
    mineure: "bg-emerald-100 text-emerald-800",
    moderee: "bg-yellow-100 text-yellow-800",
    majeure: "bg-orange-100 text-orange-800",
    critique: "bg-red-100 text-red-800",
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gacam-green mb-6">Gestion des Plans</h1>
      
      <Card className="mb-6 shadow-md">
        <CardHeader>
          <CardTitle>Uploader un fichier Excel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Input 
              type="file" 
              onChange={handleFileChange} 
              className="w-full md:w-2/3"
            />
            <Button 
              onClick={handleUpload}
              variant="default"
              className="bg-gacam-green hover:bg-gacam-green-dark w-full md:w-auto"
            >
              Uploader
            </Button>
            <a 
              href="/canva_import_plan.xlsx" 
              download 
              className="text-sm text-gacam-green underline hover:text-gacam-green-dark"
            >
              Télécharger un exemple
            </a>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 shadow-md">
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Référence</label>
              <Input
                type="text"
                placeholder="Référence"
                value={filters.ref || ""}
                onChange={(e) => setFilters({ ...filters, ref: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Application/Solution</label>
              <Input
                type="text"
                placeholder="Application"
                value={filters.application || ""}
                onChange={(e) => setFilters({ ...filters, application: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type Application</label>
              <Input
                type="text"
                placeholder="Type Application"
                value={filters.type_application || ""}
                onChange={(e) => setFilters({ ...filters, type_application: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type d'audit</label>
              <Input
                type="text"
                placeholder="Type d'audit"
                value={filters.type_audit || ""}
                onChange={(e) => setFilters({ ...filters, type_audit: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Année Réalisation</label>
              <Input
                type="number"
                placeholder="Année"
                min={2000}
                max={2100}
                value={filters.realisation_year || ""}
                onChange={(e) => setFilters({ ...filters, realisation_year: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mois Réalisation</label>
              <Input
                type="number"
                placeholder="Mois"
                min={1}
                max={12}
                value={filters.realisation_month || ""}
                onChange={(e) => setFilters({ ...filters, realisation_month: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Année Clôture</label>
              <Input
                type="number"
                placeholder="Année"
                min={2000}
                max={2100}
                value={filters.cloture_year || ""}
                onChange={(e) => setFilters({ ...filters, cloture_year: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mois Clôture</label>
              <Input
                type="number"
                placeholder="Mois"
                min={1}
                max={12}
                value={filters.cloture_month || ""}
                onChange={(e) => setFilters({ ...filters, cloture_month: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Année Rapport</label>
              <Input
                type="number"
                placeholder="Année"
                min={2000}
                max={2100}
                value={filters.rapport_year || ""}
                onChange={(e) => setFilters({ ...filters, rapport_year: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mois Rapport</label>
              <Input
                type="number"
                placeholder="Mois"
                min={1}
                max={12}
                value={filters.rapport_month || ""}
                onChange={(e) => setFilters({ ...filters, rapport_month: e.target.value })}
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <Button 
              onClick={fetchPlans}
              variant="default"
              className="bg-gacam-green hover:bg-gacam-green-dark"
            >
              Appliquer les filtres
            </Button>
            <Button 
              onClick={downloadPlans}
              variant="outline"
              className="flex gap-2"
            >
              <Download className="h-4 w-4" /> Télécharger
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Liste des Plans</CardTitle>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600">Aucun plan disponible.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gacam-green">
                    {columns.map((col) => (
                      <TableHead key={col} className="text-white">
                        {col.replace(/_/g, ' ')}
                      </TableHead>
                    ))}
                    <TableHead className="text-white">Vulnérabilités</TableHead>
                    <TableHead className="text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id} className="hover:bg-gray-50">
                      {columns.map((col) => (
                        <TableCell key={col}>
                          {col === "nb_vulnerabilites"
                            ? (() => {
                                const summary = plan.nb_vulnerabilites;
                                return summary && typeof summary === 'object' ? (
                                  <div className="space-y-1">
                                    <p className="font-semibold">
                                      {summary.total} Vulnérabilité{summary.total > 1 ? "s" : ""}
                                    </p>
                                    {["mineure", "moderee", "majeure", "critique"].map((level) =>
                                      summary[level] > 0 ? (
                                        <Badge 
                                          key={level}
                                          className={severityColors[level]}
                                        >
                                          {level.charAt(0).toUpperCase() + level.slice(1)}: {summary[level]}
                                        </Badge>
                                      ) : null
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-500 italic">Aucune donnée</span>
                                );
                              })()
                            : col === "commentaire_dcsg" || col === "commentaire_cp"
                              ? <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: plan[col] || "" }} />
                              : plan[col]
                          }
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShowVulns(plan.vulnerabilites)}
                          className="flex gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> Voir
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(plan)}
                            className="flex gap-1"
                          >
                            <Edit className="h-3.5 w-3.5" /> Modifier
                          </Button>
                        </div>
                        {selectedPlan && selectedPlan.id === plan.id && (
                          <EditPlanForm
                            plan={selectedPlan}
                            open={Boolean(selectedPlan)}
                            onClose={() => setSelectedPlan(null)}
                            fetchPlans={fetchPlans}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={vulnDialogOpen} onOpenChange={setVulnDialogOpen}>
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vulnérabilités du plan</DialogTitle>
            <DialogDescription>
              Liste des vulnérabilités liées à ce plan
            </DialogDescription>
          </DialogHeader>
          
          {selectedVulns.length === 0 ? (
            <div className="py-4 text-center text-gray-600">
              Aucune vulnérabilité enregistrée.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Criticité</TableHead>
                  <TableHead>Remédiation %</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedVulns.map((vuln, index) => (
                  <TableRow key={index}>
                    <TableCell>{vuln.titre}</TableCell>
                    <TableCell>
                      <Badge className={severityColors[vuln.criticite] || "bg-gray-100 text-gray-800"}>
                        {vuln.criticite}
                      </Badge>
                    </TableCell>
                    <TableCell>{vuln.pourcentage_remediation}</TableCell>
                    <TableCell>{vuln.statut_remediation}</TableCell>
                    <TableCell>{vuln.actions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Fermer</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanService;