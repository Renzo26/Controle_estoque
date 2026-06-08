import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SaidaForm } from "@/components/forms/SaidaForm";

export const Route = createFileRoute("/saida")({
  head: () => ({ meta: [
    { title: "Saída de Estoque — Controle Paraguay" },
    { name: "description", content: "Registre vendas, perdas ou ajustes de saída de produtos." },
  ]}),
  component: SaidaPage,
});

function SaidaPage() {
  const navigate = useNavigate();
  return (
    <div className="lg:px-8 lg:py-8 lg:max-w-2xl lg:mx-auto">
      <div className="lg:rounded-2xl lg:border lg:bg-card lg:overflow-hidden h-[calc(100dvh-3.5rem)] lg:h-auto">
        <SaidaForm onDone={() => navigate({ to: "/" })} />
      </div>
    </div>
  );
}
