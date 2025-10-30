import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BarcodeScanner from "@/components/BarcodeScanner";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Trash2, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SaleItem {
  id: string;
  barcode: string;
  name: string;
  price: number;
  quantity: number;
}

const Sale = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const navigate = useNavigate();

  const handleScan = async (barcode: string) => {
    setIsScanning(false);
    
    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("barcode", barcode)
      .single();

    if (product) {
      // Check if item already in cart
      const existingItemIndex = cart.findIndex(item => item.barcode === barcode);
      
      if (existingItemIndex >= 0) {
        const newCart = [...cart];
        newCart[existingItemIndex].quantity += 1;
        setCart(newCart);
        toast.success(`เพิ่ม ${product.name} แล้ว (${newCart[existingItemIndex].quantity})`);
      } else {
        const newItem: SaleItem = {
          id: product.id,
          barcode: product.barcode,
          name: product.name,
          price: Number(product.price),
          quantity: 1
        };
        setCart([...cart, newItem]);
        toast.success(`เพิ่ม ${product.name} ลงตะกร้า`);
      }
    } else {
      toast.error("ไม่พบสินค้า");
    }
  };

  const removeItem = (barcode: string) => {
    setCart(cart.filter(item => item.barcode !== barcode));
    toast.info("ลบสินค้าออกจากตะกร้าแล้ว");
  };

  const updateQuantity = (barcode: string, change: number) => {
    const newCart = cart.map(item => {
      if (item.barcode === barcode) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCart(newCart);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("ไม่มีสินค้าในตะกร้า");
      return;
    }

    try {
      // Update stock quantities for each item
      for (const item of cart) {
        const { data: product } = await supabase
          .from("products")
          .select("stock_quantity")
          .eq("id", item.id)
          .single();

        if (product) {
          const newStock = product.stock_quantity - item.quantity;
          if (newStock < 0) {
            toast.error(`${item.name} มีสต็อกไม่เพียงพอ`);
            return;
          }

          const { error } = await supabase
            .from("products")
            .update({ stock_quantity: newStock })
            .eq("id", item.id);

          if (error) {
            toast.error("เกิดข้อผิดพลาดในการอัพเดทสต็อก");
            return;
          }
        }
      }

      // Save transaction to database
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert([{
          total_amount: calculateTotal(),
          items: cart as any
        }]);

      if (transactionError) {
        toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูลการขาย");
        return;
      }

      toast.success(`ขายสำเร็จ! ยอดรวม ฿${calculateTotal().toFixed(2)}`);
      setCart([]);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 rounded-b-3xl shadow-md">
        <h1 className="text-2xl font-bold mb-1">ขายสินค้า</h1>
        <p className="text-primary-foreground/80 text-sm">สแกนบาร์โค้ดเพื่อเพิ่มสินค้า</p>
      </header>

      <main className="p-4 space-y-4">
        {!isScanning ? (
          <>
            <Button
              size="lg"
              onClick={() => setIsScanning(true)}
              className="w-full bg-gradient-to-r from-primary to-primary/80"
            >
              <Camera className="mr-2 h-5 w-5" />
              สแกนบาร์โค้ด
            </Button>

            {cart.length === 0 ? (
              <Card className="p-8 text-center">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">ตะกร้าสินค้าว่างเปล่า</p>
                <p className="text-sm text-muted-foreground mt-2">กดปุ่มด้านบนเพื่อสแกนสินค้า</p>
              </Card>
            ) : (
              <>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <Card key={item.barcode} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">฿{item.price.toFixed(2)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.barcode)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.barcode, -1)}
                          >
                            -
                          </Button>
                          <span className="w-12 text-center font-semibold">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.barcode, 1)}
                          >
                            +
                          </Button>
                        </div>
                        <p className="font-bold">฿{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </Card>
                  ))}
                </div>

                <Card className="p-4 bg-primary/5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">ยอดรวมทั้งหมด</span>
                    <span className="text-2xl font-bold text-primary">
                      ฿{calculateTotal().toFixed(2)}
                    </span>
                  </div>
                  <Button
                    size="lg"
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                  >
                    ชำระเงิน
                  </Button>
                </Card>
              </>
            )}
          </>
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

export default Sale;
