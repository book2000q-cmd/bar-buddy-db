import { Database, Info, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 rounded-b-3xl shadow-md">
        <h1 className="text-2xl font-bold mb-1">ตั้งค่า</h1>
        <p className="text-primary-foreground/80 text-sm">จัดการระบบ</p>
      </header>

      <main className="p-4 space-y-4">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              เกี่ยวกับระบบ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              ระบบจัดการสินค้าด้วยบาร์โค้ด
            </p>
            <p className="text-muted-foreground">
              เวอร์ชัน: 1.0.0
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              คุณสมบัติ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• สแกนบาร์โค้ดผ่านกล้อง</li>
              <li>• จัดการข้อมูลสินค้า</li>
              <li>• ติดตามสต็อกสินค้า</li>
              <li>• รายงานและสถิติ</li>
              <li>• ฐานข้อมูลบนคลาวด์</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              วิธีใช้งาน
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. กดปุ่ม "สแกน" เพื่อสแกนบาร์โค้ดสินค้า</p>
            <p>2. ระบบจะค้นหาสินค้าอัตโนมัติ</p>
            <p>3. เพิ่มหรือแก้ไขข้อมูลสินค้าได้ที่หน้ารายการสินค้า</p>
            <p>4. ดูสถิติและรายงานได้ที่หน้าสถิติ</p>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default Settings;