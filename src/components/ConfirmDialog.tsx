import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
}

export const ConfirmDialog = ({ open, onConfirm, onCancel, title, description }: ConfirmDialogProps) => (
  <Dialog open={open} onOpenChange={onCancel}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title || "Confirmer l'action"}</DialogTitle>
      </DialogHeader>
      <p>{description || "Êtes-vous sûr de vouloir continuer ?"}</p>
      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={onCancel}>Annuler</Button>
        <Button className="bg-green-700 hover:bg-green-800 text-white" onClick={onConfirm}>Confirmer</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
