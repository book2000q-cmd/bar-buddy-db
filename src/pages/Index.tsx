import { useEffect, useState } from "react";
import { Package, TrendingUp, AlertCircle, Box } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    totalValue: 0,
    categories: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data: products } = await supabase
      .from("products")
      .select("*");

    if (products) {
      const totalProducts = products.length;
      const lowStock = products.filter(p => p.stock_quantity < 10).length;
      const totalValue = products.reduce((sum, p) => sum + (p.price || 0) * p.stock_quantity, 0);
      const categories = new Set(products.map(p => p.category).filter(Boolean)).size;

      setStats({ totalProducts, lowStock, totalValue, categories });
    }
  };

  const statCards = [
    {
      title: "สินค้าทั้งหมด",
      value: stats.totalProducts,
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "สินค้าใกล้หมด",
      value: stats.lowStock,
      icon: AlertCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "มูลค่ารวม",
      value: `฿${stats.totalValue.toLocaleString('th-TH', { maximumFractionDigits: 0 })}`,
      icon: TrendingUp,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "หมวดหมู่",
      value: stats.categories,
      icon: Box,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 rounded-b-3xl shadow-md">
        <h1 className="text-2xl font-bold mb-1">ระบบบาร์โค้ด</h1>
        <p className="text-primary-foreground/80 text-sm">จัดการสินค้าของคุณ</p>
      </header>

      <main className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className={`w-10 h-10 rounded-full ${stat.bgColor} flex items-center justify-center mb-2`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <CardTitle className="text-sm text-muted-foreground font-medium">
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>เริ่มต้นใช้งาน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              onClick={() => navigate("/scan")}
              className="w-full p-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              สแกนบาร์โค้ดสินค้า
            </button>
            <button
              onClick={() => navigate("/products")}
              className="w-full p-4 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              ดูรายการสินค้า
            </button>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default Index;