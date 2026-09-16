// Configurações do catálogo público — edite aqui o nome da loja e o WhatsApp.

export const catalogoConfig = {
  nome: "Giany",
  slogan: "Perfumes árabes, cosméticos e cama & mesa",
  // Só números, com DDI e DDD. Ex.: "5567999998888".
  // Vazio: o botão abre o WhatsApp para a cliente escolher o contato.
  whatsapp: (import.meta.env?.VITE_WHATSAPP_CATALOGO as string | undefined) ?? "",
};

export function linkWhatsApp(mensagem: string) {
  const numero = catalogoConfig.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
