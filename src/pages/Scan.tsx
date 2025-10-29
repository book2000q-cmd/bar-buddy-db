import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BarcodeScanner from "@/components/BarcodeScanner";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Scan = () => {
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  const handleScan = async (barcode: string) => {
    setIsScanning(false);
    
    // Check if product exists
    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("barcode", barcode)
      .single();

    if (product) {
      toast.success(`พบสินค้า: ${product.name}`);
      navigate(`/product/${product.id}`);
    } else {
      toast.info("ไม่พบสินค้า กรุณาเพิ่มสินค้าใหม่");
      navigate(`/product/new?barcode=${barcode}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 rounded-b-3xl shadow-md">
        <h1 className="text-2xl font-bold mb-1">สแกนบาร์โค้ด</h1>
        <p className="text-primary-foreground/80 text-sm">สแกนเพื่อค้นหาหรือเพิ่มสินค้า</p>
      </header>

      <main className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
        {!isScanning ? (
          <div className="text-center space-y-6">
            <div className="w-32 h-32 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Camera className="h-16 w-16 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">เริ่มสแกนบาร์โค้ด</h2>
              <p className="text-muted-foreground">
                กดปุ่มด้านล่างเพื่อเปิดกล้องและสแกนบาร์โค้ดสินค้า
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => setIsScanning(true)}
              className="w-full max-w-xs bg-gradient-to-r from-primary to-primary/80"
            >
              <Camera className="mr-2 h-5 w-5" />
              เปิดกล้องสแกน
            </Button>
          </div>
        ) : (
          <BarcodeScanner
            onScan={handleScan}
            onClose={() => setIsScanning(false)}
          />
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Scan;