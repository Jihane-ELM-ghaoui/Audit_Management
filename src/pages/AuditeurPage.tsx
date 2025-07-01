import React, { useEffect, useState } from "react";
import { toast } from "@/components/ui/sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import api from "@/api";

interface Prestataire {
  id: number;
  nom: string;
}

interface Auditeur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  phone: string;
  prestataire_id: number;
}

export default function AuditeurPage() {
  const [auditeurs, setAuditeurs] = useState<Auditeur[]>([]);
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [selectedPrestataire, setSelectedPrestataire] = useState<string>("");
  const [editingAuditeur, setEditingAuditeur] = useState<Auditeur | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; auditeurId: number | null }>({
    open: false,
    auditeurId: null
  });
  const [selected, setSelected] = useState<number[]>([]);
  


  const form = useForm({
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      phone: "",
      prestataire_id: ""
    }
  });

  useEffect(() => {
    fetchAuditeurs();
    fetchPrestataires();
  }, []);

  useEffect(() => {
    if (editingAuditeur) {
      form.reset({
        nom: editingAuditeur.nom,
        prenom: editingAuditeur.prenom,
        email: editingAuditeur.email,
        phone: editingAuditeur.phone,
        prestataire_id: String(editingAuditeur.prestataire_id)
      });
    }
  }, [editingAuditeur, form]);

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

  const handleConfirmDelete = (id: number) => {
    setConfirmDialog({ open: true, auditeurId: id });
  };

  const handleDelete = async () => {
    if (!confirmDialog.auditeurId) return;
    
    try {
      await api.delete(`/affectation/auditeurs/${confirmDialog.auditeurId}`, );
      toast("Succès", {
        description: "L'auditeur a été supprimé avec succès"
      });
      fetchAuditeurs();
      setConfirmDialog({ open: false, auditeurId: null });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast("Erreur", {
        description: "Impossible de supprimer cet auditeur"
      });
    }
  };

  const handleUpdate = async (values: any) => {
    if (!editingAuditeur) return;
    
    try {
      const updatedData = {
        ...values,
        prestataire_id: parseInt(values.prestataire_id)
      };
      
      await api.put(`/affectation/auditeurs/${editingAuditeur.id}`, updatedData, );
      toast("Succès", {
        description: "L'auditeur a été mis à jour avec succès"
      });
      fetchAuditeurs();
      setEditingAuditeur(null);
    } catch (error) {
      console.error("Erreur handleUpdate:", error);
      toast("Erreur", {
        description: "Impossible de mettre à jour cet auditeur"
      });
    }
  };

  const handleToggle = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const filteredAuditeurs = selectedPrestataire
    ? auditeurs.filter((a) => String(a.prestataire_id) === selectedPrestataire)
    : auditeurs;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gacam-green mb-6">Liste des Auditeurs</h1>
      
      <div className="mb-4">
        <Select
          value={selectedPrestataire}
          onValueChange={setSelectedPrestataire}
        >
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="Tous les prestataires" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les prestataires</SelectItem>
            {prestataires.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Gestion des auditeurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gacam-green">
                <TableRow>
                  <TableHead className="text-white">ID</TableHead>
                  <TableHead className="text-white">Nom</TableHead>
                  <TableHead className="text-white">Prénom</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Téléphone</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAuditeurs.length > 0 ? (
                  filteredAuditeurs.map((auditeur) => (
                    <TableRow key={auditeur.id} className="hover:bg-gray-50">
                      <TableCell>{auditeur.id}</TableCell>
                      <TableCell>{auditeur.nom}</TableCell>
                      <TableCell>{auditeur.prenom}</TableCell>
                      <TableCell>{auditeur.email}</TableCell>
                      <TableCell>{auditeur.phone}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingAuditeur(auditeur)}
                          >
                            Modifier
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleConfirmDelete(auditeur.id)}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      Aucun auditeur trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Modification */}
      <Dialog open={!!editingAuditeur} onOpenChange={(open) => !open && setEditingAuditeur(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier un auditeur</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'auditeur et cliquez sur Enregistrer.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="prenom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="prestataire_id"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Prestataire</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un prestataire" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {prestataires.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingAuditeur(null)}>
                  Annuler
                </Button>
                <Button type="submit">Enregistrer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmation Suppression */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet auditeur ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ open: false, auditeurId: null })}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
