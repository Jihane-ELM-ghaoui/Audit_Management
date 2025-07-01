import React, { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircle, Paperclip, Send } from "lucide-react";
import { toast } from "sonner";
import api from "@/api";

const CommentUploader = ({ auditId, refresh }) => {
  const [commentaire, setCommentaire] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [commentaires, setCommentaires] = useState([]);
  const [fichiers, setFichiers] = useState([]);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [showFileInput, setShowFileInput] = useState(false);

  const fetchCommentaires = async () => {
    try {
        const res = await api.get(`/audit/${auditId}/commentaires`);
        setCommentaires(res.data);
    } catch (err) {
        console.error("Erreur fetch commentaires:", err);
    }
    };

    const fetchFichiers = async () => {
    try {
        const res = await api.get(`/audit/${auditId}/pieces-jointes`);
        setFichiers(res.data);
    } catch (err) {
        console.error("Erreur fetch fichiers:", err);
    }
    };


  useEffect(() => {
    fetchCommentaires();
    fetchFichiers();
  }, [auditId]);

  const handleAddComment = async () => {
    if (!commentaire) return toast.error("Commentaire vide");
    try {
      setLoading(true);
      await api.post(`/audit/${auditId}/commentaires`, {
        contenu: commentaire,
      });
      setCommentaire("");
      toast.success("Commentaire ajouté");
      fetchCommentaires();
      refresh?.();
    } catch (err) {
      toast.error("Erreur commentaire");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFile = async () => {
    if (!file) return toast.error("Aucun fichier sélectionné");
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post(`/audit/${auditId}/pieces-jointes`, formData);
      setFile(null);
      toast.success("Fichier attaché");
      fetchFichiers();
      refresh?.();
    } catch (err) {
      toast.error("Erreur upload fichier");
    }
  };

  return (
      <div className="space-y-4">
        {/* Affichage commentaires */}
        <div className="space-y-1">
        <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm text-muted-foreground">Commentaires</h4>
            <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowCommentForm(!showCommentForm)}
            >
            <MessageCircle className="w-4 h-4" />
            </Button>
        </div>
        {showCommentForm && (
            <div className="space-y-2">
            <Textarea
                placeholder="Écrire un commentaire..."
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
            />
            <Button
                size="sm"
                onClick={handleAddComment}
                disabled={loading || !commentaire}
            >
                <Send className="w-4 h-4 mr-1" /> Envoyer
            </Button>
            </div>
        )}
        <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
            {commentaires.length > 0 ? (
            commentaires.map((c) => (
                <div key={c.id} className="p-2 border rounded-md bg-muted text-sm">
                <div className="font-medium">{c.auteur}</div>
                <div>{c.contenu}</div>
                <div className="text-xs text-muted-foreground">
                    Ajouté le {new Date(c.timestamp).toLocaleString()}
                </div>
                </div>
            ))
            ) : (
            <p className="text-sm text-muted-foreground">Aucun commentaire</p>
            )}
        </div>
        </div>

        {/* Affichage fichiers */}
        <div className="space-y-1">
        <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm text-muted-foreground">Fichiers</h4>
            <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFileInput(!showFileInput)}
            >
            <Paperclip className="w-4 h-4" />
            </Button>
        </div>
        {showFileInput && (
            <div className="flex gap-2 items-center">
            <Input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full" />
            <Button size="sm" onClick={handleUploadFile} disabled={!file || loading}>
                <Paperclip className="w-4 h-4" />
            </Button>
            </div>
        )}
        <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
            {fichiers.length > 0 ? (
            fichiers.map((f,c) => (
                <div key={f.id} className="p-2 border rounded-md bg-muted text-sm">
                <div className="font-medium">{f.auteur}</div>
                <a
                    href={`http://localhost:8000/${f.filepath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                >
                    📎 {f.filename}
                </a>
                <div className="text-xs text-muted-foreground">
                    Ajouté le {new Date(f.upload_date).toLocaleString()}
                </div>
                </div>
            ))
            ) : (
            <p className="text-sm text-muted-foreground">Aucun fichier joint</p>
            )}
        </div>
        </div>
    </div>
    );
};

export default CommentUploader;
