import { Settings, TrainFront } from "lucide-react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/hooks/use-theme";
import { SearchPage } from "@/pages/SearchPage";
import { SettingsPage } from "@/pages/SettingsPage";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <div className="min-h-screen bg-background text-foreground">
          <header className="border-b border-border">
            <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4">
              <Link to="/" className="flex items-center gap-2">
                <TrainFront className="size-6 text-primary" />
                <span className="text-xl font-bold">Prevoz</span>
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  red vožnje Srbija Voz
                </span>
              </Link>
              <div className="flex items-center gap-1">
                <Button asChild variant="ghost" size="icon" aria-label="Podešavanja">
                  <Link to="/settings">
                    <Settings />
                  </Link>
                </Button>
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-4xl px-4 py-8">
            <Routes>
              <Route path="/" element={<SearchPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
