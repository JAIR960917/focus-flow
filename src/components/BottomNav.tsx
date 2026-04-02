import { NavLink } from "react-router-dom";
import { CheckSquare, Dumbbell, MapPin } from "lucide-react";

const tabs = [
  { to: "/", icon: CheckSquare, label: "Tarefas" },
  { to: "/treinos", icon: Dumbbell, label: "Treinos" },
  { to: "/corrida", icon: MapPin, label: "Corrida" },
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/60">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-primary scale-105"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
