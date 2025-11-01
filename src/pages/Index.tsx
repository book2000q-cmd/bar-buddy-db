import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import collegeLogo from '@/assets/college-logo.png';
import itLogo from '@/assets/it-logo.png';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Redirect to products page if already logged in
    if (user && !loading) {
      navigate('/products');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 via-secondary/5 to-accent/5 pb-20 animate-fade-in">
      <main className="flex flex-col items-center justify-center min-h-[85vh] p-6 space-y-8">
        {/* Logos Section */}
        <div className="flex items-center justify-center gap-6 mb-8 animate-slide-up">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden shadow-2xl border-4 border-primary/30 hover:scale-110 hover:rotate-6 transition-all duration-300 hover:shadow-primary/50 bg-white">
            <img src={collegeLogo} alt="Wangnamyen Technical College" className="w-full h-full object-cover scale-[1.20] translate-y-1" style={{ objectPosition: 'center 55%' }} />
          </div>
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden shadow-2xl border-4 border-secondary/30 hover:scale-110 hover:-rotate-6 transition-all duration-300 hover:shadow-secondary/50">
            <img src={itLogo} alt="Information Technology" className="w-full h-full object-cover object-center" />
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center space-y-3 max-w-2xl animate-scale-in">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground drop-shadow-lg">
            ระบบบริหารจัดการ
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-shimmer">
            ร้านขายของชำ
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            วิทยาลัยเทคนิควังน้ำเย็น
          </p>
        </div>

        {/* Login Button */}
        <Button 
          onClick={() => navigate('/auth')}
          size="lg"
          className="w-full max-w-md h-16 text-lg font-semibold bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-2xl hover:shadow-primary/30 transition-all transform hover:scale-105 animate-slide-up"
        >
          <LogIn className="mr-3 h-6 w-6" />
          เข้าสู่ระบบ
        </Button>
      </main>
    </div>
  );
};

export default Index;
