import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { productSchema } from "@/lib/validations";
import { useAuth } from "@/hooks/useAuth";

const ProductDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const isNew = id === "new";
  const barcodeParam = searchParams.get("barcode");

  const [formData, setFormData] = useState({
    barcode: barcodeParam || "",
    name: "",
    description: "",
    price: "",
    cost_price: "",
    stock_quantity: "",
    category: "",
    image_url: "",
  });
  
  const [originalStockQuantity, setOriginalStockQuantity] = useState(0);

  useEffect(() => {
    if (!isNew && id) {
      fetchProduct();
    }
  }, [id, isNew]);

  const fetchProduct = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setFormData({
        barcode: data.barcode,
        name: data.name,
        description: data.description || "",
        price: data.price?.toString() || "",
        cost_price: data.cost_price?.toString() || "",
        stock_quantity: data.stock_quantity.toString(),
        category: data.category || "",
        image_url: data.image_url || "",
      });
      setOriginalStockQuantity(data.stock_quantity);
    }
  };

  const handleSave = async () => {
    try {
      // Prepare data for validation
      const dataToValidate = {
        barcode: formData.barcode,
        name: formData.name,
        description: formData.description || null,
        price: formData.price ? parseFloat(formData.price) : 0,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : 0,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        category: formData.category || null,
        image_url: formData.image_url || null,
      };

      // Validate with Zod
      const validatedData = productSchema.parse(dataToValidate);

      // Prepare final data for database
      const dbData = {
        barcode: validatedData.barcode,
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        cost_price: validatedData.cost_price,
        stock_quantity: validatedData.stock_quantity,
        category: validatedData.category,
        image_url: validatedData.image_url,
      };

      if (isNew) {
        // Insert new product
        const { error: insertError } = await supabase.from("products").insert([dbData]);
        if (insertError) {
          console.error('Insert error:', insertError);
          toast.error("ไม่สามารถเพิ่มสินค้าได้");
          return;
        }

        // Record expense for new product (cost_price * stock_quantity)
        if (validatedData.cost_price && validatedData.cost_price > 0 && validatedData.stock_quantity > 0) {
          const expenseAmount = validatedData.cost_price * validatedData.stock_quantity;
          const { error: expenseError } = await supabase.from("expenses").insert([{
            description: `นำเข้าสินค้า: ${validatedData.name}`,
            amount: expenseAmount,
            category: "สินค้า",
            expense_date: new Date().toISOString()
          }]);
          
          if (expenseError) {
            console.error('Expense recording error:', expenseError);
            toast.warning("บันทึกสินค้าสำเร็จ แต่ไม่สามารถบันทึกรายจ่ายได้");
          }
        }

        toast.success("เพิ่มสินค้าและบันทึกรายจ่ายสำเร็จ");
      } else {
        // Update existing product
        const { error: updateError } = await supabase
          .from("products")
          .update(dbData)
          .eq("id", id);
        
        if (updateError) {
          console.error('Update error:', updateError);
          toast.error("ไม่สามารถบันทึกข้อมูลได้");
          return;
        }

        // If stock quantity increased, record expense for additional stock
        const stockDifference = validatedData.stock_quantity - originalStockQuantity;
        if (validatedData.cost_price && validatedData.cost_price > 0 && stockDifference > 0) {
          const expenseAmount = validatedData.cost_price * stockDifference;
          const { error: expenseError } = await supabase.from("expenses").insert([{
            description: `เพิ่มสต็อกสินค้า: ${validatedData.name} (+${stockDifference})`,
            amount: expenseAmount,
            category: "สินค้า",
            expense_date: new Date().toISOString()
          }]);
          
          if (expenseError) {
            console.error('Expense recording error:', expenseError);
            toast.warning("บันทึกสินค้าสำเร็จ แต่ไม่สามารถบันทึกรายจ่ายได้");
          }
        }

        toast.success("บันทึกข้อมูลสำเร็จ");
      }

      navigate("/products");
    } catch (error: any) {
      // Handle validation errors
      if (error.errors) {
        error.errors.forEach((err: any) => {
          toast.error(err.message);
        });
      } else {
        toast.error("ข้อมูลไม่ถูกต้อง");
      }
    }
  };

  const handleDelete = async () => {
    if (!hasRole('admin')) {
      toast.error("คุณไม่มีสิทธิ์ลบสินค้า");
      return;
    }

    if (!window.confirm("ต้องการลบสินค้านี้ใช่หรือไม่?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.error('Delete error:', error);
      toast.error("ไม่สามารถลบสินค้าได้");
      return;
    }
    toast.success("ลบสินค้าสำเร็จ");
    navigate("/products");
  };

  const canModify = hasRole('admin') || hasRole('staff');

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 rounded-b-3xl shadow-md">
        <div className="flex items-center gap-4 mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isNew ? "เพิ่มสินค้าใหม่" : "รายละเอียดสินค้า"}
            </h1>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        <Card className="border-none shadow-md">
          <CardContent className="p-6 space-y-4">
            <div className="w-24 h-24 mx-auto bg-muted rounded-lg flex items-center justify-center">
              {formData.image_url ? (
                <img
                  src={formData.image_url}
                  alt="Product"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Package className="h-12 w-12 text-muted-foreground" />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">บาร์โค้ด *</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) =>
                  setFormData({ ...formData, barcode: e.target.value })
                }
                placeholder="1234567890123"
                disabled={!canModify}
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">ชื่อสินค้า *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="ชื่อสินค้า"
                disabled={!canModify}
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">หมวดหมู่</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="อิเล็กทรอนิกส์, อาหาร, เครื่องดื่ม"
                disabled={!canModify}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียด</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="รายละเอียดสินค้า"
                rows={3}
                disabled={!canModify}
                maxLength={1000}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">ราคาขาย (฿)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="0.00"
                  disabled={!canModify}
                  min="0"
                  max="1000000"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost_price">ราคาทุน (฿)</Label>
                <Input
                  id="cost_price"
                  type="number"
                  value={formData.cost_price}
                  onChange={(e) =>
                    setFormData({ ...formData, cost_price: e.target.value })
                  }
                  placeholder="0.00"
                  disabled={!canModify}
                  min="0"
                  max="1000000"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">จำนวนคงเหลือ</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) =>
                  setFormData({ ...formData, stock_quantity: e.target.value })
                }
                placeholder="0"
                disabled={!canModify}
                min="0"
                max="100000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">URL รูปภาพ</Label>
              <Input
                id="image"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
                disabled={!canModify}
                maxLength={500}
              />
            </div>
          </CardContent>
        </Card>

        {canModify && (
          <div className="flex gap-3">
            <Button
              className="flex-1 bg-gradient-to-r from-secondary to-secondary/80"
              onClick={handleSave}
            >
              <Save className="mr-2 h-4 w-4" />
              บันทึก
            </Button>
            {!isNew && hasRole('admin') && (
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default ProductDetail;
