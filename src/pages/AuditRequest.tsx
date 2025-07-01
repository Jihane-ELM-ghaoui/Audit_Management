import React, { useState } from "react";
import { toast } from "@/components/ui/sonner";
import { motion } from "framer-motion";
import { Check, ChevronRight, Upload, ArrowLeft, ArrowRight, X, Trash2, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/api";

const AuditRequest = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [architectureFile, setArchitectureFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    contacts: [
      {
        nom: "",
        prenom: "",
        email: "",
        phone: "",
        entite: ""
      }
    ],
    nom_app: "",
    description: "",
    liste_fonctionalites: "",
    type_app: [] as string[],
    type_app_2: [] as string[],
    architecture_projet: false,
    commentaires_archi: "",
    protection_waf: false,
    commentaires_waf: "",
    ports: false,
    liste_ports: "",
    cert_ssl_domain_name: false,
    commentaires_cert_ssl_domain_name: "",
    logs_siem: false,
    commentaires_logs_siem: "",
    sys_exploitation: "",
    logiciels_installes: "",
    env_tests: [] as string[],
    donnees_prod: false,
    liste_si_actifs: "",
    compte_admin: "",
    nom_domaine: "",
    url_app: "",
    existance_swagger: false,
    commentaires_existance_swagger: "",
    comptes_test: [{ identifiant: "", mot_de_passe: "" }],
    code_source: "",
    date_previsionnelle: "",
    fichiers_attaches: [] as File[],
    fichiers_attaches_urls: [] as string[],
    architecture_file_url: "",
  });

  const [loading, setLoading] = useState(false);

  const steps = [
    {
      id: 'identification',
      name: 'Identification',
      description: 'Identification du demandeur',
    },
    {
      id: 'application',
      name: 'Application',
      description: 'Application ou Solution à tester',
    },
    {
      id: 'exigences',
      name: 'Exigences',
      description: 'Exigences techniques',
    },
    {
      id: 'prerequis',
      name: 'Prérequis',
      description: 'Prérequis techniques',
    },
    {
      id: 'pieces-jointes',
      name: 'Pièces jointes',
      description: 'Pièces jointes et soumission',
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleMultiSelectChange = (name: string, value: string[]) => {
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData((prevState) => ({
        ...prevState,
        fichiers_attaches: Array.from(e.target.files as FileList)
      }));
    }
  };

  const addCompteTest = () => {
    setFormData((prev) => ({
      ...prev,
      comptes_test: [...prev.comptes_test, { identifiant: '', mot_de_passe: '' }]
    }));
  };

  const removeCompteTest = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      comptes_test: prev.comptes_test.filter((_, i) => i !== index)
    }));
  };

  const handleCompteTestChange = (index: number, field: string, value: string) => {
    const updated = [...formData.comptes_test];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, comptes_test: updated }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = new FormData();

      // Champs spéciaux à sérialiser
      dataToSend.append("contacts", JSON.stringify(formData.contacts || []));
      dataToSend.append("comptes_test", JSON.stringify(formData.comptes_test || []));
      if (formData.architecture_file_url) {
        dataToSend.append("architecture_file_url", formData.architecture_file_url);
      }
      if (formData.fichiers_attaches_urls?.length) {
        dataToSend.append("fichiers_attaches_urls", JSON.stringify(formData.fichiers_attaches_urls));
      }

      // Fichiers attachés
      if (formData.fichiers_attaches?.length) {
        formData.fichiers_attaches.forEach((file: File) => {
          dataToSend.append("fichiers_attaches", file);
        });
      }

      // Fichier architecture
      if (architectureFile) {
        dataToSend.append("architecture_file", architectureFile);
      }

      // Autres champs
      for (const [key, value] of Object.entries(formData)) {
        if (
          ["contacts", "comptes_test", "fichiers_attaches", "fichiers_attaches_urls", "architecture_file_url"].includes(key)
        ) {
          continue; // déjà ajoutés
        }
        if (Array.isArray(value)) {
          dataToSend.append(key, value.join(","));
        } else {
          dataToSend.append(key, String(value));
        }
      }

      await api.post("/audits/request", dataToSend);

      toast("Demande envoyée avec succès !");
    } catch (error) {
      console.error("Error sending data:", error);
      toast("Erreur lors de l'envoi de la demande.", {
        description: "Veuillez réessayer plus tard",
      });
    }

    setLoading(false);
  };


  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gacam-green mb-2">
            Formulaire de Demande d'Audit
          </h1>
          <p className="text-muted-foreground">
            Veuillez remplir ce formulaire pour soumettre votre demande d'audit.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-10">
          <div className="relative">
            <div className="overflow-hidden h-2 mb-6 text-xs flex rounded bg-gray-100">
              <div
                style={{ width: `${(currentStep + 1) * (100 / steps.length)}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gacam-green transition-all duration-500"
              ></div>
            </div>
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`rounded-full w-10 h-10 flex items-center justify-center border-2 
                    ${index <= currentStep ? 'border-gacam-green bg-gacam-green text-white' : 'border-gray-300 bg-white text-gray-500'} 
                    transition-all duration-300 ease-in-out`}
                  >
                    {index < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${index <= currentStep ? 'text-gacam-green' : 'text-gray-500'}`}>
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Identification du demandeur */}
          {currentStep === 0 && (
           <StepIdentification 
              formData={{ contacts: formData.contacts }} 
              setFormData={(updatedForm) => setFormData(prev => ({ ...prev, ...updatedForm }))}
            />

          )}

          {/* Step 2: Application ou Solution à tester */}
          {currentStep === 1 && (
            <StepApplication 
              formData={formData} 
              handleChange={handleChange} 
              handleMultiSelectChange={handleMultiSelectChange} 
            />
          )}

          {/* Step 3: Exigences techniques */}
          {currentStep === 2 && (
            <StepExigences 
              formData={formData} 
              handleChange={handleChange} 
              setArchitectureFile={setArchitectureFile}
            />
          )}

          {/* Step 4: Prérequis techniques */}
          {currentStep === 3 && (
            <StepPrerequis
              formData={formData}
              handleChange={handleChange}
              handleMultiSelectChange={handleMultiSelectChange}
              addCompteTest={addCompteTest}
              removeCompteTest={removeCompteTest}
              handleCompteTestChange={handleCompteTestChange}
            />
          )}

          {/* Step 5: Pièces jointes */}
          {currentStep === 4 && (
            <StepPiecesJointes 
              formData={formData} 
              setFormData={setFormData}
              handleFileChange={handleFileChange} 
              loading={loading}
            />
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0 || loading}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Précédent
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 bg-gacam-green hover:bg-gacam-green-dark"
              >
                Suivant
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-gacam-green hover:bg-gacam-green-dark"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-gacam-green-dark rounded-full mr-2"></div>
                    En cours d'envoi...
                  </>
                ) : (
                  <>
                    Envoyer la demande
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

type Contact = {
  nom: string;
  prenom: string;
  email: string;
  phone: string;
  entite: string;
};

type Props = {
  formData: {
    contacts: Contact[];
  };
  setFormData: (data: any) => void;
};

const StepIdentification = ({ formData, setFormData }: Props) => {
  const handleContactChange = (index: number, field: keyof Contact, value: string) => {
    const updatedContacts = [...formData.contacts];
    updatedContacts[index][field] = value;
    setFormData({ ...formData, contacts: updatedContacts });
  };

  const addContact = () => {
    setFormData({
      ...formData,
      contacts: [...formData.contacts, { nom: "", prenom: "", email: "", phone: "", entite: "" }],
    });
  };

  const removeContact = (index: number) => {
    if (formData.contacts.length > 1) {
      const updatedContacts = formData.contacts.filter((_, i) => i !== index);
      setFormData({ ...formData, contacts: updatedContacts });
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="border-b border-gacam-green/10">
            <CardTitle className="text-xl text-gacam-green">1. Identification du demandeur</CardTitle>
            <CardDescription>
              Informations de contact du demandeur principal et des éventuels contacts secondaires
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            {formData.contacts.map((contact, index) => (
              <div key={index} className="border rounded-md p-4 shadow-sm relative space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gacam-green">
                    Contact {index === 0 ? "Principal" : `Secondaire ${index}`}
                  </h3>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeContact(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["nom", "prenom", "email", "phone", "entite"].map((field) => (
                    <div key={field} className="space-y-2">
                      <Label htmlFor={`contact-${index}-${field}`}>
                        {field.charAt(0).toUpperCase() + field.slice(1)}{" "}
                        {index === 0 && <span className="text-gacam-red-vivid">*</span>}
                      </Label>
                      <Input
                        id={`contact-${index}-${field}`}
                        name={`contacts[${index}].${field}`}
                        type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                        value={contact[field as keyof Contact]}
                        onChange={(e) => handleContactChange(index, field as keyof Contact, e.target.value)}
                        required={index === 0}
                        className="border-gacam-green/20 focus:border-gacam-green focus-visible:ring-gacam-green/30"
                        placeholder={`${field.charAt(0).toUpperCase() + field.slice(1)}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-4">
              <Button type="button" variant="outline" onClick={addContact} className="text-gacam-green">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un contact secondaire
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const StepApplication = ({ 
  formData, 
  handleChange, 
  handleMultiSelectChange 
}: { 
  formData: any, 
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void,
  handleMultiSelectChange: (name: string, value: string[]) => void
}) => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="border-b border-gacam-green/10">
            <CardTitle className="text-xl text-gacam-green">2. Application ou Solution à tester</CardTitle>
            <CardDescription>
              Détails concernant l'application à auditer
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {[
                { 
                  name: "nom_app", 
                  label: "Nom de l'application", 
                  placeholder: "Saisissez le nom de l'application",
                  required: true,
                  rows: 1
                },
                { 
                  name: "description", 
                  label: "Description", 
                  placeholder: "Décrivez l'application et son objectif",
                  required: true,
                  rows: 3 
                },
                { 
                  name: "liste_fonctionalites", 
                  label: "Liste des fonctionnalités", 
                  placeholder: "Listez les principales fonctionnalités de l'application",
                  required: true,
                  rows: 3 
                }
              ].map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.label} {field.required && <span className="text-gacam-red-vivid">*</span>}
                  </Label>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    rows={field.rows}
                    value={formData[field.name as keyof typeof formData] as string}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="border-gacam-green/20 focus:border-gacam-green focus-visible:ring-gacam-green/30"
                  />
                </div>
              ))}

              <div className="space-y-2 pt-2">
                <Label htmlFor="type_app">
                  Type d'application <span className="text-gacam-red-vivid">*</span>
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {['Web', 'Mobile', 'Client Lourd'].map((option) => (
                    <Label
                      key={option}
                      className={`flex items-center justify-center p-3 border rounded-md cursor-pointer transition-all ${
                        formData.type_app.includes(option)
                          ? 'bg-gacam-green text-white'
                          : 'bg-transparent text-foreground hover:bg-muted'
                      }`}
                      onClick={() => {
                        const newTypeApp = formData.type_app.includes(option)
                          ? formData.type_app.filter((val: string) => val !== option)
                          : [...formData.type_app, option];
                        handleMultiSelectChange("type_app", newTypeApp);
                      }}
                    >
                      {option}
                      {formData.type_app === option && (
                        <Check className="ml-2 h-4 w-4" />
                      )}
                    </Label>
                  ))}
                </div>
              </div>

              {formData.type_app !== '' && (
                <div className="space-y-2 pt-2 animate-fade-in">
                  <Label htmlFor="type_app_2">Contexte d'accès</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Externe', 'Interne'].map((option) => (
                      <Label
                        key={option}
                        className={`flex items-center justify-center p-3 border rounded-md cursor-pointer transition-all ${
                          formData.type_app_2.includes(option)
                            ? 'bg-gacam-green text-white'
                            : 'bg-transparent text-foreground hover:bg-muted'
                        }`}
                        onClick={() => {
                          const newTypeApp2 = formData.type_app_2.includes(option)
                            ? formData.type_app_2.filter((type: string) => type !== option)
                            : [...formData.type_app_2, option];
                          handleMultiSelectChange('type_app_2', newTypeApp2);
                        }}
                      >
                        {option}
                        {formData.type_app_2.includes(option) && (
                          <Check className="ml-2 h-4 w-4" />
                        )}
                      </Label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const StepExigences = ({ 
  formData, 
  handleChange,
  setArchitectureFile 
}: { 
  formData: any, 
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void,
  setArchitectureFile: (file: File) => void
}) => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="border-b border-gacam-green/10">
            <CardTitle className="text-xl text-gacam-green">3. Exigences techniques</CardTitle>
            <CardDescription>
              Informations sur l'architecture et la sécurité
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-8">
              {/* Architecture du projet */}
              <div className="p-4 border border-gacam-green/10 rounded-lg bg-muted/30">
                <h3 className="text-lg font-medium mb-3 text-gacam-green">Architecture du projet</h3>
                <div className="space-y-3">
                  {/* Checkbox oui */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="architecture_projet"
                      name="architecture_projet"
                      checked={formData.architecture_projet}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-gacam-green focus:ring-gacam-green"
                    />
                    <Label htmlFor="architecture_projet">Existe (Fournir une version à jour)</Label>
                  </div>

                  {/* Checkbox non */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="architecture_projet_no"
                      checked={!formData.architecture_projet}
                      onChange={() =>
                        handleChange({
                          target: { name: "architecture_projet", type: "checkbox", checked: false },
                        } as React.ChangeEvent<HTMLInputElement>)
                      }
                      className="h-4 w-4 rounded border-gray-300 text-gacam-green focus:ring-gacam-green"
                    />
                    <Label htmlFor="architecture_projet_no">Inexistante</Label>
                  </div>

                  {/* Commentaire */}
                  <div className="pt-2">
                    <Label htmlFor="commentaires_archi">Commentaires</Label>
                    <Textarea
                      id="commentaires_archi"
                      name="commentaires_archi"
                      value={formData.commentaires_archi}
                      onChange={handleChange}
                      placeholder="Commentaires sur l'architecture du projet"
                      className="mt-1 border-gacam-green/20 focus:border-gacam-green focus-visible:ring-gacam-green/30"
                    />
                  </div>

                  {/* Upload fichier d'architecture */}
                  {formData.architecture_projet && (
                    <div className="pt-2">
                      <Label htmlFor="architecture_file">Pièce jointe (architecture)</Label>
                      <input
                        type="file"
                        id="architecture_file"
                        name="architecture_file"
                        accept=".pdf,.png,.jpg,.jpeg" // ajustez selon ce que vous acceptez
                        onChange={(e) => setArchitectureFile(e.target.files?.[0] || null)}
                        className="mt-1 block w-full text-sm text-gray-900 bg-white rounded border border-gray-300 cursor-pointer focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Ajout URL fichier d'architecture */}
                  {formData.architecture_projet && (
                    <>
                      <div className="pt-2">
                        <Label htmlFor="architecture_file_url">Ou insérer un lien (URL) vers le fichier d’architecture</Label>
                        <Input
                          id="architecture_file_url"
                          name="architecture_file_url"
                          type="url"
                          placeholder="https://exemple.com/architecture.pdf"
                          value={formData.architecture_file_url}
                          onChange={handleChange}
                          className="mt-1 border-gacam-green/20 focus:border-gacam-green focus-visible:ring-gacam-green/30"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Protection WAF */}
              <div className="p-4 border border-gacam-green/10 rounded-lg bg-muted/30">
                <h3 className="text-lg font-medium mb-3 text-gacam-green">Protection via un Web Application Firewall (WAF)</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="protection_waf"
                      name="protection_waf"
                      checked={formData.protection_waf}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-gacam-green focus:ring-gacam-green"
                    />
                    <Label htmlFor="protection_waf">Oui</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="protection_waf_no"
                      checked={!formData.protection_waf}
                      onChange={() => handleChange({
                        target: { name: "protection_waf", type: "checkbox", checked: false }
                      } as React.ChangeEvent<HTMLInputElement>)}
                      className="h-4 w-4 rounded border-gray-300 text-gacam-green focus:ring-gacam-green"
                    />
                    <Label htmlFor="protection_waf_no">Non</Label>
                  </div>
                  <div className="pt-2">
                    <Label htmlFor="commentaires_waf">Commentaires</Label>
                    <Textarea
                      id="commentaires_waf"
                      name="commentaires_waf"
                      value={formData.commentaires_waf}
                      onChange={handleChange}
                      placeholder="Commentaires sur la protection WAF"
                      className="mt-1 border-gacam-green/20 focus:border-gacam-green focus-visible:ring-gacam-green/30"
                    />
                  </div>
                </div>
              </div>

              {/* Ports & services */}
              <div className="p-4 border border-gacam-green/10 rounded-lg bg-muted/30">
                <h3 className="text-lg font-medium mb-3 text-gacam-green">Les ports & services sont-ils sécurisés ?</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="ports"
                      name="ports"
                      checked={formData.ports}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-gacam-green focus:ring-gacam-green"
                    />
                    <Label htmlFor="ports">Oui</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="ports_no"
                      checked={!formData.ports}
                      onChange={() => handleChange({
                        target: { name: "ports", type: "checkbox", checked: false }
                      } as React.ChangeEvent<HTMLInputElement>)}
                      className="h-4 w-4 rounded border-gray-300 text-gacam-green focus:ring-gacam-green"
                    />
                    <Label htmlFor="ports_no">Non</Label>
                  </div>
                  <div className="pt-2">
                    <Label htmlFor="liste_ports">Liste des ports</Label>
                    <Input
                      id="liste_ports"
                      name="liste_ports"
                      value={formData.liste_ports}
                      onChange={handleChange}
                      placeholder="80, 443, etc."
                      className="mt-1 border-gacam-green/20 focus:border-gacam-green focus-visible:ring-gacam-green/30"
                    />
                  </div>
                </div>
              </div>

              {/* Certificat SSL */}
              <div className="p-4 border border-gacam-green/10 rounded-lg bg-muted/30">
                <h3 className="text-lg font-medium mb-3 text-gacam-green">Certificat SSL & Nom de domaine</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="cert_ssl_domain_name"
                      name="cert_ssl_domain_name"
                      checked={formData.cert_ssl_domain_name}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-gacam-green focus:ring-gacam-green"
                    />
                    <Label htmlFor="cert_ssl_domain_name">Oui</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="cert_ssl_domain_name_no"
                      checked={!formData.cert_ssl_domain_name}
                      onChange={() => handleChange({
                        target: { name: "cert_ssl_domain_name", type: "checkbox", checked: false }
                      } as React.ChangeEvent<HTMLInputElement>)}
                      className="h-4 w-4 rounded border-gray-300 text-gacam-green focus:ring-gacam-green"
                    />
                    <Label htmlFor="cert_ssl_domain_name_no">Non</Label>
                  </div>
                  <div className="pt-2">
                    <Label htmlFor="commentaires_cert_ssl_domain_name">Commentaires</Label>
                    <Textarea
                      id="commentaires_cert_ssl_domain_name"
                      name="commentaires_cert_ssl_domain_name"
                      value={formData.commentaires_cert_ssl_domain_name}
                      onChange={handleChange}
                      placeholder="Commentaires sur le certificat SSL et le nom de domaine"
                      className="mt-1 border-gacam-green/20 focus:border-gacam-green focus-visible:ring-gacam-green/30"
                    />
                  </div>
                </div>
              </div>

              {/* Logs lies au SIEM */}
              <div className="p-4 border border-gacam-green/10 rounded-lg bg-muted/30">
                <h3 className="text-lg font-medium mb-3 text-gacam-green">Est-ce que les logs sont lies au SIEM ?</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="logs_siem"
                      name="logs_siem"
                      checked={formData.logs_siem}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-gacam-green focus:ring-gacam-green"
                    />
                    <Label htmlFor="logs_siem">Oui</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="logs_siem_no"
                      checked={!formData.logs_siem}
                      onChange={() => handleChange({
                        target: { name: "logs_siem", type: "checkbox", checked: false }
                      } as React.ChangeEvent<HTMLInputElement>)}
                      className="h-4 w-4 rounded border-gray-300 text-gacam-green focus:ring-gacam-green"
                    />
                    <Label htmlFor="logs_siem_no">Non</Label>
                  </div>
                  <div className="pt-2">
                    <Label htmlFor="commentaires_logs_siem">Commentaires</Label>
                    <Textarea
                      id="commentaires_logs_siem"
                      name="commentaires_logs_siem"
                      value={formData.commentaires_logs_siem}
                      onChange={handleChange}
                      placeholder="Commentaires sur la liaison des logs avec SIEM"
                      className="mt-1 border-gacam-green/20 focus:border-gacam-green focus-visible:ring-gacam-green/30"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const StepPrerequis = ({ 
  formData, 
  handleChange, 
  handleMultiSelectChange,
  addCompteTest,
  removeCompteTest, 
  handleCompteTestChange,
}: { 
  formData: any, 
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void,
  handleMultiSelectChange: (name: string, value: string[]) => void,
  addCompteTest: () => void;
  removeCompteTest: (index: number) => void;
  handleCompteTestChange: (index: number, field: string, value: string) => void;
}) => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="border-b border-gacam-green/10">
            <CardTitle className="text-xl text-gacam-green">4. Prérequis techniques</CardTitle>
            <CardDescription>
              Informations techniques nécessaires pour l'audit
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {[
                { name: "sys_exploitation", label: "Système d'exploitation", required: true },
                { name: "logiciels_installes", label: "Logiciels installés", required: true },
                { name: "liste_si_actifs", label: "Liste des actifs", required: true },
                { name: "compte_admin", label: "Compte Admin", required: true },
                { name: "nom_domaine", label: "Nom de domaine", required: true },
                { name: "url_app", label: "URL de l'application", required: true },
                { name: "code_source", label: "Lien vers le code source", required: true }
              ].map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.label} {field.required && <span className="text-gacam-red-vivid">*</span>}
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    value={formData[field.name as keyof typeof formData] as string}
                    onChange={handleChange}
                    required={field.required}
                    placeholder={`Saisissez ${field.label.toLowerCase()}`}
                    className="border-gacam-green/20 focus:border-gacam-green focus-visible:ring-gacam-green/30"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 border border-gacam-green/10 rounded-lg bg-muted/30">
                <h3 className="text-lg font-medium mb-3 text-gacam-green">Existance de Swagger</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="existance_swagger"
                      name="existance_swagger"
                      checked={formData.existance_swagger}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-gacam-green focus:ring-gacam-green"
                    />
                    <Label htmlFor="existance_swagger">Oui</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="existance_swagger_no"
                      checked={!formData.existance_swagger}
                      onChange={() => handleChange({
                        target: { name: "existance_swagger", type: "checkbox", checked: false }
                      } as React.ChangeEvent<HTMLInputElement>)}
                      className="h-4 w-4 rounded border-gray-300 text-gacam-green focus:ring-gacam-green"
                    />
                    <Label htmlFor="existance_swagger_no">Non</Label>
                  </div>
                  <div className="pt-2">
                    <Label htmlFor="commentaires_existance_swagger">Commentaires</Label>
                    <Textarea
                      id="commentaires_existance_swagger"
                      name="commentaires_existance_swagger"
                      value={formData.commentaires_existance_swagger}
                      onChange={handleChange}
                      placeholder="Commentaires sur l'existance de Swagger"
                      className="mt-1 border-gacam-green/20 focus:border-gacam-green focus-visible:ring-gacam-green/30"
                    />
                  </div>
                </div>
              </div>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="env_tests">
                  Environnement de test <span className="text-gacam-red-vivid">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Développement', 'Recette/UAT', 'Pré-production', 'Production'].map((option) => (
                    <Label
                      key={option}
                      className={`flex items-center justify-center p-3 border rounded-md cursor-pointer transition-all ${
                        formData.env_tests.includes(option)
                          ? 'bg-gacam-green text-white'
                          : 'bg-transparent text-foreground hover:bg-muted'
                      }`}
                      onClick={() => {
                        const newEnvTests = formData.env_tests.includes(option)
                          ? formData.env_tests.filter((env: string) => env !== option)
                          : [...formData.env_tests, option];
                        handleMultiSelectChange('env_tests', newEnvTests);
                      }}
                    >
                      {option}
                      {formData.env_tests.includes(option) && (
                        <Check className="ml-2 h-4 w-4" />
                      )}
                    </Label>
                  ))}
                </div>
              </div>

              <div className="flex items-start space-x-2 pt-4">
                <input
                  type="checkbox"
                  id="donnees_prod"
                  name="donnees_prod"
                  checked={formData.donnees_prod}
                  onChange={handleChange}
                  className="h-4 w-4 mt-1 rounded border-gray-300 text-gacam-green focus:ring-gacam-green"
                />
                <Label htmlFor="donnees_prod" className="leading-tight">
                  L'environnement de test contient des données de production
                </Label>
              </div>
            </div>

            <div className="mt-6 p-4 border border-gacam-green/10 rounded-lg bg-muted/30">
              <h3 className="text-lg font-medium mb-3 text-gacam-green">
                Date prévisionnelle de mise en production
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="space-y-1">
                  <Label htmlFor="date_previsionnelle" className="text-sm font-medium text-foreground">
                    Sélectionnez une date
                  </Label>
                  <input
                    type="date"
                    id="date_previsionnelle"
                    name="date_previsionnelle"
                    value={formData.date_previsionnelle}
                    onChange={handleChange}
                    className="border border-gacam-green/20 rounded-md px-3 py-2 text-sm text-foreground bg-background focus:border-gacam-green focus:ring-gacam-green/30"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Cette date permet de planifier au mieux les actions de sécurité.
                </div>
              </div>
            </div>    
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-medium text-gacam-green">Comptes de test</h3>
              {formData.comptes_test.map((compte, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-muted/30 p-4 rounded-lg border border-gacam-green/10">
                  <div>
                    <Label htmlFor={`login-${index}`}>Identifiant</Label>
                      <Input
                        name="identifiant"
                        value={compte.identifiant}
                        onChange={(e) => handleCompteTestChange(index, 'identifiant', e.target.value)}
                      />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-grow">
                      <Label htmlFor={`mot_de_passe-${index}`}>Mot de passe</Label>
                      <Input
                        id={`mot_de_passe-${index}`}
                        name="mot_de_passe"
                        type="password"
                        value={compte.mot_de_passe}
                        onChange={(e) => handleCompteTestChange(index, 'mot_de_passe', e.target.value)}
                        placeholder="Mot de passe"
                        className="border-gacam-green/20 focus:border-gacam-green focus-visible:ring-gacam-green/30"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCompteTest(index)}
                      className="text-sm text-red-600 hover:underline mt-6"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addCompteTest}
                className="px-4 py-2 bg-gacam-green text-white rounded-md hover:bg-gacam-green/90"
              >
                + Ajouter un compte de test
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const StepPiecesJointes = ({
  formData,
  setFormData,
  handleFileChange,
  loading
}: {
  formData: any,
  setFormData: (data: any) => void,
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  loading: boolean
}) => {
  const [newUrl, setNewUrl] = useState("");
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="border-b border-gacam-green/10">
            <CardTitle className="text-xl text-gacam-green">5. Pièces jointes</CardTitle>
            <CardDescription>
              Documents supplémentaires à joindre à la demande
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <Label htmlFor="fichiers_attaches" className="block mb-2">
                  Fichiers Attachés
                </Label>
                <div className="border-2 border-dashed border-gacam-green/30 rounded-lg p-8 text-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                  <input
                    id="fichiers_attaches"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Label
                    htmlFor="fichiers_attaches"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload  className="h-10 w-10 text-gacam-green mb-3" />
                    <p className="text-lg font-medium text-gacam-green mb-1">
                      Cliquez pour sélectionner vos fichiers
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ou glissez-déposez vos fichiers ici
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Max 10 fichiers
                    </p>
                  </Label>
                </div>
                {formData.fichiers_attaches.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">
                      {formData.fichiers_attaches.length} fichier(s) sélectionné(s)
                    </p>
                    <ul className="space-y-2">
                      {Array.from(formData.fichiers_attaches).map((file: File, index) => (
                        <li key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                          <div className="flex items-center">
                            <div className="bg-gacam-green/10 p-2 rounded mr-2">
                              <svg className="h-5 w-5 text-gacam-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              const newFiles = Array.from(formData.fichiers_attaches).filter(
                                (_, i) => i !== index
                              );
                              const dataTransfer = new DataTransfer();
                              newFiles.forEach((file) => {
                                dataTransfer.items.add(file);
                              });
                              
                              const event = {
                                target: {
                                  files: dataTransfer.files
                                }
                              } as unknown as React.ChangeEvent<HTMLInputElement>;
                              
                              handleFileChange(event);
                            }}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Supprimer le fichier</span>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-4 space-y-3">
                <Label htmlFor="new_url">Ajouter une URL (fichier déjà hébergé)</Label>
                <div className="flex gap-2">
                  <Input
                    id="new_url"
                    type="url"
                    placeholder="https://example.com/document.pdf"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (newUrl.trim() === "") return;
                      setFormData((prev: any) => ({
                        ...prev,
                        fichiers_attaches_urls: [...(prev.fichiers_attaches_urls || []), newUrl.trim()],
                      }));
                      setNewUrl(""); // reset input
                    }}
                  >
                    Ajouter
                  </Button>
                </div>

                {/* Liste des URLs ajoutées */}
                {formData.fichiers_attaches_urls?.length > 0 && (
                  <ul className="space-y-2 mt-2">
                    {formData.fichiers_attaches_urls.map((url: string, index: number) => (
                      <li key={index} className="flex items-center justify-between bg-muted px-3 py-2 rounded-md">
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-gacam-green underline truncate max-w-[80%]">
                          {url}
                        </a>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updated = formData.fichiers_attaches_urls.filter((_, i) => i !== index);
                            setFormData((prev: any) => ({ ...prev, fichiers_attaches_urls: updated }));
                          }}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-4 bg-gacam-green/5 rounded-lg border border-gacam-green/10">
                <h3 className="font-medium text-gacam-green flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Information
                </h3>
                <p className="text-sm mt-2">
                  Vous êtes sur le point de finaliser votre demande d'audit. 
                  Veuillez vérifier que toutes les informations saisies sont correctes avant de soumettre le formulaire.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuditRequest;