import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import NotAuthorized from './pages/NotAuthorized';

import Layout from "./components/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuditRequest from "./pages/AuditRequest";
import DemandeList from "./pages/DemandeList";
import AffectList from "./pages/AffectList";
import AffectationForm from "./pages/AffectationForm";
import IPList from "./pages/IPList";
import AuditeurPage from "./pages/AuditeurPage";
import PlanService from "./pages/PlanService";
import ListesAudit from "./pages/ListesAudit";
import AdminDashboard from './pages/AdminDashboard';
import PrestataireList from './pages/PrestataireList';
import DashboardProjectManager from './pages/DashboardProjectManager';

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    const rootElement = document.documentElement;
    theme === 'dark'
      ? rootElement.classList.add('dark')
      : rootElement.classList.remove('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              

                

                <Route element={<Layout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/audit-request" element={<AuditRequest />} />
                  <Route path="/demande-list" element={<DemandeList />} />
                  <Route path="/affect-list" element={<AffectList />} />
                  <Route path="/assign" element={<AffectationForm />} />
                  <Route path="/ips" element={<IPList />} />
                  <Route path="/prestataires" element={<PrestataireList />} />
                  <Route path="/auditeurs" element={<AuditeurPage />} />
                  <Route path="/plan" element={<PlanService />} />
                  <Route path="/list" element={<ListesAudit />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/dash" element={<DashboardProjectManager />} />
                </Route>


              <Route path="*" element={<NotFound />} />
              <Route path="/not-authorized" element={<NotAuthorized />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
  );
};

export default App;