import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Lead = Tables<"leads">;
type Interacao = Tables<"interacoes">;

const ETAPAS: { valor: Lead["status"]; rotulo: string }[] = [
  { valor: "contato", rotulo: "Contato" },
  { valor: "qualificado", rotulo: "Qualificado" },
  { valor: "proposta", rotulo: "Proposta" },
  { valor: "contrato", rotulo: "Contrato" },
  { valor: "perdido", rotulo: "Perdido" },
];

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Painel e CRM — Andrade Cardoso Advocacia" },
      {
        name: "description",
        content:
          "Painel administrativo do escritório: funil de clientes, follow-ups e automações de e-mail e WhatsApp.",
      },
      { property: "og:title", content: "Painel e CRM — Andrade Cardoso Advocacia" },
      {
        property: "og:description",
        content: "Funil de clientes, follow-ups e automações de atendimento.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Painel,
});

function Painel() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [selecionado, setSelecionado] = useState<string | null>(null);

  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
  });

  const leadAtual = leads.find((l) => l.id === selecionado) ?? leads[0] ?? null;

  const { data: interacoes = [] } = useQuery({
    queryKey: ["interacoes", leadAtual?.id],
    enabled: !!leadAtual,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interacoes")
        .select("*")
        .eq("lead_id", leadAtual!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Interacao[];
    },
  });

  const atualizarStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Lead["status"] }) => {
      const { error } = await supabase.from("leads").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Etapa atualizada.");
    },
    onError: () => toast.error("Não foi possível atualizar a etapa."),
  });

  const registrarInteracao = useMutation({
    mutationFn: async ({
      lead,
      canal,
      conteudo,
      dias,
    }: {
      lead: Lead;
      canal: Interacao["canal"];
      conteudo: string;
      dias: number;
    }) => {
      const { error } = await supabase.from("interacoes").insert({
        lead_id: lead.id,
        canal,
        conteudo,
        automatica: true,
      });
      if (error) throw error;
      const proximo = new Date(Date.now() + dias * 86_400_000).toISOString();
      const { error: e2 } = await supabase
        .from("leads")
        .update({ proximo_followup: proximo })
        .eq("id", lead.id);
      if (e2) throw e2;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["interacoes"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Automação registrada e próximo follow-up agendado.");
    },
    onError: () => toast.error("Não foi possível registrar a automação."),
  });

  const total = leads.reduce((s, l) => s + Number(l.valor_estimado ?? 0), 0);
  const emAberto = leads.filter((l) => l.status !== "perdido" && l.status !== "contrato").length;
  const vencendo = leads.filter(
    (l) => l.proximo_followup && new Date(l.proximo_followup) <= new Date(Date.now() + 86_400_000),
  );

  async function sair() {
    await supabase.auth.signOut();
    qc.clear();
    navigate({ to: "/" });
  }

  function mensagemPadrao(lead: Lead, canal: "email" | "whatsapp") {
    const saudacao = `Olá, ${lead.nome.split(" ")[0]}`;
    return canal === "email"
      ? `${saudacao}. Aqui é a equipe do escritório Andrade Cardoso. Recebemos seu contato sobre ${lead.area.toLowerCase()} e preparamos uma análise inicial do caso. Podemos conversar ainda esta semana?`
      : `${saudacao}! Equipe Andrade Cardoso Advocacia. Seguimos acompanhando seu caso de ${lead.area.toLowerCase()} — posso te enviar os próximos passos por aqui?`;
  }

  return (
    <div className="relative min-h-screen bg-background px-6 py-10 text-cream">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -left-40 size-[520px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow text-brass-2">Painel administrativo</p>
            <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight">
              Comando do escritório
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-full glass-soft px-4 py-2 text-sm text-cream/80 hover:text-cream"
            >
              Ver site
            </Link>
            <button
              onClick={sair}
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Sair
            </button>
          </div>
        </header>

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Indicador titulo="Leads no funil" valor={String(leads.length)} />
          <Indicador titulo="Em aberto" valor={String(emAberto)} />
          <Indicador titulo="Receita potencial" valor={brl(total)} />
          <Indicador titulo="Follow-ups em 24h" valor={String(vencendo.length)} />
        </div>

        <div className="mt-6 grid grid-cols-12 gap-6">
          <section className="col-span-12 rounded-2xl glass p-6 lg:col-span-7">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-medium">Funil de clientes</p>
              <span className="text-[11px] text-muted-foreground">Atualizado agora</span>
            </div>
            <div className="space-y-3">
              {ETAPAS.map((etapa) => {
                const qtd = leads.filter((l) => l.status === etapa.valor).length;
                const pct = leads.length ? Math.round((qtd / leads.length) * 100) : 0;
                return (
                  <div key={etapa.valor} className="flex items-center gap-4">
                    <span className="w-24 shrink-0 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      {etapa.rotulo}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-cream/10">
                      <div
                        className="h-full rounded-full bg-primary/70"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm font-medium">
                      {String(qtd).padStart(2, "0")}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 space-y-2">
              <p className="mb-3 text-sm font-medium">Clientes e captação</p>
              {leads.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => setSelecionado(lead.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                    leadAtual?.id === lead.id ? "bg-cream/10" : "hover:bg-cream/5"
                  }`}
                >
                  <span className="flex-1">
                    <span className="block text-sm">{lead.nome}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {lead.area} · {brl(Number(lead.valor_estimado ?? 0))}
                    </span>
                  </span>
                  <select
                    value={lead.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      atualizarStatus.mutate({
                        id: lead.id,
                        status: e.target.value as Lead["status"],
                      })
                    }
                    className="rounded-full bg-ink/60 px-3 py-1 text-[11px] text-cream ring-1 ring-border focus:outline-none"
                  >
                    {ETAPAS.map((e) => (
                      <option key={e.valor} value={e.valor}>
                        {e.rotulo}
                      </option>
                    ))}
                  </select>
                </button>
              ))}
              {leads.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum lead ainda. Os contatos enviados pelo site aparecem aqui.
                </p>
              )}
            </div>
          </section>

          <aside className="col-span-12 space-y-6 lg:col-span-5">
            <div className="rounded-2xl glass p-6">
              <p className="mb-4 text-sm font-medium">Próximos follow-ups</p>
              <ul className="space-y-3">
                {leads
                  .filter((l) => l.proximo_followup)
                  .sort(
                    (a, b) =>
                      new Date(a.proximo_followup!).getTime() -
                      new Date(b.proximo_followup!).getTime(),
                  )
                  .slice(0, 5)
                  .map((l) => (
                    <li key={l.id} className="flex items-center gap-3">
                      <span className="size-2 shrink-0 rounded-full bg-brass-2" />
                      <span className="flex-1 text-sm text-cream/75">
                        {l.nome} — {l.area}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(l.proximo_followup!).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </li>
                  ))}
                {leads.every((l) => !l.proximo_followup) && (
                  <li className="text-sm text-muted-foreground">Nenhum follow-up agendado.</li>
                )}
              </ul>
            </div>

            {leadAtual && (
              <div className="rounded-2xl glass p-6">
                <p className="eyebrow text-brass-2">Automação de atendimento</p>
                <h2 className="mt-3 font-serif text-2xl font-semibold tracking-tight">
                  {leadAtual.nome}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {leadAtual.email ?? "sem e-mail"} · {leadAtual.telefone ?? "sem telefone"}
                </p>
                {leadAtual.mensagem && (
                  <p className="mt-4 rounded-xl bg-ink/40 p-3 text-sm text-cream/70">
                    {leadAtual.mensagem}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  <a
                    href={`mailto:${leadAtual.email ?? ""}?subject=${encodeURIComponent(
                      "Andrade Cardoso Advocacia — seu caso",
                    )}&body=${encodeURIComponent(mensagemPadrao(leadAtual, "email"))}`}
                    onClick={() =>
                      registrarInteracao.mutate({
                        lead: leadAtual,
                        canal: "email",
                        conteudo: mensagemPadrao(leadAtual, "email"),
                        dias: 3,
                      })
                    }
                    className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  >
                    Resposta por e-mail
                  </a>
                  <a
                    href={`https://wa.me/55${(leadAtual.telefone ?? "").replace(/\D/g, "")}?text=${encodeURIComponent(
                      mensagemPadrao(leadAtual, "whatsapp"),
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() =>
                      registrarInteracao.mutate({
                        lead: leadAtual,
                        canal: "whatsapp",
                        conteudo: mensagemPadrao(leadAtual, "whatsapp"),
                        dias: 2,
                      })
                    }
                    className="rounded-full glass-soft px-4 py-2 text-sm font-medium text-cream/85"
                  >
                    Follow-up WhatsApp
                  </a>
                  <button
                    onClick={() =>
                      registrarInteracao.mutate({
                        lead: leadAtual,
                        canal: "automacao",
                        conteudo: "Sequência de follow-up agendada para 7 dias.",
                        dias: 7,
                      })
                    }
                    className="rounded-full glass-soft px-4 py-2 text-sm font-medium text-cream/85"
                  >
                    Agendar sequência
                  </button>
                </div>

                <ul className="mt-6 space-y-3 border-t border-border pt-4">
                  {interacoes.map((i) => (
                    <li key={i.id} className="text-sm text-cream/70">
                      <span className="mr-2 rounded-md bg-primary/15 px-2 py-0.5 text-[10px] uppercase text-brass-2">
                        {i.canal}
                      </span>
                      {i.conteudo}
                      <span className="ml-2 text-[11px] text-muted-foreground">
                        {new Date(i.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </li>
                  ))}
                  {interacoes.length === 0 && (
                    <li className="text-sm text-muted-foreground">
                      Nenhuma interação registrada para este cliente.
                    </li>
                  )}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function Indicador({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-2xl glass p-5">
      <p className="eyebrow text-muted-foreground">{titulo}</p>
      <p className="mt-2 font-serif text-2xl font-semibold">{valor}</p>
    </div>
  );
}
