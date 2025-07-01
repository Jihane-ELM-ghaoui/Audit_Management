
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SignupDialogProps {
  open: boolean;
  onClose: () => void;
}

const SignupDialog: React.FC<SignupDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gacam-green">Sign Up</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                placeholder="Votre nom"
                className="focus-visible:ring-gacam-green"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="prenom">Prénom</Label>
              <Input
                id="prenom"
                placeholder="Votre prénom"
                className="focus-visible:ring-gacam-green"
                required
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your-email@example.com"
              className="focus-visible:ring-gacam-green"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="telephone">Numéro de Téléphone</Label>
            <Input
              id="telephone"
              type="tel"
              placeholder="+212 612 345 678"
              className="focus-visible:ring-gacam-green"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              className="focus-visible:ring-gacam-green"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
            <Input
              id="confirm-password"
              type="password"
              className="focus-visible:ring-gacam-green"
              required
            />
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="bg-gacam-green hover:bg-gacam-green-dark"
            onClick={onClose}
          >
            Sign Up
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SignupDialog;
