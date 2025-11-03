import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, UserPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type AppRole = 'admin' | 'staff' | 'viewer';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  roles: AppRole[];
}

const UserManagement = () => {
  const navigate = useNavigate();
  const { hasRole, user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if current user is admin
  useEffect(() => {
    if (!hasRole('admin')) {
      toast.error("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
      navigate('/');
    }
  }, [hasRole, navigate]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    
    // Fetch all profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profiles) {
      // Fetch roles for each user
      const usersWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          const { data: userRoles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.id);

          return {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            roles: userRoles?.map(r => r.role as AppRole) || [],
          };
        })
      );

      setUsers(usersWithRoles);
    }
    
    setLoading(false);
  };

  const addRole = async (userId: string, role: AppRole) => {
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role });

    if (error) {
      if (error.code === '23505') {
        toast.error("ผู้ใช้มีสิทธิ์นี้อยู่แล้ว");
      } else {
        toast.error("ไม่สามารถเพิ่มสิทธิ์ได้");
      }
      return;
    }

    toast.success("เพิ่มสิทธิ์สำเร็จ");
    fetchUsers();
  };

  const removeRole = async (userId: string, role: AppRole) => {
    // Prevent removing own admin role
    if (userId === currentUser?.id && role === 'admin') {
      toast.error("ไม่สามารถลบสิทธิ์ admin ของตัวเองได้");
      return;
    }

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", role);

    if (error) {
      toast.error("ไม่สามารถลบสิทธิ์ได้");
      return;
    }

    toast.success("ลบสิทธิ์สำเร็จ");
    fetchUsers();
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'staff':
        return 'default';
      case 'viewer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return 'แอดมิน';
      case 'staff':
        return 'พนักงาน';
      case 'viewer':
        return 'ผู้ดู';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">กำลังโหลด...</p>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold">จัดการผู้ใช้และสิทธิ์</h1>
            <p className="text-primary-foreground/80 text-sm">
              เพิ่มหรือลบสิทธิ์การใช้งาน
            </p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {users.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">ไม่พบผู้ใช้ในระบบ</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <Card key={user.id} className="border-none shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold">
                        {user.full_name || 'ไม่ระบุชื่อ'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {user.email}
                      </p>
                      {user.id === currentUser?.id && (
                        <Badge variant="outline" className="mt-2">
                          คุณ
                        </Badge>
                      )}
                    </div>
                    <Shield className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {user.roles.length > 0 ? (
                      user.roles.map((role) => (
                        <div key={role} className="flex items-center gap-1">
                          <Badge variant={getRoleBadgeVariant(role)}>
                            {getRoleLabel(role)}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeRole(user.id, role)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        ยังไม่มีสิทธิ์
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Select
                      onValueChange={(role: AppRole) => addRole(user.id, role)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="เพิ่มสิทธิ์..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">แอดมิน</SelectItem>
                        <SelectItem value="staff">พนักงาน</SelectItem>
                        <SelectItem value="viewer">ผู้ดู</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="bg-muted/50 border-dashed">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-medium">คำอธิบายสิทธิ์:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                  <li>
                    <strong>แอดมิน:</strong> สามารถจัดการสินค้า ดูยอดขาย และจัดการผู้ใช้
                  </li>
                  <li>
                    <strong>พนักงาน:</strong> สามารถจัดการสินค้าและขายสินค้า
                  </li>
                  <li>
                    <strong>ผู้ดู:</strong> สามารถดูข้อมูลเท่านั้น
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default UserManagement;
