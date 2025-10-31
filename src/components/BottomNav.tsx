import { Home, ShoppingCart, Database, BarChart3, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "หน้าหลัก" },
    { path: "/sale", icon: ShoppingCart, label: "ขาย" },
    { path: "/products", icon: Database, label: "สินค้า" },
    { path: "/analytics", icon: BarChart3, label: "สถิติ" },
    { path: "/settings", icon: Settings, label: "ตั้งค่า" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-card via-card to-card border-t border-border shadow-lg z-50 backdrop-blur-sm">
      <div className="flex justify-around items-center h-16 max-w-screen-xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 group",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-b-full animate-scale-in" />
              )}
              <Icon className={cn(
                "h-5 w-5 mb-1 transition-all duration-300",
                isActive ? "scale-110" : "group-hover:scale-110"
              )} />
              <span className={cn(
                "text-xs font-medium transition-all duration-300",
                isActive && "font-bold"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
