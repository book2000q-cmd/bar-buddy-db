import { useNavigate } from "react-router-dom";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import itLogo from "@/assets/it-logo.png";
import collegeLogo from "@/assets/college-logo.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background pb-20">
      <main className="flex flex-col items-center justify-center min-h-[85vh] p-6 space-y-8">
        {/* Logos Section */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden shadow-2xl border-4 border-primary/20 hover:scale-105 transition-transform">
            <img src={collegeLogo} alt="Wangnamyen Technical College" className="w-full h-full object-cover" />
          </div>
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden shadow-2xl border-4 border-primary/20 hover:scale-105 transition-transform">
            <img src={itLogo} alt="Information Technology" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center space-y-3 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            ระบบบริหารจัดการ
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            ร้านขายของชำ
          </h2>
          <p className="text-muted-foreground mt-4">
            วิทยาลัยเทคนิควังน้ำเย็น
          </p>
        </div>

        {/* Main Button */}
        <Button 
          onClick={() => navigate("/sale")}
          size="lg"
          className="w-full max-w-md h-14 text-lg bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:shadow-xl transition-all transform hover:scale-105"
        >
          <Store className="mr-3 h-6 w-6" />
          เข้าใช้งาน ระบบบริหารจัดการร้านขายของชำ
        </Button>
      </main>

      <BottomNav />
    </div>
  );
};

export default Index;
