import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BarcodeScanner from "@/components/BarcodeScanner";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Trash2, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { transactionSchema, type SaleItem } from "@/lib/validations";

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
        const newQuantity = Math.max(1, Math.min(1000, item.quantity + change));
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
      // Validate transaction data
      const transactionData = {
        total_amount: calculateTotal(),
        items: cart
      };

      const validatedTransaction = transactionSchema.parse(transactionData);

      // Update stock quantities for each item
      for (const item of validatedTransaction.items) {
        const { data: product, error: fetchError } = await supabase
          .from("products")
          .select("stock_quantity")
          .eq("id", item.id)
          .maybeSingle();

        if (fetchError) {
          console.error('Fetch error:', fetchError);
          toast.error(`เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า`);
          return;
        }

        if (!product) {
          toast.error(`ไม่พบข้อมูลสินค้า: ${item.name}`);
          return;
        }

        const newStock = product.stock_quantity - item.quantity;
        
        if (newStock < 0) {
          toast.error(`${item.name} มีสต็อกไม่เพียงพอ (เหลือ ${product.stock_quantity} ชิ้น)`);
          return;
        }

        const { error: updateError } = await supabase
          .from("products")
          .update({ stock_quantity: newStock })
          .eq("id", item.id);

        if (updateError) {
          console.error('Update error:', updateError);
          toast.error(`เกิดข้อผิดพลาดในการอัพเดทสต็อก`);
          return;
        }
      }

      // Save transaction to database
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert([{
          total_amount: validatedTransaction.total_amount,
          items: validatedTransaction.items as any
        }]);

      if (transactionError) {
        console.error('Transaction error:', transactionError);
        toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูลการขาย");
        return;
      }

      toast.success(`✅ ขายสำเร็จ! ยอดรวม ฿${validatedTransaction.total_amount.toFixed(2)}`);
      setCart([]);
    } catch (error: any) {
      console.error('Checkout error:', error);
      if (error.errors) {
        error.errors.forEach((err: any) => {
          toast.error(err.message);
        });
      } else {
        toast.error("เกิดข้อผิดพลาด");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background pb-20 animate-fade-in">
      <header className="bg-gradient-to-r from-primary via-secondary to-primary text-primary-foreground p-6 rounded-b-3xl shadow-lg shadow-primary/20 animate-slide-up">
        <h1 className="text-2xl font-bold mb-1">ขายสินค้า</h1>
        <p className="text-primary-foreground/90 text-sm">สแกนบาร์โค้ดเพื่อเพิ่มสินค้า</p>
      </header>

      <main className="p-4 space-y-4">
        {!isScanning ? (
          <>
            <Button
              size="lg"
              onClick={() => setIsScanning(true)}
              className="w-full bg-gradient-to-r from-primary via-secondary to-primary hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-105 animate-scale-in"
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

                <Card className="p-4 bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10 border-2 border-primary/20 shadow-lg animate-scale-in">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">ยอดรวมทั้งหมด</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      ฿{calculateTotal().toFixed(2)}
                    </span>
                  </div>
                  <Button
                    size="lg"
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-secondary via-secondary/90 to-secondary/80 hover:shadow-xl hover:shadow-secondary/30 transition-all hover:scale-105"
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
