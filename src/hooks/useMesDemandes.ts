import { useEffect, useState } from "react";
import api from "@/api";
import { toast } from "@/components/ui/sonner";

export function useMesDemandes() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDemandes() {
      try {
        const res = await api.get("/manager/mes-demandes");
        setDemandes(res.data);
      } catch (err) {
        toast.error("Erreur lors du chargement des demandes.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchDemandes();
  }, []);

  return { demandes, loading };
}
