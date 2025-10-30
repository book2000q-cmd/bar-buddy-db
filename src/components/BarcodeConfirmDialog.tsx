import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BarcodeConfirmDialogProps {
  open: boolean;
  barcode: string;
  onConfirm: (barcode: string) => void;
  onCancel: () => void;
}

const BarcodeConfirmDialog = ({ open, barcode, onConfirm, onCancel }: BarcodeConfirmDialogProps) => {
  const [editedBarcode, setEditedBarcode] = useState(barcode);

  const handleConfirm = () => {
    if (editedBarcode.trim()) {
      onConfirm(editedBarcode.trim());
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ยืนยันบาร์โค้ด</DialogTitle>
          <DialogDescription>
            กรุณาตรวจสอบบาร์โค้ดที่สแกนได้ หากไม่ถูกต้องสามารถแก้ไขได้
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="barcode">บาร์โค้ด</Label>
            <Input
              id="barcode"
              value={editedBarcode}
              onChange={(e) => setEditedBarcode(e.target.value)}
              placeholder="กรอกบาร์โค้ด"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button onClick={handleConfirm} disabled={!editedBarcode.trim()}>
            ยืนยัน
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeConfirmDialog;
