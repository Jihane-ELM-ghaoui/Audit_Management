import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import api from "@/api";

interface LogEntry {
  timestamp: string;
  username: string;
  action: string;
}

export default function UserLogsTable() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get("/logs/user-actions");
        setLogs(response.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des logs", err);
      }
    };
    fetchLogs();
  }, []);

  return (
    <Card className="p-4">
      <CardContent className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gacam-green">Historique des actions utilisateur</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white bg-gacam-green-dark">Utilisateur</TableHead>
              <TableHead className="text-white bg-gacam-green-dark">Action</TableHead>
              <TableHead className="text-white bg-gacam-green-dark">Horodatage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log, index) => (
              <TableRow key={index}>
                <TableCell>{log.username}</TableCell>
                <TableCell><Badge variant="secondary">{log.action}</Badge></TableCell>
                <TableCell>{new Date(log.timestamp).toLocaleString("fr-FR")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
