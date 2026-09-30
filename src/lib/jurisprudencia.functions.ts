import { createServerFn } from "@tanstack/react-start";

export type Decisao = {
  tribunal: string;
  titulo: string;
  data: string;
  url: string;
};

// Chave pública oficial da API Pública do DataJud (CNJ), divulgada pelo próprio CNJ.
const DATAJUD_KEY =
  "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";

const BASES: { sigla: string; indice: string; busca: string }[] = [
  { sigla: "STJ", indice: "api_publica_stj", busca: "https://scon.stj.jus.br/SCON/" },
  { sigla: "TST", indice: "api_publica_tst", busca: "https://jurisprudencia.tst.jus.br/" },
  { sigla: "TJ-PA", indice: "api_publica_tjpa", busca: "https://www.tjpa.jus.br/" },
];

const FALLBACK: Decisao[] = [
  {
    tribunal: "STJ",
    titulo: "Responsabilidade civil do fornecedor por defeito do serviço — jurisprudência firmada.",
    data: "",
    url: "https://scon.stj.jus.br/SCON/",
  },
  {
    tribunal: "TST",
    titulo: "Jornada em regime de sobreaviso e tempo à disposição do empregador.",
    data: "",
    url: "https://jurisprudencia.tst.jus.br/",
  },
  {
    tribunal: "STF",
    titulo: "Competência para execução fiscal de créditos municipais — repercussão geral.",
    data: "",
    url: "https://jurisprudencia.stf.jus.br/pages/search",
  },
];

type Hit = {
  _source?: {
    numeroProcesso?: string;
    classe?: { nome?: string };
    assuntos?: { nome?: string }[];
    orgaoJulgador?: { nome?: string };
    dataAjuizamento?: string;
    dataHoraUltimaAtualizacao?: string;
  };
};

async function consultar(
  base: (typeof BASES)[number],
  termo: string,
): Promise<Decisao[]> {
  const query = termo
    ? { multi_match: { query: termo, fields: ["assuntos.nome", "classe.nome"] } }
    : { match_all: {} };

  const res = await fetch(`https://api-publica.datajud.cnj.jus.br/${base.indice}/_search`, {
    method: "POST",
    headers: {
      Authorization: `APIKey ${DATAJUD_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      size: 3,
      track_total_hits: false,
      query,
      sort: [{ dataHoraUltimaAtualizacao: { order: "desc" } }],
    }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) throw new Error(`${base.sigla} ${res.status}`);

  const json = (await res.json()) as { hits?: { hits?: Hit[] } };
  return (json.hits?.hits ?? []).map((h) => {
    const s = h._source ?? {};
    const assunto = s.assuntos?.[0]?.nome ?? s.classe?.nome ?? "Processo";
    const data = s.dataHoraUltimaAtualizacao ?? s.dataAjuizamento ?? "";
    return {
      tribunal: base.sigla,
      titulo: `${s.numeroProcesso ?? "Processo"} — ${assunto}${
        s.orgaoJulgador?.nome ? ` (${s.orgaoJulgador.nome})` : ""
      }`,
      data: data ? new Date(data).toLocaleDateString("pt-BR") : "",
      url: base.busca,
    };
  });
}

export const buscarJurisprudencia = createServerFn({ method: "GET" })
  .inputValidator((data: { termo?: string }) => ({ termo: (data?.termo ?? "").slice(0, 120) }))
  .handler(async ({ data }): Promise<{ decisoes: Decisao[]; aoVivo: boolean }> => {
    const termo = data.termo.trim();

    const resultados = await Promise.allSettled(BASES.map((b) => consultar(b, termo)));
    const decisoes = resultados
      .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
      .filter((d) => d.titulo.length > 8)
      .slice(0, 8);

    if (decisoes.length === 0) {
      console.error("DataJud indisponível para o termo:", termo);
      return { decisoes: FALLBACK, aoVivo: false };
    }
    return { decisoes, aoVivo: true };
  });
