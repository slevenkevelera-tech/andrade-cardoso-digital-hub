import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

const AREAS = [
  "Direito Penal",
  "Direito Civil",
  "Direito Trabalhista",
  "Direito Empresarial",
];

export function FormContato() {
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setEnviando(true);
    const { error } = await supabase.from("leads").insert({
      nome: String(form.get("nome") ?? ""),
      email: String(form.get("email") ?? ""),
      telefone: String(form.get("telefone") ?? ""),
      area: String(form.get("area") ?? "Geral"),
      mensagem: String(form.get("mensagem") ?? ""),
      origem: "site",
    });
    setEnviando(false);

    if (error) {
      toast.error("Não conseguimos enviar sua mensagem. Tente novamente.");
      return;
    }
    setEnviado(true);
    toast.success("Mensagem recebida. Respondemos em até 2 horas.");
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl glass p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="eyebrow text-muted-foreground">Nome</span>
          <input
            name="nome"
            required
            placeholder="Seu nome"
            className="mt-2 w-full rounded-xl bg-ink/40 px-4 py-2.5 text-sm text-cream ring-1 ring-border placeholder:text-muted-foreground focus:outline-none focus:ring-primary/50"
          />
        </label>
        <label className="block">
          <span className="eyebrow text-muted-foreground">E-mail</span>
          <input
            name="email"
            type="email"
            required
            placeholder="voce@email.com"
            className="mt-2 w-full rounded-xl bg-ink/40 px-4 py-2.5 text-sm text-cream ring-1 ring-border placeholder:text-muted-foreground focus:outline-none focus:ring-primary/50"
          />
        </label>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="eyebrow text-muted-foreground">WhatsApp</span>
          <input
            name="telefone"
            placeholder="(91) 90000-0000"
            className="mt-2 w-full rounded-xl bg-ink/40 px-4 py-2.5 text-sm text-cream ring-1 ring-border placeholder:text-muted-foreground focus:outline-none focus:ring-primary/50"
          />
        </label>
        <label className="block">
          <span className="eyebrow text-muted-foreground">Área</span>
          <select
            name="area"
            className="mt-2 w-full rounded-xl bg-ink/40 px-4 py-2.5 text-sm text-cream ring-1 ring-border focus:outline-none focus:ring-primary/50"
          >
            {AREAS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="mt-4 block">
        <span className="eyebrow text-muted-foreground">Mensagem</span>
        <textarea
          name="mensagem"
          rows={3}
          placeholder="Descreva brevemente a situação"
          className="mt-2 w-full resize-none rounded-xl bg-ink/40 px-4 py-2.5 text-sm text-cream ring-1 ring-border placeholder:text-muted-foreground focus:outline-none focus:ring-primary/50"
        />
      </label>
      <button
        type="submit"
        disabled={enviando}
        className="mt-5 w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {enviando ? "Enviando…" : enviado ? "Enviar outra mensagem" : "Enviar mensagem"}
      </button>
    </form>
  );
}
