import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={theme === "dark" ? "Uključi svetlu temu" : "Uključi tamnu temu"}
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
