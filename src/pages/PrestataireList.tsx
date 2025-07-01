import React, { useEffect, useState } from "react";
import { toast } from "@/components/ui/sonner";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, FileCheck2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import api from "@/api";

interface Prestataire {
  id?: number;
  nom: string;
  numero_marche?: string;
  objet_marche?: string;
  budget_total?: number;
  date_debut?: string;
  date_fin?: string;
  realisation?: number;
  solde?: number;
  classes?: string;
  lettre_commande?: string | File;
  pv_reception?: string | File;
  budget_jour_homme?: number;
  pieces_jointes?: string[];
  new_pieces_jointes?: File[];
}

const PrestataireList = () => {
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [search, setSearch] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    data: Prestataire | null;
  }>({ open: false, mode: "create", data: null });

  const fetchPrestataires = async () => {
    try {
      const res = await api.get("/prestataire");
      setPrestataires(res.data);
    } catch (err) {
      toast("Erreur", { description: "Échec du chargement des prestataires." });
    }
  };

  useEffect(() => {
    fetchPrestataires();
  }, []);

  const handleSave = async () => {
    if (!formDialog.data) return;
    const d = formDialog.data;
    const formData = new FormData();

    formData.append("nom", d.nom);
    formData.append("numero_marche", d.numero_marche || "");
    formData.append("objet_marche", d.objet_marche || "");
    formData.append("budget_total", String(d.budget_total || ""));
    formData.append("date_debut", d.date_debut || "");
    formData.append("date_fin", d.date_fin || "");
    formData.append("realisation", String(d.realisation || ""));
    formData.append("classes", d.classes || "");
    formData.append("budget_jour_homme", String(d.budget_jour_homme || ""));

    if (d.lettre_commande instanceof File) formData.append("lettre_commande", d.lettre_commande);
    if (d.pv_reception instanceof File) formData.append("pv_reception", d.pv_reception);

    if (d.new_pieces_jointes && d.new_pieces_jointes.length > 0) {
      d.new_pieces_jointes.forEach((file) => {
        formData.append("pieces_jointes", file);
      });
    }

    try {
      if (formDialog.mode === "create") {
        await api.post("/prestataire", formData);
        toast("Succès", { description: "Prestataire ajouté." });
      } else {
        await api.put(`/prestataire/${d.id}`, formData);
        toast("Succès", { description: "Prestataire modifié." });
      }
      setFormDialog({ open: false, mode: "create", data: null });
      fetchPrestataires();
    } catch (err) {
      toast("Erreur", { description: "Échec de l'enregistrement." });
    }
  };

  const handleDelete = async () => {
    if (!confirmDialog.id) return;
    try {
      await api.delete(`/prestataire/${confirmDialog.id}`);
      toast("Succès", { description: "Prestataire supprimé." });
      fetchPrestataires();
      setConfirmDialog({ open: false, id: null });
    } catch (err) {
      toast("Erreur", { description: "Erreur lors de la suppression." });
    }
  };

  const filtered = prestataires.filter((p) =>
    p.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gacam-green mb-6">Liste des Prestataires</h1>

      <Card className="shadow-lg">
        <CardHeader className="flex justify-between">
          <Button
            onClick={() =>
              setFormDialog({
                open: true,
                mode: "create",
                data: {
                  nom: "",
                  numero_marche: "",
                  objet_marche: "",
                  budget_total: undefined,
                  date_debut: "",
                  date_fin: "",
                  realisation: undefined,
                  classes: "",
                  budget_jour_homme: undefined,
                  lettre_commande: undefined,
                  pv_reception: undefined,
                },
              })
            }
          >
            + Ajouter
          </Button>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Rechercher un prestataire..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 max-w-md"
          />

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gacam-green">
                <TableRow>
                  <TableHead className="text-white">Nom</TableHead>
                  <TableHead className="text-white">N° Marché</TableHead>
                  <TableHead className="text-white">Budget Total</TableHead>
                  <TableHead className="text-white">Durée (ans)</TableHead>
                  <TableHead className="text-white">Montant annuel</TableHead>
                  <TableHead className="text-white">Obj. Marché</TableHead>
                  <TableHead className="text-white">Budget/JH</TableHead>
                  <TableHead className="text-white">Realisation</TableHead>
                  <TableHead className="text-white">Solde</TableHead>
                  <TableHead className="text-white">Lettre Cmd</TableHead>
                  <TableHead className="text-white">PV Réception</TableHead>
                  <TableHead className="text-white">Pièces jointes</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length ? (
                  filtered.map((p) => {
                    const start = p.date_debut ? new Date(p.date_debut) : null;
                    const end = p.date_fin ? new Date(p.date_fin) : null;
                    const duration = start && end ? Math.max(1, end.getFullYear() - start.getFullYear()) : 1;
                    const montant_annuel = p.budget_total ? (p.budget_total / duration).toFixed(2) : "-";

                    return (
                      <TableRow key={p.id}>
                        <TableCell>{p.nom}</TableCell>
                        <TableCell>{p.numero_marche || "-"}</TableCell>
                        <TableCell>{p.budget_total?.toLocaleString("fr-FR") || "-"} MAD</TableCell>
                        <TableCell>{duration}</TableCell>
                        <TableCell>{montant_annuel} MAD</TableCell>
                        <TableCell>{p.objet_marche || "-"}</TableCell>
                        <TableCell>{p.budget_jour_homme || "-"} MAD</TableCell>
                        <TableCell>{p.realisation || "-"} MAD</TableCell>
                        <TableCell>{p.solde || "-"} MAD</TableCell>
                        <TableCell>
                          {typeof p.lettre_commande === "string" ? (
                            <a href={`http://localhost:8000/${p.lettre_commande}`} target="_blank" rel="noreferrer" className="underline text-blue-600">
                              Voir
                            </a>
                          ) : "-"}
                        </TableCell>
                        <TableCell>
                          {typeof p.pv_reception === "string" ? (
                            <a href={`http://localhost:8000/${p.pv_reception}`} target="_blank" rel="noreferrer" className="underline text-blue-600">
                              Voir
                            </a>
                          ) : "-"}
                        </TableCell>
                        <TableCell>
                          {p.pieces_jointes?.length ? (
                            p.pieces_jointes.map((file, idx) => (
                              <a key={idx} href={`http://localhost:8000/${file}`} target="_blank" rel="noreferrer" className="block text-sm text-blue-500 underline">
                                Fichier {idx + 1}
                              </a>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">Aucun</span>
                          )}
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button size="sm" variant="secondary" onClick={() => setFormDialog({ open: true, mode: "edit", data: p })}>Modifier</Button>
                          <Button size="sm" variant="destructive" onClick={() => setConfirmDialog({ open: true, id: p.id! })}>Supprimer</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-4">Aucun prestataire trouvé.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmation */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ open: false, id: null })}>Annuler</Button>
            <Button variant="destructive" onClick={handleDelete}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog formulaire */}
      <Dialog open={formDialog.open} onOpenChange={(open) => setFormDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formDialog.mode === "create" ? "Ajouter un prestataire" : "Modifier un prestataire"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label>Nom</Label>
              <Input
                placeholder="Nom"
                value={formDialog.data?.nom || ""}
                onChange={(e) =>
                  setFormDialog((prev) => ({
                    ...prev,
                    data: { ...prev.data!, nom: e.target.value },
                  }))
                }
              />
            </div>

            <div>
              <Label>N° Marché</Label>
              <Input
                placeholder="N° Marché"
                value={formDialog.data?.numero_marche || ""}
                onChange={(e) =>
                  setFormDialog((prev) => ({
                    ...prev,
                    data: { ...prev.data!, numero_marche: e.target.value },
                  }))
                }
              />
            </div>

            <div>
              <Label>Objet du marché</Label>
              <Input
                placeholder="Objet du marché"
                value={formDialog.data?.objet_marche || ""}
                onChange={(e) =>
                  setFormDialog((prev) => ({
                    ...prev,
                    data: { ...prev.data!, objet_marche: e.target.value },
                  }))
                }
              />
            </div>

            <div>
              <Label>Budget total</Label>
              <Input
                placeholder="Budget total"
                type="number"
                value={formDialog.data?.budget_total || ""}
                onChange={(e) =>
                  setFormDialog((prev) => ({
                    ...prev,
                    data: {
                      ...prev.data!,
                      budget_total: parseFloat(e.target.value),
                    },
                  }))
                }
              />
            </div>

            <div>
              <Label>Date de début</Label>
              <Input
                type="date"
                value={formDialog.data?.date_debut || ""}
                onChange={(e) =>
                  setFormDialog((prev) => ({
                    ...prev,
                    data: { ...prev.data!, date_debut: e.target.value },
                  }))
                }
              />
            </div>

            <div>
              <Label>Date de fin</Label>
              <Input
                type="date"
                value={formDialog.data?.date_fin || ""}
                onChange={(e) =>
                  setFormDialog((prev) => ({
                    ...prev,
                    data: { ...prev.data!, date_fin: e.target.value },
                  }))
                }
              />
            </div>

            <div>
              <Label>Réalisation</Label>
              <Input
                placeholder="Réalisation"
                type="number"
                value={formDialog.data?.realisation || ""}
                onChange={(e) =>
                  setFormDialog((prev) => ({
                    ...prev,
                    data: {
                      ...prev.data!,
                      realisation: parseFloat(e.target.value),
                    },
                  }))
                }
              />
            </div>

            <div>
              <Label>Classes</Label>
              <Input
                placeholder="Classes"
                value={formDialog.data?.classes || ""}
                onChange={(e) =>
                  setFormDialog((prev) => ({
                    ...prev,
                    data: { ...prev.data!, classes: e.target.value },
                  }))
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <Label>Lettre de commande</Label>
              <label className="cursor-pointer">
                <FileText
                  size={24}
                  className="text-gacam-red-vivid hover:opacity-80"
                />
                <Input
                  type="file"
                  className="hidden"
                  onChange={(e) =>
                    setFormDialog((prev) => ({
                      ...prev,
                      data: {
                        ...prev.data!,
                        lettre_commande: e.target.files?.[0],
                      },
                    }))
                  }
                />
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Label>PV de réception</Label>
              <label className="cursor-pointer">
                <FileCheck2
                  size={24}
                  className="text-gacam-red-vivid hover:opacity-80"
                />
                <Input
                  type="file"
                  className="hidden"
                  onChange={(e) =>
                    setFormDialog((prev) => ({
                      ...prev,
                      data: {
                        ...prev.data!,
                        pv_reception: e.target.files?.[0],
                      },
                    }))
                  }
                />
              </label>
            </div>

            <div>
              <Label>Budget / Jour-Homme</Label>
              <Input
                placeholder="Budget / Jour-Homme"
                type="number"
                value={formDialog.data?.budget_jour_homme || ""}
                onChange={(e) =>
                  setFormDialog((prev) => ({
                    ...prev,
                    data: {
                      ...prev.data!,
                      budget_jour_homme: parseFloat(e.target.value),
                    },
                  }))
                }
              />
            </div>
          </div>

          {formDialog.mode === "edit" && (
            <div>
              <Label>Ajouter pièces jointes</Label>
              <Input
                type="file"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setFormDialog((prev) => ({
                    ...prev,
                    data: {
                      ...prev.data!,
                      new_pieces_jointes: files,
                    },
                  }));
                }}
              />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setFormDialog({ open: false, mode: "create", data: null })
              }
            >
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {formDialog.mode === "create" ? "Ajouter" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrestataireList;