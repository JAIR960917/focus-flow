import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, X, CheckSquare, Dumbbell, MapPin, TrendingUp, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const links = [
  { to: "/", icon: CheckSquare, label: "Tarefas" },
  { to: "/treinos", icon: Dumbbell, label: "Treinos" },
  { to: "/corrida", icon: MapPin, label: "Corrida" },
  { to: "/evolucao", icon: TrendingUp, label: "Evolução" },
];

const Header = () => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-border/60">
      <div className="max-w-4xl mx-auto flex items-center justify-between h-14 px-4">
        <span className="text-lg font-bold text-foreground tracking-tight">FocusFlow</span>

        <nav className="hidden sm:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`
              }
            >
              <l.icon className="w-4 h-4" />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {user && (
            <Avatar className="w-7 h-7 mr-1">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          )}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-lg">
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:flex rounded-lg" onClick={signOut}>
            <LogOut className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="sm:hidden rounded-lg" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <nav className="sm:hidden border-t border-border/60 animate-fade-in">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
                }`
              }
            >
              <l.icon className="w-4 h-4" />
              {l.label}
            </NavLink>
          ))}
          <button
            onClick={() => { setOpen(false); signOut(); }}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-destructive w-full"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </nav>
      )}
    </header>
  );
};

export default Header;
