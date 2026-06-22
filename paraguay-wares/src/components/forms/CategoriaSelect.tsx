import { useCategorias } from "@/lib/queries";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export function CategoriaSelect({
  value, onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { data: categorias = [] } = useCategorias();
  const nomes = categorias.map((c) => c.nome);
  // Garante que a categoria atual (ex.: produto antigo com categoria fora da lista)
  // continue selecionável.
  const options = value && !nomes.includes(value) ? [value, ...nomes] : nomes;

  return (
    <div>
      <span className="text-sm font-medium block mb-1.5">Categoria</span>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger className="h-12">
          <SelectValue placeholder="Selecione uma categoria" />
        </SelectTrigger>
        <SelectContent>
          {options.map((nome) => (
            <SelectItem key={nome} value={nome}>{nome}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {categorias.length === 0 && (
        <span className="text-xs text-muted-foreground mt-1 block">
          Nenhuma categoria cadastrada — adicione em Configurações.
        </span>
      )}
    </div>
  );
}
