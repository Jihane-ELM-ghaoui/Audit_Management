import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Save, X, Trash, Bold, Italic, Underline, ListOrdered, AlignCenter, AlignLeft, AlignRight, AlignJustify, Quote } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import api from "@/api";

const RichTextEditor = ({ content, onChange, placeholder = "Saisir votre commentaire..." }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "min-h-[150px] px-3 py-2 border rounded-md focus:outline-none",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor border rounded-md">
      <div className="toolbar flex flex-wrap gap-1 p-1 bg-gray-50 border-b">
        <Button 
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button 
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button 
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'bg-gray-200' : ''}
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Button 
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Button 
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button 
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button 
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button 
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200' : ''}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Button 
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-gray-200' : ''}
        >
          <Quote className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} className="prose max-w-none p-3" placeholder={placeholder} />
    </div>
  );
};

const EditPlanForm = ({ plan, open, onClose, fetchPlans }) => {
  const [formData, setFormData] = useState({
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
    vulnerabilites: [],
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        ...plan,
        vulnerabilites: plan.vulnerabilites || [],
      });
    }
  }, [plan]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCommentChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const vulnStats = {
    total: formData.vulnerabilites.length,
    critique: formData.vulnerabilites.filter(v => v.criticite === "critique").length,
    majeure: formData.vulnerabilites.filter(v => v.criticite === "majeure").length,
    moderee: formData.vulnerabilites.filter(v => v.criticite === "moderee").length,
    mineure: formData.vulnerabilites.filter(v => v.criticite === "mineure").length,
  };  

  const handleSubmit = async () => {
    try {
      const dataToSend = {
        ...formData,
        nb_vulnerabilites: vulnStats,
      };
  
      await api.put(`/plan/plans/${plan.id}`, dataToSend);
      toast.success("Plan modifié avec succès !");
      fetchPlans();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la modification :", error);
      toast.error("Erreur lors de la modification !");
    }
  };  

  const handleVulnChange = (index, field, value) => {
    const newVulns = formData.vulnerabilites.map((vuln, i) =>
      i === index ? { ...vuln, [field]: value } : vuln
    );    
    setFormData({ ...formData, vulnerabilites: newVulns });
  };

  const addVulnField = () => {
    setFormData({
      ...formData,
      vulnerabilites: [
        ...formData.vulnerabilites,
        {
          id: uuidv4(), 
          titre: "",
          criticite: "",
          pourcentage_remediation: 0,
          statut_remediation: "",
          actions: "",
        },
      ],
    });
  };

  const removeVuln = (index) => {
    const newVulns = [...formData.vulnerabilites];
    newVulns.splice(index, 1);
    setFormData({ ...formData, vulnerabilites: newVulns });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gacam-green">Modifier le Plan</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="info">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="info">Informations Générales</TabsTrigger>
            <TabsTrigger value="comments">Commentaires</TabsTrigger>
            <TabsTrigger value="vulns">Vulnérabilités ({vulnStats.total})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="application">Application</Label>
                <Input
                  id="application"
                  name="application"
                  value={formData.application || ""}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <Label htmlFor="type_application">Type Application</Label>
                <Input
                  id="type_application"
                  name="type_application"
                  value={formData.type_application || ""}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <Label htmlFor="date_realisation">Date Réalisation</Label>
                <Input
                  id="date_realisation"
                  name="date_realisation"
                  type="date"
                  value={formData.date_realisation || ""}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <Label htmlFor="date_cloture">Date Clôture</Label>
                <Input
                  id="date_cloture"
                  name="date_cloture"
                  type="date"
                  value={formData.date_cloture || ""}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <Label htmlFor="date_rapport">Date Rapport</Label>
                <Input
                  id="date_rapport"
                  name="date_rapport"
                  type="date"
                  value={formData.date_rapport || ""}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <Label htmlFor="type_audit">Type Audit</Label>
                <Select 
                  value={formData.type_audit || ""} 
                  onValueChange={(value) => handleSelectChange("type_audit", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un type d'audit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pentest">Pentest</SelectItem>
                    <SelectItem value="Architecture">Architecture</SelectItem>
                    <SelectItem value="Configuration">Configuration</SelectItem>
                    <SelectItem value="Reseau">Réseau</SelectItem>
                    <SelectItem value="Code Source">Code Source</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="niveau_securite">Niveau Sécurité</Label>
                <Select 
                  value={formData.niveau_securite || ""} 
                  onValueChange={(value) => handleSelectChange("niveau_securite", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bon">Bon</SelectItem>
                    <SelectItem value="Moyen">Moyen</SelectItem>
                    <SelectItem value="Faible">Faible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="comments" className="space-y-6">
            <div>
              <Label className="text-base font-medium">Commentaire DCSG</Label>
              <div className="mt-2">
                <RichTextEditor
                  content={formData.commentaire_dcsg || ""}
                  onChange={(value) => handleCommentChange("commentaire_dcsg", value)}
                  placeholder="Saisir le commentaire DCSG..."
                />
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-base font-medium">Commentaire CP</Label>
              <div className="mt-2">
                <RichTextEditor
                  content={formData.commentaire_cp || ""}
                  onChange={(value) => handleCommentChange("commentaire_cp", value)}
                  placeholder="Saisir le commentaire CP..."
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="vulns" className="space-y-4">
            <div className="flex justify-end">
              <Button 
                onClick={addVulnField}
                variant="outline"
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Ajouter une vulnérabilité
              </Button>
            </div>
            
            {formData.vulnerabilites.map((vuln, index) => (
              <Card key={vuln.id} className="border-l-4 border-l-gacam-green">
                <CardContent className="pt-6">
                  <div className="flex justify-between mb-4">
                    <h4 className="text-lg font-medium">Vulnérabilité #{index + 1}</h4>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeVuln(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Titre</Label>
                      <Input
                        value={vuln.titre || ""}
                        onChange={(e) => handleVulnChange(index, "titre", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label>Criticité</Label>
                      <Select 
                        value={vuln.criticite || ""} 
                        onValueChange={(value) => handleVulnChange(index, "criticite", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un niveau" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mineure">Mineure</SelectItem>
                          <SelectItem value="moderee">Modérée</SelectItem>
                          <SelectItem value="majeure">Majeure</SelectItem>
                          <SelectItem value="critique">Critique</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>% Remédiation</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={vuln.pourcentage_remediation || 0}
                        onChange={(e) => handleVulnChange(
                          index,
                          "pourcentage_remediation",
                          e.target.value ? parseFloat(e.target.value) : 0
                        )}
                      />
                    </div>
                    
                    <div>
                      <Label>Statut Remédiation</Label>
                      <Input
                        value={vuln.statut_remediation || ""}
                        onChange={(e) => handleVulnChange(index, "statut_remediation", e.target.value)}
                      />
                    </div>
                    
                    <div className="col-span-1 md:col-span-2">
                      <Label>Actions</Label>
                      <Textarea
                        value={vuln.actions || ""}
                        onChange={(e) => handleVulnChange(index, "actions", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {formData.vulnerabilites.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                <p>Aucune vulnérabilité n'a été ajoutée</p>
                <Button 
                  onClick={addVulnField}
                  variant="outline"
                  className="mt-4 flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Ajouter une vulnérabilité
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose} className="flex gap-1">
            <X className="h-4 w-4" /> Annuler
          </Button>
          <Button onClick={handleSubmit} className="bg-gacam-green hover:bg-gacam-green-dark flex gap-1">
            <Save className="h-4 w-4" /> Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPlanForm;
