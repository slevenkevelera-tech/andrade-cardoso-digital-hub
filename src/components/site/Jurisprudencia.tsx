import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { buscarJurisprudencia } from "@/lib/jurisprudencia.functions";

export function Jurisprudencia() {
  const [termo, setTermo] = useState("");
  const [busca, setBusca] = useState("");
  const buscar = useServerFn(buscarJurisprudencia);

  const { data, isFetching } = useQuery({
    queryKey: ["jurisprudencia", busca],
    queryFn: () => buscar({ data: { termo: busca } }),
    staleTime: 60_000,
  });

  return (
    <div className="overflow-hidden rounded-2xl glass">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
        <form
          className="flex flex-1 items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setBusca(termo);
          }}
        >
          <input
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Buscar por tema, tribunal ou tese"
            className="w-full min-w-40 rounded-xl bg-ink/40 px-4 py-2 text-sm text-cream ring-1 ring-border placeholder:text-muted-foreground focus:outline-none focus:ring-primary/50"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Buscar
          </button>
        </form>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span
            className={`size-1.5 rounded-full ${data?.aoVivo === false ? "bg-muted-foreground" : "bg-success"}`}
          />
          {isFetching ? "Consultando…" : data?.aoVivo === false ? "Base local" : "Ao vivo"}
        </span>
      </div>
      <ul className="divide-y divide-border">
        {(data?.decisoes ?? []).map((d, i) => (
          <li key={`${d.url}-${i}`} className="flex items-center gap-4 px-5 py-4">
            <span className="shrink-0 rounded-md bg-primary/15 px-2 py-1 text-[11px] font-medium text-brass-2">
              {d.tribunal}
            </span>
            <a
              href={d.url}
              target="_blank"
              rel="noreferrer"
              className="flex-1 text-sm text-cream/75 text-pretty hover:text-cream"
            >
              {d.titulo}
            </a>
            <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:block">
              {d.data}
            </span>
          </li>
        ))}
        {!data && (
          <li className="px-5 py-8 text-sm text-muted-foreground">Carregando decisões…</li>
        )}
      </ul>
    </div>
  );
}
