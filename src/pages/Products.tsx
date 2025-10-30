import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Package, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import BarcodeScanner from "@/components/BarcodeScanner";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Product {
  id: string;
  barcode: string;
  name: string;
  description: string | null;
  price: number | null;
  stock_quantity: number;
  category: string | null;
  image_url: string | null;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setProducts(data);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  const handleScan = async (barcode: string) => {
    setIsScanning(false);
    
    // Check if product exists
    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("barcode", barcode)
      .maybeSingle();

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
        <h1 className="text-2xl font-bold mb-1">รายการสินค้า</h1>
        <p className="text-primary-foreground/80 text-sm">จัดการและค้นหาสินค้า</p>
      </header>

      <main className="p-4 space-y-4">
        {isScanning ? (
          <BarcodeScanner
            onScan={handleScan}
            onClose={() => setIsScanning(false)}
          />
        ) : (
          <>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาสินค้า..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                size="icon"
                onClick={() => setIsScanning(true)}
                className="bg-gradient-to-r from-secondary to-secondary/80"
              >
                <Camera className="h-5 w-5" />
              </Button>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  {search ? "ไม่พบสินค้าที่ค้นหา" : "ยังไม่มีสินค้าในระบบ"}
                </p>
                <Button onClick={() => setIsScanning(true)}>
                  <Camera className="mr-2 h-4 w-4" />
                  สแกนเพื่อเพิ่มสินค้า
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow border-none"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            บาร์โค้ด: {product.barcode}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm font-medium text-primary">
                              ฿{(product.price || 0).toLocaleString('th-TH')}
                            </span>
                            <span
                              className={`text-sm ${
                                product.stock_quantity < 10
                                  ? "text-destructive"
                                  : "text-secondary"
                              }`}
                            >
                              คงเหลือ: {product.stock_quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Products;