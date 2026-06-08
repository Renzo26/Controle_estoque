import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Home, Package, ArrowDownToLine, ArrowUpFromLine, BarChart3, History, Settings, Plus, Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { ProductForm } from "@/components/forms/ProductForm";
import { EntradaForm } from "@/components/forms/EntradaForm";
import { SaidaForm } from "@/components/forms/SaidaForm";

const mobileNav = [
  { to: "/", label: "Início", icon: Home },
  { to: "/produtos", label: "Produtos", icon: Package },
  { to: "/entrada", label: "Entrada", icon: ArrowDownToLine },
  { to: "/saida", label: "Saída", icon: ArrowUpFromLine },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
] as const;

const desktopNav = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/produtos", label: "Produtos", icon: Package },
  { to: "/entrada", label: "Entrada de Estoque", icon: ArrowDownToLine },
  { to: "/saida", label: "Saída de Estoque", icon: ArrowUpFromLine },
  { to: "/movimentacoes", label: "Movimentações", icon: History },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
        <div className="h-16 flex items-center px-6 border-b">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold">P</div>
            <div className="leading-tight">
              <div className="font-display font-bold text-sm">Controle Paraguay</div>
              <div className="text-xs text-muted-foreground">Estoque familiar</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {desktopNav.map((item) => {
            const active = pathname === item.to;
            return (
              <Link key={item.to} to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  active ? "bg-primary text-primary-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}>
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 lg:h-16 sticky top-0 z-30 flex items-center justify-between gap-3 px-4 lg:px-6 border-b bg-background/85 backdrop-blur">
          <div className="flex items-center gap-2 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button className="size-10 grid place-items-center rounded-lg hover:bg-muted" aria-label="Menu">
                  <Menu className="size-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <div className="h-16 flex items-center px-6 border-b">
                  <div className="size-9 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold">P</div>
                  <div className="ml-2 leading-tight">
                    <div className="font-display font-bold text-sm">Controle Paraguay</div>
                    <div className="text-xs text-muted-foreground">Estoque familiar</div>
                  </div>
                </div>
                <nav className="p-3 space-y-1">
                  {desktopNav.map((item) => {
                    const active = pathname === item.to;
                    return (
                      <Link key={item.to} to={item.to}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-lg text-sm",
                          active ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted"
                        )}>
                        <item.icon className="size-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
            <div className="font-display font-bold text-base">Controle Paraguay</div>
          </div>
          <div className="hidden lg:block font-display font-semibold text-lg">
            {desktopNav.find((n) => n.to === pathname)?.label ?? "Painel"}
          </div>
          <div className="text-xs text-muted-foreground hidden sm:block">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
          </div>
        </header>

        <main className="flex-1 pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Floating Action Button */}
      <QuickActionFab />

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-20 border-t bg-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5">
          {mobileNav.map((item) => {
            const active = pathname === item.to;
            return (
              <Link key={item.to} to={item.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}>
                <item.icon className={cn("size-5", active && "stroke-[2.5]")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function QuickActionFab() {
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<null | "produto" | "entrada" | "saida">(null);

  return (
    <>
      <div className="fixed right-4 z-30 flex flex-col items-end gap-2 bottom-20 lg:bottom-6">
        {open && (
          <div className="flex flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-2">
            <FabItem label="Novo Produto" onClick={() => { setModal("produto"); setOpen(false); }} icon={Package} />
            <FabItem label="Registrar Entrada" onClick={() => { setModal("entrada"); setOpen(false); }} icon={ArrowDownToLine} />
            <FabItem label="Registrar Saída" onClick={() => { setModal("saida"); setOpen(false); }} icon={ArrowUpFromLine} />
          </div>
        )}
        <button onClick={() => setOpen((o) => !o)}
          className="size-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 grid place-items-center hover:scale-105 active:scale-95 transition-transform"
          aria-label="Ações rápidas">
          <Plus className={cn("size-6 transition-transform", open && "rotate-45")} />
        </button>
      </div>

      <Dialog open={modal === "produto"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-lg p-0 gap-0 h-[100dvh] sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-2xl overflow-hidden [&>button]:hidden">
          <DialogTitle className="sr-only">Novo Produto</DialogTitle>
          <ProductForm onDone={() => setModal(null)} />
        </DialogContent>
      </Dialog>
      <Dialog open={modal === "entrada"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-lg p-0 gap-0 h-[100dvh] sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-2xl overflow-hidden [&>button]:hidden">
          <DialogTitle className="sr-only">Registrar Entrada</DialogTitle>
          <EntradaForm onDone={() => setModal(null)} />
        </DialogContent>
      </Dialog>
      <Dialog open={modal === "saida"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-lg p-0 gap-0 h-[100dvh] sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-2xl overflow-hidden [&>button]:hidden">
          <DialogTitle className="sr-only">Registrar Saída</DialogTitle>
          <SaidaForm onDone={() => setModal(null)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function FabItem({ label, onClick, icon: Icon }: { label: string; onClick: () => void; icon: typeof Plus }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 pl-3 pr-4 h-11 rounded-full bg-card border shadow-md text-sm font-medium hover:bg-muted active:scale-95 transition">
      <Icon className="size-4 text-primary" />
      {label}
    </button>
  );
}
