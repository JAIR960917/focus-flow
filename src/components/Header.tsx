import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, X, CheckSquare, Dumbbell, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", icon: CheckSquare, label: "Tarefas" },
  { to: "/treinos", icon: Dumbbell, label: "Treinos" },
  { to: "/corrida", icon: MapPin, label: "Corrida" },
];

const Header = () => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-border/60">
      <div className="max-w-4xl mx-auto flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <span className="text-lg font-bold text-foreground tracking-tight">FocusFlow</span>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`
              }
            >
              <l.icon className="w-4 h-4" />
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-lg">
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Alternar tema</span>
          </Button>

          {/* Hamburger (mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden rounded-lg"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <nav className="sm:hidden border-t border-border/60 animate-fade-in">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary"
                }`
              }
            >
              <l.icon className="w-4 h-4" />
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
