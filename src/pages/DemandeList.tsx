import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/sonner";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, X, UserPlus } from "lucide-react";
import api from "@/api";

interface Contact {
  nom: string;
  prenom: string;
  email: string;
  entite: string;
}

interface Audit {
  id: number;
  contacts?: Contact[];
  nom_app: string;
  date_creation: string;
  etat: string;
  description: string;
  liste_fonctionalites: string;
  type_app: string;
  type_app_2?: string;
  architecture_projet: boolean;
  architecture_file_path?: string;
  architecture_file_url?: string;
  commentaires_archi?: string;
  protection_waf: boolean;
  commentaires_waf?: string;
  ports: boolean;
  liste_ports?: string;
  cert_ssl_domain_name: boolean;
  commentaires_cert_ssl_domain_name?: string;
  sys_exploitation: string;
  logiciels_installes: string;
  env_tests: string;
  donnees_prod: boolean;
  liste_si_actifs: string;
  compte_admin: string;
  nom_domaine: string;
  url_app: string;
  existance_swagger: boolean;
  commentaires_existance_swagger: string;
  comptes_test?: {
    identifiant: string;
    mot_de_passe: string;
  }[];
  date_previsionnelle: Date;
  fichiers_attaches?: string[];
  fichiers_attaches_urls?: string[];
  fiche_demande_path?: string;
}

const DemandeList = () => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      const response = await api.get("/audits", );
      setAudits(response.data);
    } catch (error) {
      console.error('Erreur de chargement:', error);
      toast("Erreur de chargement des demandes d'audit", { 
        description: "Impossible de récupérer les données"
      });
    }
  };

  const fetchAuditDetails = async (id: number) => {
    try {
      const response = await api.get(`/audits/${id}`, );
      setSelectedAudit(response.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Erreur de chargement des détails:', error);
      toast("Impossible de charger les détails", {
        description: "Veuillez réessayer plus tard"
      });
    }
  };

  const confirmEtatChange = async () => {
    if (!etatToChange) return;

    try {
      const payload =
        etatToChange.etat === "Rejetée"
          ? {
              etat: etatToChange.etat,
              commentaire_rejet: rejectionComment,
            }
          : {
              etat: etatToChange.etat,
            };

      const response = await api.patch(
        `/audits/${etatToChange.id}/update-etat`,
        payload // JSON body conforme à ce qu'attend FastAPI
      );

      const updatedAudit = response.data;

      setAudits((prev) =>
        prev.map((a) => (a.id === updatedAudit.id ? updatedAudit : a))
      );

      if (selectedAudit?.id === updatedAudit.id) {
        setSelectedAudit(updatedAudit);
      }

      toast(`Demande ${etatToChange.etat.toLowerCase()}e avec succès`, {
        description: `La demande #${etatToChange.id} a été marquée comme ${etatToChange.etat.toLowerCase()}e`,
      });
    } catch (err) {
      toast("Erreur de mise à jour", {
        description: "Impossible de mettre à jour l'état de la demande",
      });
    } finally {
      setDialogOpen(false);
      setEtatToChange(null);
      setRejectionComment(""); // Reset
    }
  };

  const handleAffecter = (auditId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const auditToAssign = audits.find(audit => audit.id === auditId);
    if (auditToAssign) {
      navigate('/assign', { state: { auditData: auditToAssign } });
    } else {
      toast("Erreur", {
        description: "Impossible de trouver cette demande d'audit"
      });
    }
  };


  const [dialogOpen, setDialogOpen] = useState(false);
  const [etatToChange, setEtatToChange] = useState<{ id: number; etat: string } | null>(null);
  const handleEtatClick = (id: number, etat: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEtatToChange({ id, etat });
    setDialogOpen(true);
  };

  const [rejectionComment, setRejectionComment] = useState<string>("");


  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-green-800 mb-6">Liste des Demandes d'Audits</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Nom d'Application
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Date de création
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Date de previsionnelle
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  État
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {audits.length > 0 ? (
                audits.map(audit => (
                  <tr 
                    key={audit.id} 
                    className="hover:bg-gray-50 cursor-pointer" 
                    onClick={() => fetchAuditDetails(audit.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{audit.nom_app}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(audit.date_creation).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(audit.date_previsionnelle).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${audit.etat === 'Validée' ? 'bg-green-100 text-green-800' : 
                        audit.etat === 'Rejetée' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                        {audit.etat}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        {audit.etat !== "Validée" && audit.etat !== "Rejetée" && (
                          <>
                            <Button
                              className="bg-gacam-green-olive text-white hover:bg-gacam-green/90"
                              onClick={(e) => handleEtatClick(audit.id, "Validée", e)}
                            >
                              Valider
                            </Button>

                            <Button
                              className="bg-gacam-red-dark text-white hover:bg-gacam-red-vivid/90"
                              onClick={(e) => handleEtatClick(audit.id, "Rejetée", e)}
                            >
                              Rejeter
                            </Button>
                          </>
                        )}

                        {audit.etat === "Validée" && (
                          <button
                            onClick={(e) => handleAffecter(audit.id, e)}
                            className="text-white hover:brightness-110 px-3 py-1 rounded"
                            style={{ backgroundColor: "#C1CA9C" }}
                          >
                            <UserPlus className="inline-block w-4 h-4 mr-1" />
                            Affecter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucune demande d'audit disponible
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAudit && isDetailModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-green-700">
                Détails de l'Audit #{selectedAudit.id}
              </h2>
            </div>
            
            <div className="p-6 overflow-x-auto">
              <div className="space-y-8">
                {selectedAudit.contacts?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-green-800 border-b border-gray-200 pb-2 mb-3">
                      Contacts Demandeur
                    </h3>
                    {selectedAudit.contacts.map((contact, index) => (
                      <div key={index} className="mb-4 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-600 font-semibold mb-2">Contact #{index + 1}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Nom</p>
                            <p className="font-medium">{contact.nom || "-"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Prénom</p>
                            <p className="font-medium">{contact.prenom || "-"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium">{contact.email || "-"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Entité</p>
                            <p className="font-medium">{contact.entite || "-"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Infos Application */}
                <div>
                  <h3 className="text-lg font-medium text-green-800 border-b border-gray-200 pb-2 mb-3">
                    Application
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Nom</p>
                      <p className="font-medium">{selectedAudit.nom_app}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Description</p>
                      <p>{selectedAudit.description}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fonctionnalités</p>
                      <p>{selectedAudit.liste_fonctionalites}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p>{selectedAudit.type_app} {selectedAudit.type_app_2 && `(${selectedAudit.type_app_2})`}</p>
                    </div>
                  </div>
                </div>
                
                {/* Architecture & sécurité */}
                <div>
                  <h3 className="text-lg font-medium text-green-800 border-b border-gray-200 pb-2 mb-3">
                    Sécurité
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Architecture projet</p>
                      <p className={selectedAudit.architecture_projet ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {selectedAudit.architecture_projet ? 'Oui' : 'Non'}
                      </p>
                    </div>
                    {selectedAudit.architecture_file_path && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Fichier Architecture</p>
                        <a
                          href={`http://localhost:8000/${selectedAudit.architecture_file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                          </svg>
                          Télécharger l'architecture
                        </a>
                      </div>
                    )}
                    {selectedAudit.architecture_file_url && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-2">Lien direct vers le fichier d’architecture</p>
                        <a
                          href={selectedAudit.architecture_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                        >
                          🔗 Ouvrir le fichier d’architecture
                        </a>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Commentaires Archi</p>
                      <p>{selectedAudit.commentaires_archi || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Protection WAF</p>
                      <p className={selectedAudit.protection_waf ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {selectedAudit.protection_waf ? 'Oui' : 'Non'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Commentaires WAF</p>
                      <p>{selectedAudit.commentaires_waf || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ports exposés</p>
                      <p className={selectedAudit.ports ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {selectedAudit.ports ? 'Oui' : 'Non'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Liste des ports</p>
                      <p>{selectedAudit.liste_ports || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Certificat SSL</p>
                      <p className={selectedAudit.cert_ssl_domain_name ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {selectedAudit.cert_ssl_domain_name ? 'Oui' : 'Non'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Commentaires SSL</p>
                      <p>{selectedAudit.commentaires_cert_ssl_domain_name || "-"}</p>
                    </div>
                  </div>
                </div>
                
                {/* Système & Environnement */}
                <div>
                  <h3 className="text-lg font-medium text-green-800 border-b border-gray-200 pb-2 mb-3">
                    Système & Environnement
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">OS</p>
                      <p>{selectedAudit.sys_exploitation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Logiciels installés</p>
                      <p>{selectedAudit.logiciels_installes}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Environnement de test</p>
                      <p>{selectedAudit.env_tests}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Données de prod</p>
                      <p className={selectedAudit.donnees_prod ? "text-amber-600 font-medium" : "text-green-600 font-medium"}>
                        {selectedAudit.donnees_prod ? 'Oui' : 'Non'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">SI actifs</p>
                      <p>{selectedAudit.liste_si_actifs}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Compte admin</p>
                      <p>{selectedAudit.compte_admin}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nom de domaine</p>
                      <p>{selectedAudit.nom_domaine}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">URL App</p>
                      <p>{selectedAudit.url_app}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Existance du Swagger</p>
                      <p className={selectedAudit.existance_swagger ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {selectedAudit.existance_swagger ? 'Oui' : 'Non'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Commentaires Swagger</p>
                      <p>{selectedAudit.commentaires_existance_swagger || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date prévisionnelle de mise en production</p>
                      <p>{selectedAudit.date_previsionnelle}</p>
                    </div>
                  </div>
                </div>
                {selectedAudit.comptes_test?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-green-800 border-b border-gray-200 pb-2 mb-3">
                      Comptes de test
                    </h3>

                    <div className="flex items-center mb-2">
                      <label className="text-sm mr-2 text-gray-700">Afficher les mots de passe</label>
                      <button
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="text-blue-600 hover:text-blue-800 focus:outline-none"
                      >
                        {showPasswords ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 1l22 22" />
                            <path d="M17.94 17.94A10.97 10.97 0 0 1 12 20c-5.52 0-10.14-3.5-11.63-8.36a11.1 11.1 0 0 1 3.27-5.07M9.53 9.53A3.5 3.5 0 0 0 14.47 14.47" />
                          </svg>
                        )}
                      </button>
                    </div>

                    <table className="w-full text-sm border border-gray-300 rounded overflow-hidden mb-4">
                      <thead className="bg-gray-100 text-gray-600">
                        <tr>
                          <th className="p-2 text-left">#</th>
                          <th className="p-2 text-left">Identifiant</th>
                          <th className="p-2 text-left">Mot de passe</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedAudit.comptes_test.map((compte, index) => (
                          <tr key={index} className="border-t border-gray-200">
                            <td className="p-2">{index + 1}</td>
                            <td className="p-2">{compte.identifiant}</td>
                            <td className="p-2">
                              {showPasswords ? compte.mot_de_passe : "••••••••"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {/* Fichiers */}
                <div>
                  <h3 className="text-lg font-medium text-green-800 border-b border-gray-200 pb-2 mb-3">
                    Pièces jointes
                  </h3>
                  {selectedAudit.fichiers_attaches && selectedAudit.fichiers_attaches.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 mb-2">Fichiers attachés</p>
                      <ul className="space-y-2">
                        {selectedAudit.fichiers_attaches.map((file, idx) => (
                          <li key={idx} className="flex">
                            <a 
                              href={`http://localhost:8000/${file}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                              </svg>
                              Télécharger fichier {idx + 1}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Aucun fichier attaché</p>
                  )}
                  {selectedAudit.fichiers_attaches_urls?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Liens directs des fichiers</p>
                      <ul className="space-y-2">
                        {selectedAudit.fichiers_attaches_urls.map((url, idx) => (
                          <li key={idx} className="flex">
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                            >
                              🔗 Fichier {idx + 1}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedAudit.fiche_demande_path && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Fiche Demande</p>
                      <a 
                        href={`http://localhost:8000/${selectedAudit.fiche_demande_path}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        Télécharger la fiche de demande
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer le changement d'état</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir marquer la demande comme <strong>{etatToChange?.etat}</strong> ?
            </DialogDescription>
          </DialogHeader>

          {etatToChange?.etat === "Rejetée" && (
            <div className="mt-4">
              <label className="text-sm text-gray-700">Commentaire de rejet</label>
              <textarea
                className="w-full border rounded px-2 py-1 mt-1"
                rows={3}
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
              />
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={confirmEtatChange} className="bg-green-600 text-white hover:bg-green-700">
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default DemandeList;
