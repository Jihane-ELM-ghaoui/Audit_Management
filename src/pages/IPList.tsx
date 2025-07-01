import React, { useEffect, useState } from "react";
import { toast } from "@/components/ui/sonner";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
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
import api from "@/api";

interface Port {
  port: number | string;
  status?: string;
}

interface IP {
  id: number;
  adresse_ip: string;
  ports: Port[];
  status: string;
  affectation_id: number;
}

const IPList = () => {
  const [ips, setIps] = useState<IP[]>([]);
  const [search, setSearch] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; ipId: number | null }>({
    open: false,
    ipId: null
  });

  const [confirmCloseDialog, setConfirmCloseDialog] = useState<{ open: boolean; ipId: number | null }>({
  open: false,
  ipId: null,
});


  const fetchIps = async () => {
    try {
      const response = await api.get("/affectation/ips", );
      setIps(response.data);
    } catch (error) {
      console.error("Erreur de chargement des IPs", error);
      toast("Erreur", {
        description: "Impossible de charger la liste des IPs"
      });
    }
  };

  useEffect(() => {
    fetchIps();
  }, []);

  const handleCloseIp = async (ipId: number) => {
    try {
      await api.put(`affectation/ips/${ipId}/close`, );
      toast("Succès", {
        description: "L'IP a été fermée avec succès"
      });
      fetchIps(); // Rafraîchit la liste
    } catch (error) {
      console.error("Erreur lors de la fermeture de l'IP", error);
      toast("Erreur", {
        description: "Impossible de fermer cette IP"
      });
    }
  };

  const confirmCloseIp = async () => {
    if (!confirmCloseDialog.ipId) return;

    try {
      await api.put(`affectation/ips/${confirmCloseDialog.ipId}/close`);
      toast("Succès", {
        description: "L'IP a été fermée avec succès"
      });
      fetchIps();
      setConfirmCloseDialog({ open: false, ipId: null });
    } catch (error) {
      console.error("Erreur lors de la fermeture de l'IP", error);
      toast("Erreur", {
        description: "Impossible de fermer cette IP"
      });
    }
  };

  const handleConfirmDelete = (ipId: number) => {
    setConfirmDialog({ open: true, ipId });
  };

  const handleDeleteIp = async () => {
    if (!confirmDialog.ipId) return;
    
    try {
      await api.delete(`affectation/ips/${confirmDialog.ipId}`, );
      toast("Succès", {
        description: "L'IP a été supprimée avec succès"
      });
      fetchIps();
      setConfirmDialog({ open: false, ipId: null });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'IP", error);
      toast("Erreur", {
        description: "Impossible de supprimer cette IP"
      });
    }
  };

  const filteredIps = ips.filter(ip => 
    ip.adresse_ip?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gacam-green mb-6">Liste des IPs</h1>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Gestion des IPs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Rechercher une IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gacam-green">
                <TableRow>
                  <TableHead className="text-white">ID</TableHead>
                  <TableHead className="text-white">Adresse IP</TableHead>
                  <TableHead className="text-white">Port</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Affectation ID</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIps.length > 0 ? (
                  filteredIps.map((ip) => (
                    <TableRow key={ip.id} className="hover:bg-gray-50">
                      <TableCell>{ip.id}</TableCell>
                      <TableCell>{ip.adresse_ip}</TableCell>
                      <TableCell>
                        {Array.isArray(ip.ports) && ip.ports.length > 0
                          ? ip.ports.map((p) => p.port).join(", ")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          ip.status === "open" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {ip.status}
                        </span>
                      </TableCell>
                      <TableCell>{ip.affectation_id}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 flex-wrap">
                          <Button 
                            variant="secondary" 
                            size="sm"
                          >
                            Voir Audit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setConfirmCloseDialog({ open: true, ipId: ip.id })}
                          >
                            Fermer
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleConfirmDelete(ip.id)}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      Aucune IP trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette IP ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ open: false, ipId: null })}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteIp}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog
        open={confirmCloseDialog.open}
        onOpenChange={(open) => setConfirmCloseDialog({ ...confirmCloseDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la fermeture</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir fermer cette IP ? Cela mettra son statut à "fermé".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmCloseDialog({ open: false, ipId: null })}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmCloseIp}>
              Fermer l'IP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IPList;
