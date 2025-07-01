import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Eye, 
  RefreshCw, 
  ArrowDown, 
  ArrowUp,
  PlusCircle
} from "lucide-react";
import api from "@/api";
import AddToPlanForm from "@/components/plan/AddToPlanForm";
import CommentUploader from "@/components/audit/CommentUploader";

const ListesAudit = () => {
  const [audits, setAudits] = useState([]);
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("nom_app");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
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

  const navigate = useNavigate();

  const handleChangeEtat = async (id, newEtat) => {
    try {
      await api.patch(`/audit/${id}/etat`, { new_etat: newEtat }, );
      fetchAuditDetails();
      toast.success(`État de l'audit modifié avec succès: ${newEtat}`);
    } catch (error) {
      console.error(`Erreur lors du changement d'état (${newEtat}) :`, error);
      toast.error(`Échec du changement d'état vers "${newEtat}"`);
    }
  };

  

  useEffect(() => {
    fetchAuditDetails();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAuditDetails(); // recharge tout proprement
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchAuditDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get("/audit/", );
      const auditsData = response.data.map((audit) => ({
        id: audit.id,
        total_duration: audit.total_duration,
        etat: audit.etat,
        demande_audit: {
          nom_app: audit.demande_audit?.nom_app || "",
          contacts: audit.demande_audit?.contacts || [],
          fichiers_attaches: audit.demande_audit?.fichiers_attaches || [],
          fiche_demande_path: audit.demande_audit?.fiche_demande_path || "",
        },
        prestataire: {
          nom: audit.prestataire?.nom || "",
        },
        auditeurs: audit.auditeurs?.map((a) => ({
          nom: a.nom || "",
          prenom: a.prenom || "",
          email: a.email || "",
          phone: a.phone || "",
        })) || [],
        affect: {
          affectationpath: audit.affect?.affectationpath || "",
        },
        duration: formatDuration(audit.current_duration ?? audit.total_duration, audit.etat),
      }));
      setAudits(auditsData);
    } catch (error) {
      console.error("Erreur fetchAuditDetails :", error);
      toast.error("Impossible de charger la liste des audits");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (durationInDays, etat) => {
    if (!etat) return "N/A";
    if (etat.toLowerCase() === "suspendu") return "⏸️ Suspendu";
    if (etat.toLowerCase() === "terminé") return `${Math.floor(durationInDays)} jour(s)`;
    if (etat.toLowerCase() === "en cours") return `${durationInDays.toFixed(2)} jour(s)`;
    return "N/A";
  };

  const handleOpenFicheDemande = (row) => {
    const path = row.demande_audit?.fiche_demande_path;
  
    if (!path || !path.toLowerCase().endsWith(".pdf")) {
      toast.error("Aucune fiche PDF disponible.");
      return;
    }
  
    const cleanedPath = path.replace(/\\/g, "/");
    const url = `http://localhost:8000/${cleanedPath}`;
  
    window.open(url, "_blank");
  };

  const handleRequestSort = (property) => {
  const isAsc = orderBy === property && order === "asc";
  setOrder(isAsc ? "desc" : "asc");
  setOrderBy(property);
};

  const handleChangePage = (newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (value) => {
    setRowsPerPage(parseInt(value, 10));
    setPage(0);
  };

  const sortComparator = (a, b, orderBy) => {
    const valA = a.demande_audit[orderBy]?.toLowerCase?.() || "";
    const valB = b.demande_audit[orderBy]?.toLowerCase?.() || "";
    return valA.localeCompare(valB);
  };

  const sortedAudits = [...audits]
    .filter((audit) =>
      audit.demande_audit.nom_app.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      order === "asc"
        ? sortComparator(a, b, orderBy)
        : sortComparator(b, a, orderBy)
    );

  const paginatedAudits = sortedAudits.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPages = Math.ceil(sortedAudits.length / rowsPerPage);

  const statusColors = {
    "En cours": "bg-emerald-100 text-emerald-800",
    "Suspendu": "bg-amber-100 text-amber-800",
    "Terminé": "bg-red-100 text-red-800",
  };

  const [selectedAudit, setSelectedAudit] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = (audit) => {
    const autoFilledPlan = {
      ref: "",
      application: audit.demande_audit.nom_app || "",
      type_application: [
        audit.demande_audit.type_app,
        audit.demande_audit.type_app_2,
      ]
        .filter(Boolean)
        .join(" / "),
      type_audit: audit.affect?.type_audit || "",
      date_realisation: "",
      date_cloture: "",
      date_rapport: "",
      niveau_securite: "",
      nb_vulnerabilites: "",
      taux_remediation: "",
      commentaire_dcsg: "",
      commentaire_cp: "",
    };

    setNewPlan(autoFilledPlan);
    setSelectedAudit(audit);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedAudit(null);
    setModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-gacam-green">Liste des Audits</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
          <Input
            placeholder="Rechercher une application..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72"
          />
          <Button variant="outline" size="icon" onClick={fetchAuditDetails} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading && "animate-spin"}`} />
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <Card className="rounded-2xl shadow-md border">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-gacam-green">
              <TableRow>
                <TableHead className="text-white cursor-pointer" onClick={() => handleRequestSort("nom_app")}>
                  Application
                  {orderBy === "nom_app" &&
                    (order === "asc" ? (
                      <ArrowUp className="inline h-4 w-4 ml-1" />
                    ) : (
                      <ArrowDown className="inline h-4 w-4 ml-1" />
                    ))}
                </TableHead>
                <TableHead className="text-white">Demandeur</TableHead>
                <TableHead className="text-white">Prestataire</TableHead>
                <TableHead className="text-white">Auditeur Externe</TableHead>
                <TableHead className="text-white">Durée</TableHead>
                <TableHead className="text-white">État</TableHead>
                <TableHead className="text-white">Fiche de demande</TableHead>
                <TableHead className="text-white">Actions</TableHead>
                <TableHead className="text-white">Commentaires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAudits.length > 0 ? (
                paginatedAudits.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted">
                    <TableCell className="font-medium">{row.demande_audit.nom_app}</TableCell>
                    <TableCell>
                      <div className="grid gap-2">
                        {row.demande_audit.contacts?.map((contact, i) => (
                          <div key={i} className="p-2 bg-muted/50 rounded-lg">
                            <p className="font-semibold text-sm">{contact.nom} {contact.prenom}</p>
                            <p className="text-xs text-muted-foreground">{contact.email}</p>
                            <p className="text-xs text-muted-foreground">{contact.phone}</p>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{row.prestataire.nom || "N/A"}</TableCell>
                    <TableCell>
                      <div className="grid gap-2">
                        {row.auditeurs?.length ? (
                          row.auditeurs.map((a, i) => (
                            <div key={i} className="text-sm space-y-1 border-b border-muted pb-2 last:border-0 last:pb-0">
                              <p className="font-medium">{a.nom} {a.prenom}</p>
                              <p className="text-xs text-muted-foreground">{a.email}</p>
                              <p className="text-xs text-muted-foreground">{a.phone}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">N/A</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{row.duration}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[row.etat] || "bg-gray-100 text-gray-800"} px-2 py-1 text-xs`}>
                        {row.etat}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenFicheDemande(row)}
                        className="flex gap-1 items-center w-full justify-center"
                      >
                        <Eye className="h-4 w-4" /> Voir
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        {row.etat === "En cours" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-amber-300 text-amber-700 hover:bg-amber-50"
                              onClick={() => handleChangeEtat(row.id, "Suspendu")}
                            >
                              Suspendre
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-700 hover:bg-red-50"
                              onClick={() => handleChangeEtat(row.id, "Terminé")}
                            >
                              Terminer
                            </Button>
                          </>
                        )}
                        {row.etat === "Suspendu" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-300 text-green-700 hover:bg-green-50"
                              onClick={() => handleChangeEtat(row.id, "En cours")}
                            >
                              Continuer
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-700 hover:bg-red-50"
                              onClick={() => handleChangeEtat(row.id, "Terminé")}
                            >
                              Terminer
                            </Button>
                          </>
                        )}
                        <button
                          onClick={() => handleOpenModal(row)}
                          className="px-4 py-2 bg-gacam-green text-white rounded hover:bg-green-700"
                        >
                          Ajouter au plan
                        </button>
                      </div>
                    </TableCell>
                    <TableCell> 
                      <CommentUploader auditId={row.id} refresh={fetchAuditDetails} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                    Aucun audit trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-1">
        <div className="flex items-center gap-2">
          <select
            className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground"
            value={rowsPerPage}
            onChange={(e) => handleChangeRowsPerPage(e.target.value)}
          >
            {[5, 10, 20].map((value) => (
              <option key={value} value={value}>{value} lignes</option>
            ))}
          </select>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} sur {totalPages}
          </span>
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handleChangePage(Math.max(0, page - 1))}
                className={page === 0 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {[...Array(totalPages).keys()].map((pageNumber) => (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  isActive={pageNumber === page}
                  onClick={() => handleChangePage(pageNumber)}
                >
                  {pageNumber + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => handleChangePage(Math.min(page + 1, totalPages - 1))}
                className={page === totalPages - 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        
      </div>
      {modalOpen && (
        <AddToPlanForm
          plan={selectedAudit}
          open={modalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ListesAudit;