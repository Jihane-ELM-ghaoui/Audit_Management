import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/sonner";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import {
  Card, CardContent
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import api from "@/api";

interface Prestataire {
  id: number | string;
  nom: string;
}

interface Auditeur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
}

interface Port {
  port: string | number;
}

interface IP {
  adresse_ip: string;
  ports: Port[];
}

interface Affectation {
  id: number;
  demande_audit_id: number;
  prestataire_id: number | string;
  auditeurs: Auditeur[];
  audit_id?: number | null;
  type_audit: string;
  ips: IP[];
  affectationpath?: string;
  etat?: string;
}

const AffectList = () => {
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [selectedPrestataire, setSelectedPrestataire] = useState<string>("");
  const [selectedAffectation, setSelectedAffectation] = useState<Affectation | null>(null);
  const [open, setOpen] = useState(false);
  const [loadingAuditId, setLoadingAuditId] = useState<number | null>(null);
  const navigate = useNavigate();



  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prestRes, response] = await Promise.all([
          api.get("/prestataire", ),
          api.get("/affectation/affects", ),
        ]);
        setPrestataires(prestRes.data);
        setAffectations(response.data);
      } catch (error) {
        console.error("Error fetching affectations:", error);
        toast("Erreur", {
          description: "Impossible de charger les affectations"
        });
      }
    };
    fetchData();
  }, []);

  const handleOpen = (affectation: Affectation) => {
    setSelectedAffectation(affectation);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedAffectation(null);
  };

  const handleCommencerAudit = async (affect: Affectation, e: React.MouseEvent) => {
  e.stopPropagation();
  setLoadingAuditId(affect.id);

  const payload = {
    demande_audit_id: affect.demande_audit_id,
    affectation_id: affect.id,
    prestataire_id: affect.prestataire_id ?? null,
    auditeur_ids: Array.isArray(affect.auditeurs)
      ? affect.auditeurs.filter(a => a && a.id).map(a => a.id)
      : []
  };

  if (payload.auditeur_ids.length === 0) {
    toast("Erreur", {
      description: "Aucun auditeur sélectionné !"
    });
    setLoadingAuditId(null);
    return;
  }

  try {
    const response = await api.post("/audit/", payload);
    const newAudit = response.data; 

    toast("Succès", {
      description: "Audit lancé avec succès !"
    });

    setAffectations(prev =>
      prev.map(a =>
        a.id === affect.id
          ? { ...a, etat: "Commencé" }
          : a
      )
    );

    setOpen(false);
  } catch (error) {
    console.error("Erreur lors de l'ajout au plan :", error);
    toast("Erreur", {
      description: "Erreur lors de l'ajout au plan."
    });
  } finally {
    setLoadingAuditId(null);
  }
};


  const getPrestataireName = (id: number | string) => {
    return prestataires.find((p) => p.id === id)?.nom || "N/A";
  };

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAffectation, setPendingAffectation] = useState<Affectation | null>(null);

  const confirmAuditStart = (affect: Affectation, e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingAffectation(affect);
    setConfirmDialogOpen(true);
  };

  const proceedAuditStart = async () => {
    if (!pendingAffectation) return;
    await handleCommencerAudit(pendingAffectation, new MouseEvent("click"));
    setConfirmDialogOpen(false);
    setPendingAffectation(null);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gacam-green mb-6">Liste des Affectations</h1>
      
      <div className="mb-6">
        <label htmlFor="prestataire-select" className="block text-sm font-medium mb-2">
          Filtrer par Prestataire
        </label>
        <Select 
          value={selectedPrestataire} 
          onValueChange={setSelectedPrestataire}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tous les Prestataires" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les Prestataires</SelectItem>
            {prestataires.map((prest) => (
              <SelectItem key={prest.id} value={String(prest.id)}>
                {prest.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gacam-green">
                <TableRow>
                  <TableHead className="text-white">Demande Audit ID</TableHead>
                  <TableHead className="text-white">Prestataire</TableHead>
                  <TableHead className="text-white">Type Audit</TableHead>
                  <TableHead className="text-white">Nombre d'Auditeurs</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affectations
                  .filter(
                    (affect) =>
                      selectedPrestataire === "" ||
                      String(affect.prestataire_id) === selectedPrestataire
                  )
                  .map((affect) => (
                    <TableRow 
                      key={affect.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleOpen(affect)}
                    >
                      <TableCell>{affect.demande_audit_id}</TableCell>
                      <TableCell>
                        {getPrestataireName(affect.prestataire_id)}
                      </TableCell>
                      <TableCell>{affect.type_audit}</TableCell>
                      <TableCell>{affect.auditeurs?.length || 0}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpen(affect);
                            }}
                          >
                            Voir Détails
                          </Button>
                          
                          {affect.etat === "Commencé" ? (
                            <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md font-medium">
                              Audit en cours
                            </span>
                          ) : (
                            <Button
                              variant="secondary"
                              disabled={loadingAuditId === affect.id}
                              onClick={(e) => confirmAuditStart(affect, e)}
                              className="bg-gacam-red-brick text-white hover:bg-gacam-red-dark"
                            >
                              {loadingAuditId === affect.id ? "En cours..." : "Commencer Audit"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                {affectations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Aucune affectation trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Détails */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gacam-green">
              Détails de l'Affectation
            </DialogTitle>
            <DialogDescription>
              Informations complètes sur l'affectation sélectionnée
            </DialogDescription>
          </DialogHeader>
          
          {selectedAffectation && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">ID:</div>
                <div className="text-sm">{selectedAffectation.id}</div>
                
                <div className="text-sm font-medium">Audit ID:</div>
                <div className="text-sm">{selectedAffectation.audit_id || "Non défini"}</div>
                
                <div className="text-sm font-medium">Prestataire:</div>
                <div className="text-sm">
                  {getPrestataireName(selectedAffectation.prestataire_id)}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-2">Auditeurs:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedAffectation.auditeurs.map((auditor) => (
                    <li key={auditor.id} className="text-sm">
                      {auditor.nom} {auditor.prenom} ({auditor.email})
                    </li>
                  ))}
                  {selectedAffectation.auditeurs.length === 0 && (
                    <li className="text-sm text-gray-500">Aucun auditeur</li>
                  )}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-2">Adresses IPs:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedAffectation.ips.map((ip, index) => (
                    <li key={index} className="text-sm">
                      {ip.adresse_ip} : {ip.ports.map((port) => port.port).join(", ")}
                    </li>
                  ))}
                  {selectedAffectation.ips.length === 0 && (
                    <li className="text-sm text-gray-500">Aucune adresse IP</li>
                  )}
                </ul>
              </div>
              
              {selectedAffectation.affectationpath && (
                <div className="mt-4">
                  <a
                    href={`http://localhost:8000/${selectedAffectation.affectationpath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gacam-green hover:text-gacam-green-dark underline flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Télécharger la fiche d'affectation
                  </a>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={handleClose}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmation</DialogTitle>
            <DialogDescription>
              Es-tu sûr de vouloir <strong>commencer l’audit</strong> pour cette affectation ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              className="bg-gacam-red-brick text-white hover:bg-gacam-red-dark"
              onClick={proceedAuditStart}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AffectList;