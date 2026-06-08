import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [
    { title: "Configurações — Controle Paraguay" },
    { name: "description", content: "Configurações gerais do sistema." },
  ]}),
  component: () => (
    <div className="px-4 lg:px-8 py-5 lg:py-8 max-w-3xl mx-auto w-full">
      <PageHeader title="Configurações" subtitle="Em breve" />
      <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        As preferências do sistema aparecerão aqui — categorias padrão, cotação do dólar, alertas e mais.
      </div>
    </div>
  ),
});
