import { createServerFn } from "@tanstack/react-start";

export type Decisao = {
  tribunal: string;
  titulo: string;
  data: string;
  url: string;
};

const FALLBACK: Decisao[] = [
  {
    tribunal: "STJ",
    titulo:
      "REsp 2.104.882 — tese firmada sobre responsabilidade civil do fornecedor por defeito do serviço.",
    data: "",
    url: "https://scon.stj.jus.br/SCON/",
  },
  {
    tribunal: "TST",
    titulo:
      "RR-1044-22.2023 — jornada em regime de sobreaviso e integração ao tempo à disposição.",
    data: "",
    url: "https://jurisprudencia.tst.jus.br/",
  },
  {
    tribunal: "STF",
    titulo:
      "ADI 7.120 — repercussão geral sobre competência para execução fiscal de créditos municipais.",
    data: "",
    url: "https://jurisprudencia.stf.jus.br/pages/search",
  },
];

function tag(bloco: string, nome: string): string {
  const m = bloco.match(new RegExp(`<[^>]*${nome}[^>]*>([\\s\\S]*?)</[^>]*${nome}>`, "i"));
  return m?.[1]?.replace(/<[^>]+>/g, "").trim() ?? "";
}

function sigla(texto: string): string {
  const m = texto.match(/\b(STF|STJ|TST|TSE|STM|TRF\s?\d|TJ-?[A-Z]{2}|TRT\s?\d+)\b/i);
  return (m?.[1] ?? "BR").toUpperCase().replace(/\s+/g, "");
}

export const buscarJurisprudencia = createServerFn({ method: "GET" })
  .inputValidator((data: { termo?: string }) => ({ termo: (data?.termo ?? "").slice(0, 120) }))
  .handler(async ({ data }): Promise<{ decisoes: Decisao[]; aoVivo: boolean }> => {
    const termo = data.termo.trim();
    const cql = termo
      ? `tipoDocumento=Jurisprudência and "${termo.replace(/"/g, "")}"`
      : "tipoDocumento=Jurisprudência";
    const url =
      "https://www.lexml.gov.br/busca/SRU?operation=searchRetrieve&version=1.1&maximumRecords=8&query=" +
      encodeURIComponent(cql);

    try {
      const res = await fetch(url, {
        headers: { Accept: "application/xml" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`LexML ${res.status}`);
      const xml = await res.text();
      const registros = xml.split(/<\s*(?:srw:)?record\b/i).slice(1);

      const decisoes: Decisao[] = registros
        .map((bloco) => {
          const titulo = tag(bloco, "title");
          const urn = tag(bloco, "identifier") || tag(bloco, "urn");
          return {
            tribunal: sigla(`${titulo} ${urn} ${tag(bloco, "publisher")}`),
            titulo,
            data: tag(bloco, "date"),
            url: urn.startsWith("http")
              ? urn
              : `https://www.lexml.gov.br/urn/${encodeURIComponent(urn)}`,
          };
        })
        .filter((d) => d.titulo.length > 8)
        .slice(0, 6);

      if (decisoes.length === 0) return { decisoes: FALLBACK, aoVivo: false };
      return { decisoes, aoVivo: true };
    } catch (error) {
      console.error("Falha ao consultar jurisprudência:", error);
      return { decisoes: FALLBACK, aoVivo: false };
    }
  });
