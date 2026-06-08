import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { EntradaForm } from "@/components/forms/EntradaForm";

export const Route = createFileRoute("/entrada")({
  head: () => ({ meta: [
    { title: "Entrada de Estoque — Controle Paraguay" },
    { name: "description", content: "Registre uma nova entrada de produtos no estoque." },
  ]}),
  component: EntradaPage,
});

function EntradaPage() {
  const navigate = useNavigate();
  return (
    <div className="lg:px-8 lg:py-8 lg:max-w-2xl lg:mx-auto">
      <div className="lg:rounded-2xl lg:border lg:bg-card lg:overflow-hidden h-[calc(100dvh-3.5rem)] lg:h-auto">
        <EntradaForm onDone={() => navigate({ to: "/" })} />
      </div>
    </div>
  );
}
