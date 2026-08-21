export const ESTAGIOS = [
  "prospeccao",
  "visita_tecnica",
  "proposta",
  "negociacao",
  "fechado_ganho",
  "fechado_perdido",
  "entrega",
  "pos_venda",
] as const;

export const ESTAGIO_LABEL: Record<string, string> = {
  prospeccao: "Prospecção",
  visita_tecnica: "Visita técnica",
  proposta: "Proposta",
  negociacao: "Negociação",
  fechado_ganho: "Fechado (ganho)",
  fechado_perdido: "Fechado (perdido)",
  entrega: "Entrega",
  pos_venda: "Pós-venda",
};

export const TIPOS_VISITA = ["prospeccao", "tecnica", "pos_venda"] as const;
