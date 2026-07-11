import { TrainFront } from "lucide-react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeProvider } from "@/hooks/use-theme";
import { SearchPage } from "@/pages/SearchPage";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <div className="min-h-screen bg-background text-foreground">
          <header className="border-b border-border">
            <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4">
              <div className="flex items-center gap-2">
                <TrainFront className="size-6 text-primary" />
                <span className="text-xl font-bold">Prevoz</span>
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  red vožnje Srbija Voz
                </span>
              </div>
              <ThemeToggle />
            </div>
          </header>

          <main className="mx-auto max-w-4xl px-4 py-8">
            <Routes>
              <Route path="/" element={<SearchPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
