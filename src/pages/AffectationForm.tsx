import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Table, TableBody, TableCell, TableRow 
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import api from "@/api";

interface Contact {
  nom: string;
  prenom: string;
  email: string;
  entite: string;
}

interface Audit {
  id: number;
  nom_app: string;
  contacts?: Contact[];
  description: string;
  nom_domaine?: string;
  fichiers_attaches: string[];
  fiche_demande_path?: string;
}

interface Port {
  port: string | number;
  status?: string;
}

interface IP {
  adresse_ip: string;
  ports: Port[];
}

interface Auditeur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  phone: string;
  prestataire_id: number | string;
}

interface Prestataire {
  id: number | string;
  nom: string;
}

const AffectationForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auditData = location.state?.auditData || {};

  const [auditeurToDelete, setAuditeurToDelete] = useState<Auditeur | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [auditeurs, setAuditeurs] = useState<Auditeur[]>([]);
  const [selectedPrestataire, setSelectedPrestataire] = useState<string>("");
  const [selectedAuditeurs, setSelectedAuditeurs] = useState<number[]>([]);
  const [ips, setIps] = useState<IP[]>([{ adresse_ip: "", ports: [{ port: "" }] }]);
  const [affectationFile, setAffectationFile] = useState<string | null>(null);
  const [editingAuditeur, setEditingAuditeur] = useState<Auditeur | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTypeAudit, setSelectedTypeAudit] = useState<string>("");


  // États pour ajout d'auditeur manuel
  const [manualAuditor, setManualAuditor] = useState<Omit<Auditeur, 'id'>>({ 
    nom: "", 
    prenom: "", 
    email: "", 
    phone: "", 
    prestataire_id: selectedPrestataire
  });
  
  const [manualPrestataire, setManualPrestataire] = useState<Omit<Prestataire, 'id'>>({ 
    nom: ""
  });

  // Mettre à jour `prestataire_id` lorsque `selectedPrestataire` change
  useEffect(() => {
    setManualAuditor((prev) => ({ ...prev, prestataire_id: selectedPrestataire }));
  }, [selectedPrestataire]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchPrestataires();
      await fetchAuditeurs();
    };
    fetchData();
  }, []);

  const fetchAuditeurs = async () => {
    try {
      const response = await api.get("/affectation/auditeurs/", );
      setAuditeurs(response.data);
    } catch (error) {
      console.error("Erreur fetchAuditeurs :", error);
      toast("Erreur", {
        description: "Impossible de charger la liste des auditeurs"
      });
    }
  };
  
  const fetchPrestataires = async () => {
    try {
      const response = await api.get("/prestataire/", );
      setPrestataires(response.data);
    } catch (error) {
      console.error("Erreur fetchPrestataires :", error);
      toast("Erreur", {
        description: "Impossible de charger la liste des prestataires"
      });
    }
  };

  const addIp = () => {
    setIps([...ips, { adresse_ip: "", ports: [{ port: "" }] }]);
  };

  // Ajouter un auditeur manuellement
  const handleAddAuditor = async () => {
    if (!manualAuditor.nom || !manualAuditor.prenom || !manualAuditor.email || !manualAuditor.phone) {
      toast("Erreur", {
        description: "Veuillez remplir tous les champs de l'auditeur"
      });
      return;
    }

    try {
      const response = await api.post("/affectation/auditeurs", manualAuditor, );
      setAuditeurs([...auditeurs, response.data]);
      setSelectedAuditeurs([...selectedAuditeurs, response.data.id]);
      setManualAuditor({ nom: "", prenom: "", email: "", phone: "", prestataire_id: selectedPrestataire });
      toast("Succès", {
        description: "Auditeur ajouté avec succès"
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'auditeur:", error);
      toast("Erreur", {
        description: "Une erreur est survenue lors de l'ajout de l'auditeur"
      });
    }
  };

  const handleToggle = useCallback((id: number) => {
    setSelectedAuditeurs((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }, []);

  // Confirmation suppression
  const confirmDelete = (auditeur: Auditeur) => {
    setAuditeurToDelete(auditeur);
    setDeleteDialogOpen(true);
  };

  // Suppression de l'auditeur après confirmation
  const handleDelete = async () => {
    if (!auditeurToDelete) return;
    
    try {
      await api.delete(`/affectation/auditeurs/${auditeurToDelete.id}`, );
      setAuditeurs(auditeurs.filter((a) => a.id !== auditeurToDelete.id));
      setSelectedAuditeurs(selectedAuditeurs.filter((id) => id !== auditeurToDelete.id));
      setDeleteDialogOpen(false);
      setAuditeurToDelete(null);
      toast("Succès", {
        description: "Auditeur supprimé avec succès"
      });
    } catch (err) {
      console.error("Erreur de suppression :", err);
      toast("Erreur", {
        description: "Erreur lors de la suppression de l'auditeur"
      });
    }
  };

  const handleIpChange = (index: number, field: keyof IP, value: string) => {
    const updated = [...ips];
    updated[index] = { ...updated[index], [field]: value };
    setIps(updated);
  };
  
  const handlePortChange = (ipIndex: number, portIndex: number, value: string) => {
    const updated = [...ips];
    updated[ipIndex].ports[portIndex].port = value;
    setIps(updated);
  };
  
  const addPort = (ipIndex: number) => {
    const updated = [...ips];
    updated[ipIndex].ports.push({ port: "" });
    setIps(updated);
  };
  
  const removePort = (ipIndex: number, portIndex: number) => {
    const updated = [...ips];
    if (updated[ipIndex].ports.length > 1) {
      updated[ipIndex].ports.splice(portIndex, 1);
      setIps(updated);
    }
  };

  const hasDuplicateIps = (ipsArray) => {
        const seen = new Set();
        for (let ipObj of ipsArray) {
          const ip = ipObj.adresse_ip.trim();
          if (seen.has(ip)) {
            return ip;
          }
          seen.add(ip);
        }
        return null;
      };

  const ipsFormatted = ips.map(ip => ({
    adresse_ip: ip.adresse_ip,
    ports: ip.ports.map(port => ({
      port: isNaN(parseInt(String(port.port))) ? 0 : parseInt(String(port.port)),
      status: "open",
    }))
  }));

  const handleUpdate = async (auditeur: Auditeur) => {
    try {
      const updatedData = {
        nom: auditeur.nom,
        prenom: auditeur.prenom,
        email: auditeur.email,
        phone: auditeur.phone,
        prestataire_id: auditeur.prestataire_id
      };
      
      await api.put(`/affectation/auditeurs/${auditeur.id}`, updatedData, );
      
      setAuditeurs((prev) =>
        prev.map((a) => (a.id === auditeur.id ? { ...a, ...updatedData } : a))
      );
      
      setEditDialogOpen(false);
      setEditingAuditeur(null);
      
      toast("Succès", {
        description: "Auditeur mis à jour avec succès"
      });
    } catch (error) {
      console.error("Erreur handleUpdate :", error);
      toast("Erreur", {
        description: "Erreur lors de la mise à jour de l'auditeur"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedTypeAudit) {
      toast("Erreur", {
        description: "Veuillez sélectionner un type d'audit"
      });
      return;
    }

    const duplicateIp = hasDuplicateIps(ips);
    if (duplicateIp) {
      toast("Erreur", {
        description: `L'adresse IP ${duplicateIp} est dupliquée dans le formulaire`
      });
      return;
    }

    try {
      const response = await api.get("/affectation/ips/open", );
      const existingIps = response.data;

      const conflictedIp = ips.find(ipObj =>
        existingIps.includes(ipObj.adresse_ip.trim())
      );

      if (conflictedIp) {
        toast("Erreur", {
          description: `L'adresse IP ${conflictedIp.adresse_ip} est déjà utilisée dans une affectation`
        });
        return;
      }
      
      // Validation des auditeurs sélectionnés
      if (selectedAuditeurs.length === 0) {
        toast("Erreur", {
          description: "Veuillez sélectionner au moins un auditeur"
        });
        return;
      }

      const affectationData = {
        type_audit: selectedTypeAudit,
        demande_audit_id: auditData.id,
        prestataire_id: selectedPrestataire,
        auditeurs: selectedAuditeurs.map((id) => {
          const auditor = auditeurs.find((a) => a.id === id);
          return {
            nom: auditor?.nom,
            prenom: auditor?.prenom,
            email: auditor?.email,
            phone: auditor?.phone,
            prestataire_id: auditor?.prestataire_id,
          };
        }),
        ips: ipsFormatted,
      };
      
      const response2 = await api.post("/affectation/affects", affectationData, );
      
      setAffectationFile(response2.data.affectationpath);
      
      toast("Succès", {
        description: "Affectation créée avec succès !"
      });
    } catch (error) {
      console.error("Erreur lors de l'affectation:", error);
      toast("Erreur", {
        description: "Erreur lors de l'affectation"
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gacam-green mb-6">Fiche d'Affectation</h1>

      {/* Informations de l'audit */}
      <Card className="mb-8 shadow-md">
        <CardHeader className="bg-gacam-green/10">
          <CardTitle className="text-gacam-green">Informations de l'Audit</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableBody>
                  <TableRow>
                    <TableCell colSpan={2} className="font-bold bg-gray-50">Contacts</TableCell>
                  </TableRow>
                  {auditData.contacts && auditData.contacts.length > 0 ? (
                    auditData.contacts.map((contact: Contact, index: number) => (
                      <React.Fragment key={index}>
                        <TableRow>
                          <TableCell className="font-medium">Contact {index + 1}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Nom</TableCell>
                          <TableCell>{contact.nom}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Prénom</TableCell>
                          <TableCell>{contact.prenom}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Email</TableCell>
                          <TableCell>{contact.email}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Entité</TableCell>
                          <TableCell>{contact.entite}</TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2}>Aucun contact renseigné</TableCell>
                    </TableRow>
                  )}

                <TableRow>
                  <TableCell className="font-medium">Nom de l'Application</TableCell>
                  <TableCell>{auditData.nom_app}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Description</TableCell>
                  <TableCell>{auditData.description}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Nom Domaine</TableCell>
                  <TableCell>{auditData.nom_domaine || "-"}</TableCell>
                </TableRow>

                {auditData.fichiers_attaches && auditData.fichiers_attaches.length > 0 && (
                  <TableRow>
                    <TableCell className="font-medium">Fichiers</TableCell>
                    <TableCell>
                      <ul className="list-disc pl-5 space-y-1">
                        {auditData.fichiers_attaches.map((file: string, idx: number) => (
                          <li key={idx}>
                            <a 
                              href={`http://localhost:8000/${file}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-gacam-green hover:text-gacam-green-dark underline"
                            >
                              Télécharger fichier {idx + 1}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                  </TableRow>
                )}

                {auditData.fiche_demande_path && (
                  <TableRow>
                    <TableCell className="font-medium">Voir la demande d'audit</TableCell>
                    <TableCell>
                      <a 
                        href={`http://localhost:8000/${auditData.fiche_demande_path}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gacam-green hover:text-gacam-green-dark underline flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        Télécharger
                      </a>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire d'affectation */}
      <form onSubmit={handleSubmit}>
        <Card className="mb-8 shadow-md">
          <CardHeader className="bg-gacam-green/10">
            <CardTitle className="text-gacam-green">Détails de l'affectation</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="type_audit">Type d'audit</Label>
                <Select value={selectedTypeAudit} onValueChange={setSelectedTypeAudit}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Sélectionner un type d'audit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Audit Pentest">Audit Pentest</SelectItem>
                    <SelectItem value="Audit Architecture">Audit Architecture</SelectItem>
                    <SelectItem value="Audit Configuration">Audit Configuration</SelectItem>
                    <SelectItem value="Audit Réseau">Audit Réseau</SelectItem>
                    <SelectItem value="Audit Code Source">Audit Code Source</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="prestataire">Prestataire</Label>
                <Select value={selectedPrestataire} onValueChange={setSelectedPrestataire}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Sélectionner un prestataire" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun prestataire</SelectItem>
                    {prestataires.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Liste des auditeurs */}
            <div className="mt-8">
              <h3 className="font-semibold text-lg text-gacam-green mb-4">Liste des Auditeurs</h3>
              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableBody>
                    {auditeurs
                      .filter(a => !selectedPrestataire || String(a.prestataire_id) === selectedPrestataire)
                      .map((auditeur) => (
                        <TableRow key={auditeur.id}>
                          <TableCell className="w-10">
                            <Checkbox
                              checked={selectedAuditeurs.includes(auditeur.id)}
                              onCheckedChange={() => handleToggle(auditeur.id)}
                              id={`auditeur-${auditeur.id}`}
                            />
                          </TableCell>
                          <TableCell>{auditeur.nom} {auditeur.prenom}</TableCell>
                          <TableCell>{auditeur.email}</TableCell>
                          <TableCell>{auditeur.phone}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingAuditeur(auditeur);
                                  setEditDialogOpen(true);
                                }}
                              >
                                Modifier
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                onClick={() => confirmDelete(auditeur)}
                              >
                                Supprimer
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    {(!auditeurs.length || (selectedPrestataire && !auditeurs.filter(a => String(a.prestataire_id) === selectedPrestataire).length)) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                          Aucun auditeur disponible
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            {/* Ajouter un auditeur manuellement */}
            <div className="mt-6">
              <h3 className="font-semibold text-lg text-gacam-green mb-4">Ajouter un nouvel auditeur</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="auditeur_nom">Nom</Label>
                  <Input
                    id="auditeur_nom"
                    value={manualAuditor.nom}
                    onChange={(e) => setManualAuditor({ ...manualAuditor, nom: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="auditeur_prenom">Prénom</Label>
                  <Input
                    id="auditeur_prenom"
                    value={manualAuditor.prenom}
                    onChange={(e) => setManualAuditor({ ...manualAuditor, prenom: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="auditeur_email">Email</Label>
                  <Input
                    id="auditeur_email"
                    type="email"
                    value={manualAuditor.email}
                    onChange={(e) => setManualAuditor({ ...manualAuditor, email: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="auditeur_phone">Téléphone</Label>
                  <Input
                    id="auditeur_phone"
                    value={manualAuditor.phone}
                    onChange={(e) => setManualAuditor({ ...manualAuditor, phone: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <Button 
                type="button" 
                onClick={handleAddAuditor}
                className="mt-4 bg-gacam-green text-white hover:bg-gacam-green-dark"
              >
                Ajouter l'auditeur
              </Button>
            </div>
            
            {/* Adresses IP */}
            <div className="mt-8">
              <h3 className="font-semibold text-lg text-gacam-green mb-4">Adresses IP</h3>
              <div className="space-y-4">
                {ips.map((ip, ipIndex) => (
                  <Card key={ipIndex} className="overflow-hidden">
                    <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`ip-${ipIndex}`}>Adresse IP</Label>
                        <Input
                          id={`ip-${ipIndex}`}
                          value={ip.adresse_ip}
                          onChange={(e) => handleIpChange(ipIndex, "adresse_ip", e.target.value)}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label>Ports</Label>
                        <div className="space-y-2 mt-1">
                          {ip.ports.map((port, portIndex) => (
                            <div key={portIndex} className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={port.port}
                                onChange={(e) => handlePortChange(ipIndex, portIndex, e.target.value)}
                                className="flex-grow"
                                placeholder={`Port ${portIndex + 1}`}
                                required
                              />
                              {ip.ports.length > 1 && (
                                <Button 
                                  type="button" 
                                  variant="outline"
                                  size="sm"
                                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                  onClick={() => removePort(ipIndex, portIndex)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => addPort(ipIndex)}
                            className="mt-2 text-gacam-green border-gacam-green hover:bg-gacam-green hover:text-white"
                          >
                            + Ajouter un port
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button 
                  type="button" 
                  onClick={addIp}
                  className="bg-gacam-green text-white hover:bg-gacam-green-dark w-full"
                >
                  + Ajouter une IP
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col gap-4 mt-6">
          <Button 
            type="submit" 
            className="ml-auto bg-gacam-green hover:bg-gacam-green-dark text-white"
          >
            Valider l'affectation
          </Button>
          
          {affectationFile && (
            <div className="flex justify-center mt-4">
              <a
                href={`http://localhost:8000/${affectationFile}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Voir la fiche d'affectation
              </a>
            </div>
          )}
        </div>
      </form>
      
      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmation de suppression</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment supprimer l'auditeur {auditeurToDelete?.nom} {auditeurToDelete?.prenom} ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-700 text-white"
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de modification d'auditeur */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Modifier un auditeur</DialogTitle>
          </DialogHeader>
          
          {editingAuditeur && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nom">Nom</Label>
                <Input
                  id="edit-nom"
                  value={editingAuditeur.nom}
                  onChange={(e) => setEditingAuditeur({ ...editingAuditeur, nom: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-prenom">Prénom</Label>
                <Input
                  id="edit-prenom"
                  value={editingAuditeur.prenom}
                  onChange={(e) => setEditingAuditeur({ ...editingAuditeur, prenom: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingAuditeur.email}
                  onChange={(e) => setEditingAuditeur({ ...editingAuditeur, email: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Téléphone</Label>
                <Input
                  id="edit-phone"
                  value={editingAuditeur.phone}
                  onChange={(e) => setEditingAuditeur({ ...editingAuditeur, phone: e.target.value })}
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-prestataire">Prestataire</Label>
                <Select 
                  value={String(editingAuditeur.prestataire_id)}
                  onValueChange={(value) => setEditingAuditeur({
                    ...editingAuditeur,
                    prestataire_id: parseInt(value)
                  })}
                >
                  <SelectTrigger id="edit-prestataire">
                    <SelectValue placeholder="Sélectionner un prestataire" />
                  </SelectTrigger>
                  <SelectContent>
                    {prestataires.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={() => handleUpdate(editingAuditeur!)}
              disabled={!editingAuditeur?.nom || !editingAuditeur?.prenom || !editingAuditeur?.email || !editingAuditeur?.phone}
              className="bg-gacam-green hover:bg-gacam-green-dark text-white"
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </div>
  );
};

export default AffectationForm;