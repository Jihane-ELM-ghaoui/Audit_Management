import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthProvider';
import { HiMenu, HiX } from "react-icons/hi";

const Navbar: React.FC = () => {
  const { keycloak, authenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = () => keycloak.login();
  const handleLogout = () => keycloak.logout();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-gacam-green-dark shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => scrollTo('home')}
          className="text-white text-2xl font-extrabold tracking-wide hover:text-gacam-red-vivid transition-colors duration-200"
          aria-label="Go to home"
        >
          GACAM
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {authenticated ? (
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-white hover:text-gacam-red-vivid text-sm"
            >
              Déconnexion
            </Button>
          ) : (
            <Button
              onClick={handleLogin}
              variant="ghost"
              className="border-white text-white hover:bg-white hover:text-gacam-green-dark text-sm"
            >
              Connexion
            </Button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white focus:outline-none"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <HiX size={26} /> : <HiMenu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gacam-green-dark px-6 pb-6 animate-slide-down space-y-3">
          {authenticated ? (
            <Button
              onClick={handleLogout}
              className="w-full bg-transparent text-white hover:bg-white hover:text-gacam-green-dark text-sm"
            >
              Déconnexion
            </Button>
          ) : (
            <Button
              onClick={handleLogin}
              className="w-full bg-transparent text-white hover:bg-white hover:text-gacam-green-dark text-sm"
            >
              Connexion
            </Button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
