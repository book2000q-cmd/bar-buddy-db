import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { User, Database, Info, LogOut, Users, FileSpreadsheet, Loader2, HelpCircle, Key, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { GoogleSheetsSetupGuide } from "@/components/GoogleSheetsSetupGuide";
import { Badge } from "@/components/ui/badge";

const Settings = () => {
  const { user, signOut, roles, hasRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [secrets, setSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    checkSecrets();
  }, []);

  const checkSecrets = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-secrets');
      if (!error && data) {
        setSecrets(data.secrets || {});
      }
    } catch (error) {
      console.error('Error checking secrets:', error);
    }
  };

  const handleConfigureSecrets = async () => {
    await checkSecrets();
    
    const hasAllSecrets = secrets.GOOGLE_SERVICE_ACCOUNT_EMAIL && 
                          secrets.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY && 
                          secrets.GOOGLE_SPREADSHEET_ID;
    
    toast({
      title: "ตรวจสอบสถานะ Secrets",
      description: hasAllSecrets 
        ? "Secrets ทั้งหมดได้รับการตั้งค่าเรียบร้อยแล้ว หากต้องการแก้ไข กรุณาติดต่อผู้ดูแลระบบ" 
        : "กรุณาตั้งค่า Secrets ที่ยังขาดอยู่ผ่านหน้าจัดการ Backend",
    });
  };

  const handleSyncToGoogleSheets = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-google-sheets');
      
      if (error) throw error;

      toast({
        title: "Sync สำเร็จ",
        description: `ส่งออกข้อมูลไป Google Sheets เรียบร้อยแล้ว\n- สินค้า: ${data.stats.products} รายการ\n- ยอดขาย: ${data.stats.transactions} รายการ\n- ค่าใช้จ่าย: ${data.stats.expenses} รายการ`,
      });
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถ sync ข้อมูลไป Google Sheets ได้",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

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
          <>
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

            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-full flex-shrink-0">
                    <FileSpreadsheet className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">Google Sheets Sync</h3>
                    <p className="text-sm text-muted-foreground">ส่งออกข้อมูลไป Google Sheets อัตโนมัติ</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Auto sync ทุกวันเวลา 23:00 น.
                    </p>
                  </div>
                  <Button
                    onClick={handleSyncToGoogleSheets}
                    disabled={isSyncing}
                    size="sm"
                    variant="default"
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        กำลัง Sync...
                      </>
                    ) : (
                      'Sync ตอนนี้'
                    )}
                  </Button>
                </div>
                
                <div className="border-t pt-3">
                  <Button
                    onClick={() => setShowSetupGuide(true)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    คู่มือการตั้งค่า Google Sheets
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-full flex-shrink-0">
                    <Key className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">Google Sheets Secrets</h3>
                    <p className="text-sm text-muted-foreground mb-3">จัดการ API Keys และข้อมูลการเชื่อมต่อ</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Service Account Email</span>
                          <Badge variant={secrets.GOOGLE_SERVICE_ACCOUNT_EMAIL ? "default" : "secondary"}>
                            {secrets.GOOGLE_SERVICE_ACCOUNT_EMAIL ? (
                              <><CheckCircle2 className="h-3 w-3 mr-1" /> ตั้งค่าแล้ว</>
                            ) : (
                              <><AlertCircle className="h-3 w-3 mr-1" /> ยังไม่ได้ตั้งค่า</>
                            )}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Private Key</span>
                          <Badge variant={secrets.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ? "default" : "secondary"}>
                            {secrets.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ? (
                              <><CheckCircle2 className="h-3 w-3 mr-1" /> ตั้งค่าแล้ว</>
                            ) : (
                              <><AlertCircle className="h-3 w-3 mr-1" /> ยังไม่ได้ตั้งค่า</>
                            )}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Spreadsheet ID</span>
                          <Badge variant={secrets.GOOGLE_SPREADSHEET_ID ? "default" : "secondary"}>
                            {secrets.GOOGLE_SPREADSHEET_ID ? (
                              <><CheckCircle2 className="h-3 w-3 mr-1" /> ตั้งค่าแล้ว</>
                            ) : (
                              <><AlertCircle className="h-3 w-3 mr-1" /> ยังไม่ได้ตั้งค่า</>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <Button
                    onClick={handleConfigureSecrets}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    ตรวจสอบสถานะ Secrets
                  </Button>
                </div>
              </div>
            </Card>

            <GoogleSheetsSetupGuide
              open={showSetupGuide}
              onOpenChange={setShowSetupGuide}
            />
          </>
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
