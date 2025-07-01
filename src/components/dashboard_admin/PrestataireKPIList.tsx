import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface PrestataireKPI {
  nom: string;
  budget_total: number;
  realisation: number;
  solde: number;
  taux_conso: number;
}

interface Props {
  prestataires: PrestataireKPI[];
}

export default function PrestataireKPIList({ prestataires }: Props) {
  const [search, setSearch] = useState("");

  const filtered = prestataires.filter((p) =>
    p.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="h-full">
      <CardContent className="p-4 space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gacam-green">Budget par Prestataire</h2>
          <Input
            placeholder="Filtrer par nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-1">
                <p className="text-md font-semibold text-gacam-red-vivid">{p.nom}</p>
                <p className="text-sm text-muted-foreground">
                  Budget total: <span className="font-medium">{p.budget_total} MAD</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Réalisation: <span className="font-medium">{p.realisation} MAD</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Solde: <span className="font-medium">{p.solde} MAD</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Taux conso: <span className="font-medium">{p.taux_conso}%</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-muted-foreground text-sm text-center pt-4">
            Aucun prestataire trouvé.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
