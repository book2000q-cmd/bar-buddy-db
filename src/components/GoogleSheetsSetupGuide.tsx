import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink, CheckCircle2, Circle } from "lucide-react";

interface GoogleSheetsSetupGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GoogleSheetsSetupGuide = ({ open, onOpenChange }: GoogleSheetsSetupGuideProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">คู่มือการตั้งค่า Google Sheets Sync</DialogTitle>
          <DialogDescription>
            ทำตามขั้นตอนเหล่านี้เพื่อเชื่อมต่อระบบกับ Google Sheets
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Step 1 */}
          <Card className="p-4 border-l-4 border-l-primary">
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">สร้าง Google Cloud Project</h3>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Circle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>ไปที่ <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="w-3 h-3" /></a></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Circle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>สร้าง Project ใหม่หรือเลือก Project ที่มีอยู่</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Circle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>ไปที่ "APIs & Services" → "Enable APIs and Services"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Circle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>ค้นหาและเปิดใช้งาน "Google Sheets API"</span>
                  </li>
                </ol>
              </div>
            </div>
          </Card>

          {/* Step 2 */}
          <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">สร้าง Service Account</h3>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Circle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>ไปที่ "IAM & Admin" → "Service Accounts"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Circle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>คลิก "Create Service Account"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Circle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>ตั้งชื่อ Service Account (เช่น "sheets-sync")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Circle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>คลิกที่ Service Account ที่สร้างแล้ว → "Keys" tab</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Circle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>คลิก "Add Key" → "Create new key" → เลือก "JSON"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" />
                    <span className="font-medium">ไฟล์ JSON จะถูกดาวน์โหลด - เก็บไฟล์นี้ไว้ให้ดี!</span>
                  </li>
                </ol>
              </div>
            </div>
          </Card>

          {/* Step 3 */}
          <Card className="p-4 border-l-4 border-l-green-500">
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">สร้าง Google Sheet</h3>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Circle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>ไปที่ <a href="https://sheets.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Google Sheets <ExternalLink className="w-3 h-3" /></a></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Circle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>สร้าง Spreadsheet ใหม่</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Circle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>สร้าง 3 แท็บ (sheet) โดยตั้งชื่อดังนี้:</span>
                  </li>
                  <li className="ml-6 space-y-1">
                    <div className="flex items-center gap-2 bg-muted p-2 rounded">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <code className="font-mono">Products</code>
                    </div>
                    <div className="flex items-center gap-2 bg-muted p-2 rounded">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <code className="font-mono">Transactions</code>
                    </div>
                    <div className="flex items-center gap-2 bg-muted p-2 rounded">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <code className="font-mono">Expenses</code>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Circle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>คัดลอก Spreadsheet ID จาก URL</span>
                  </li>
                  <li className="ml-6">
                    <div className="bg-muted p-3 rounded font-mono text-xs break-all">
                      https://docs.google.com/spreadsheets/d/<span className="bg-yellow-200 dark:bg-yellow-900 px-1">SPREADSHEET_ID_อยู่ตรงนี้</span>/edit
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </Card>

          {/* Step 4 */}
          <Card className="p-4 border-l-4 border-l-orange-500">
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                  4
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">แชร์ Google Sheet</h3>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Circle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>เปิดไฟล์ JSON ที่ดาวน์โหลดมา และหา <code className="bg-muted px-1 rounded">"client_email"</code></span>
                  </li>
                  <li className="ml-6">
                    <div className="bg-muted p-3 rounded font-mono text-xs break-all">
                      "client_email": "<span className="text-primary">your-service-account@project-id.iam.gserviceaccount.com</span>"
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Circle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>คลิกปุ่ม "แชร์" ที่ Google Sheet</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Circle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>วางอีเมล Service Account และให้สิทธิ์ <strong>"Editor"</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" />
                    <span className="font-medium">ขั้นตอนนี้สำคัญมาก! ถ้าไม่แชร์จะไม่สามารถส่งข้อมูลได้</span>
                  </li>
                </ol>
              </div>
            </div>
          </Card>

          {/* Step 5 */}
          <Card className="p-4 border-l-4 border-l-purple-500">
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
                  5
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">ตั้งค่า Secrets ในระบบ</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  ถ้ายังไม่ได้ตั้งค่า Secrets กรุณาติดต่อแอดมินเพื่อตั้งค่าข้อมูลต่อไปนี้:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="bg-muted p-3 rounded">
                    <div className="font-medium mb-1">GOOGLE_SERVICE_ACCOUNT_EMAIL</div>
                    <div className="text-xs text-muted-foreground">จากฟิลด์ "client_email" ในไฟล์ JSON</div>
                  </div>
                  <div className="bg-muted p-3 rounded">
                    <div className="font-medium mb-1">GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY</div>
                    <div className="text-xs text-muted-foreground">จากฟิลด์ "private_key" ในไฟล์ JSON (รวมทั้ง -----BEGIN PRIVATE KEY----- และ -----END PRIVATE KEY-----)</div>
                  </div>
                  <div className="bg-muted p-3 rounded">
                    <div className="font-medium mb-1">GOOGLE_SPREADSHEET_ID</div>
                    <div className="text-xs text-muted-foreground">ID ของ Spreadsheet ที่คัดลอกมาจากขั้นตอนที่ 3</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Testing */}
          <Card className="p-4 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950">
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
                  ✓
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">ทดสอบการทำงาน</h3>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                    <span>กลับไปที่หน้า Settings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                    <span>คลิกปุ่ม "Sync ตอนนี้"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                    <span>ตรวจสอบ Google Sheet ว่ามีข้อมูลปรากฏหรือไม่</span>
                  </li>
                </ol>
              </div>
            </div>
          </Card>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Circle className="w-4 h-4 text-blue-500" />
              หมายเหตุ
            </h4>
            <ul className="text-sm space-y-1 text-muted-foreground ml-6">
              <li>• ระบบจะทำการ sync อัตโนมัติทุกวันเวลา 23:00 น.</li>
              <li>• คุณสามารถกดปุ่ม "Sync ตอนนี้" เพื่อ sync ได้ทันที</li>
              <li>• ถ้ามีข้อผิดพลาด ให้ตรวจสอบว่าแชร์ Sheet ให้ Service Account แล้วหรือยัง</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={() => onOpenChange(false)}>
            เข้าใจแล้ว
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
