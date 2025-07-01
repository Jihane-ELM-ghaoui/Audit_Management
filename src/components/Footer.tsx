import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 py-3 px-4 border-t border-gray-200 text-sm">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="text-gray-500 text-xs text-center sm:text-right">
          © 2025 GACAM — Tous droits réservés
        </div>
      </div>
    </footer>
  );
};

export default Footer;