import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

const TITULO = "Acesso da equipe — Andrade Cardoso Advocacia";
const DESCRICAO =
  "Área restrita do escritório Andrade Cardoso: painel administrativo, CRM e automações de atendimento.";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: TITULO },
      { name: "description", content: DESCRICAO },
      { property: "og:title", content: TITULO },
      { property: "og:description", content: DESCRICAO },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/painel" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const senha = String(form.get("senha"));
    setCarregando(true);

    if (modo === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      setCarregando(false);
      if (error) return toast.error("E-mail ou senha inválidos.");
      navigate({ to: "/painel" });
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        emailRedirectTo: window.location.origin,
        data: { nome: String(form.get("nome") ?? "") },
      },
    });
    setCarregando(false);
    if (error) return toast.error(error.message);
    if (!data.session) {
      toast.success("Conta criada. Confirme o e-mail para acessar o painel.");
      return;
    }
    navigate({ to: "/painel" });
  }

  async function entrarComGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Não foi possível entrar com o Google.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/painel" });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -left-40 size-[520px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 size-[420px] rounded-full bg-primary/5 blur-[120px]" />
      </div>
      <div className="relative w-full max-w-md rounded-2xl glass p-8">
        <p className="eyebrow text-brass-2">Área restrita</p>
        <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight">
          Painel Andrade Cardoso
        </h1>
        <p className="mt-2 text-sm text-cream/60">
          Acesso exclusivo da equipe ao CRM, follow-ups e automações.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          {modo === "criar" && (
            <label className="block">
              <span className="eyebrow text-muted-foreground">Nome</span>
              <input
                name="nome"
                required
                className="mt-2 w-full rounded-xl bg-ink/40 px-4 py-2.5 text-sm text-cream ring-1 ring-border focus:outline-none focus:ring-primary/50"
              />
            </label>
          )}
          <label className="block">
            <span className="eyebrow text-muted-foreground">E-mail</span>
            <input
              name="email"
              type="email"
              required
              className="mt-2 w-full rounded-xl bg-ink/40 px-4 py-2.5 text-sm text-cream ring-1 ring-border focus:outline-none focus:ring-primary/50"
            />
          </label>
          <label className="block">
            <span className="eyebrow text-muted-foreground">Senha</span>
            <input
              name="senha"
              type="password"
              required
              minLength={6}
              className="mt-2 w-full rounded-xl bg-ink/40 px-4 py-2.5 text-sm text-cream ring-1 ring-border focus:outline-none focus:ring-primary/50"
            />
          </label>
          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {modo === "entrar" ? "Entrar" : "Criar acesso"}
          </button>
        </form>

        <button
          type="button"
          onClick={entrarComGoogle}
          className="mt-3 w-full rounded-full glass-soft py-3 text-sm font-medium text-cream/85 transition-transform hover:-translate-y-0.5"
        >
          Continuar com o Google
        </button>

        <button
          type="button"
          onClick={() => setModo(modo === "entrar" ? "criar" : "entrar")}
          className="mt-6 w-full text-center text-xs text-muted-foreground hover:text-cream"
        >
          {modo === "entrar" ? "Ainda não tem acesso? Criar conta" : "Já tem acesso? Entrar"}
        </button>
      </div>
    </div>
  );
}
