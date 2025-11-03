import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { User, Database, Info, LogOut, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Settings = () => {
  const { user, signOut, roles, hasRole } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 rounded-b-3xl shadow-md">
        <h1 className="text-2xl font-bold mb-1">ตั้งค่า</h1>
        <p className="text-primary-foreground/80 text-sm">จัดการระบบ</p>
      </header>

      {/* Settings Options */}
      <main className="p-4 space-y-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">โปรไฟล์</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              {roles.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  บทบาท: {roles.join(', ')}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-full">
              <Database className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">เกี่ยวกับระบบ</h3>
              <p className="text-sm text-muted-foreground">ระบบจัดการสินค้าด้วยบาร์โค้ด</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-full">
              <Info className="h-6 w-6 text-green-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">เวอร์ชัน</h3>
              <p className="text-sm text-muted-foreground">1.0.0</p>
            </div>
          </div>
        </Card>

        {hasRole('admin') && (
          <Card 
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/user-management')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-full">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">จัดการผู้ใช้และสิทธิ์</h3>
                <p className="text-sm text-muted-foreground">เพิ่มหรือลบสิทธิ์ผู้ใช้</p>
              </div>
            </div>
          </Card>
        )}

        <Button 
          onClick={signOut}
          variant="destructive"
          className="w-full flex items-center gap-2"
        >
          <LogOut className="h-5 w-5" />
          <span>ออกจากระบบ</span>
        </Button>
      </main>

      <BottomNav />
    </div>
  );
};

export default Settings;
