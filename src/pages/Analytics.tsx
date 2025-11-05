import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

const Analytics = () => {
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [stockData, setStockData] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);

  useEffect(() => {
    fetchAnalytics();

    // Setup realtime subscriptions
    const transactionsChannel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        () => {
          fetchAnalytics();
        }
      )
      .subscribe();

    const expensesChannel = supabase
      .channel('expenses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses'
        },
        () => {
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(expensesChannel);
    };
  }, []);

  const fetchAnalytics = async () => {
    const { data: products } = await supabase.from("products").select("*");
    const { data: transactions } = await supabase
      .from("transactions")
      .select("*")
      .order("transaction_date", { ascending: true });
    const { data: expenses } = await supabase
      .from("expenses")
      .select("*")
      .order("expense_date", { ascending: true });

    if (products) {
      // Category distribution
      const categoryCount: { [key: string]: number } = {};
      products.forEach((p) => {
        const cat = p.category || "ไม่ระบุ";
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });

      const catData = Object.entries(categoryCount).map(([name, value]) => ({
        name,
        value,
      }));
      setCategoryData(catData);

      // Stock levels
      const stockLevels = products.map((p) => {
        const productName = p.name || "ไม่มีชื่อ";
        return {
          name: productName.length > 15 ? productName.substring(0, 15) + "..." : productName,
          stock: p.stock_quantity,
        };
      }).slice(0, 10);
      setStockData(stockLevels);
    }

    if (transactions) {
      // Group sales by date (last 7 days)
      const salesByDate: { [key: string]: number } = {};
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      last7Days.forEach(date => {
        salesByDate[date] = 0;
      });

      transactions.forEach((t) => {
        const date = new Date(t.transaction_date).toISOString().split('T')[0];
        if (salesByDate.hasOwnProperty(date)) {
          salesByDate[date] += Number(t.total_amount);
        }
      });

      const salesChartData = Object.entries(salesByDate).map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' }),
        ยอดขาย: amount,
      }));
      setSalesData(salesChartData);
    }

    // Calculate total income from transactions
    if (transactions) {
      const income = transactions.reduce((sum, t) => sum + Number(t.total_amount), 0);
      setTotalIncome(income);
    }

    // Calculate total expenses
    if (expenses) {
      const expenseTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      setTotalExpenses(expenseTotal);
    }
  };

  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 rounded-b-3xl shadow-md">
        <h1 className="text-2xl font-bold mb-1">สถิติและรายงาน</h1>
        <p className="text-primary-foreground/80 text-sm">ข้อมูลภาพรวมสินค้า</p>
      </header>

      <main className="p-4 space-y-4">
        {/* Income and Expenses Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-none shadow-md bg-gradient-to-br from-green-500/10 to-green-600/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                รายรับทั้งหมด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                ฿{totalIncome.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-red-500/10 to-red-600/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                รายจ่ายทั้งหมด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">
                ฿{totalExpenses.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Net Profit/Loss */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">กำไรสุทธิ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ฿{(totalIncome - totalExpenses).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>รายรับย้อนหลัง 7 วัน</CardTitle>
          </CardHeader>
          <CardContent>
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="ยอดขาย" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                ยังไม่มีข้อมูลการขาย
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>การกระจายตัวตามหมวดหมู่</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) =>
                      `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                ยังไม่มีข้อมูล
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>สินค้าคงเหลือ (10 รายการแรก)</CardTitle>
          </CardHeader>
          <CardContent>
            {stockData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="stock" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                ยังไม่มีข้อมูล
              </p>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default Analytics;