import { createFileRoute, Link } from "@tanstack/react-router";

import { FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp, FaYoutube } from "react-icons/fa";

import { FormContato } from "@/components/site/FormContato";
import { Jurisprudencia } from "@/components/site/Jurisprudencia";
import tribunal from "@/assets/tribunal.jpg";
import socioMaurilo from "@/assets/socio-maurilo.jpg";
import socioLorenzo from "@/assets/socio-lorenzo.jpg";

const TITULO = "Andrade Cardoso Advocacia — Defesa técnica em Cametá e Belém";
const DESCRICAO =
  "Escritório de advocacia com atendimento direto dos sócios, jurisprudência atualizada em tempo real e acompanhamento de cada caso do primeiro contato ao trânsito em julgado.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITULO },
      { name: "description", content: DESCRICAO },
      { property: "og:title", content: TITULO },
      { property: "og:description", content: DESCRICAO },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const AREAS = [
  {
    nome: "Direito Penal",
    texto:
      "Defesa criminal em todas as instâncias: audiências de custódia, habeas corpus, sanações e execução penal. Acompanhamos cada fase do processo com petições próprias e comunicação direta com você.",
  },
  {
    nome: "Direito Civil",
    texto:
      "Contratos, responsabilidade civil, cobranças e recuperação de créditos. Elaboramos e revisamos contratos, ajuizamos ações com estratégia calcada em jurisprudência atualizada e negociamos acordos que preservam seu caixa.",
  },
  {
    nome: "Direito Trabalhista",
    texto:
      "Para empresas, defesa em reclamações, compliance trabalhista e consultoria preventiva. Para trabalhadores, verbas rescisórias, horas extras, assédio e reconhecimento de vínculo, com acordo apenas quando vale a pena.",
  },
  {
    nome: "Direito Empresarial",
    texto:
      "Sócios, contratos societários, governança e compliance para operações de médio e grande porte. Estruturamos negócios, prevenimos litígios e defendemos a empresa quando a briga é inevitável.",
  },
];

const WHATSAPP = "https://wa.me/5591999990000";

function Index() {
  return (
    <div className="min-h-screen bg-background font-sans text-cream">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-40 size-[520px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 size-[460px] rounded-full bg-cream/5 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 size-[420px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <header className="relative z-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl glass">
                <span className="font-serif text-lg font-semibold text-brass-2">AC</span>
              </div>
              <div className="leading-tight">
                <p className="font-serif text-base font-semibold tracking-tight">Andrade Cardoso</p>
                <p className="eyebrow text-muted-foreground">Advocacia</p>
              </div>
            </div>
            <nav className="hidden items-center gap-8 text-sm text-cream/70 md:flex">
              <a href="#areas" className="transition-colors hover:text-cream">
                Áreas
              </a>
              <a href="#socios" className="transition-colors hover:text-cream">
                Sócios
              </a>
              <a href="#jurisprudencia" className="transition-colors hover:text-cream">
                Jurisprudência
              </a>
              <Link to="/painel" className="transition-colors hover:text-cream">
                Painel
              </Link>
            </nav>
            <a
              href="#contato"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              <span className="size-1.5 rounded-full bg-ink/70" />
              Consulta
            </a>
          </div>
        </div>
      </header>

      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 pt-10 pb-20">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-7">
              <div className="rise inline-flex items-center gap-2 rounded-full glass px-3 py-1.5">
                <span className="size-1.5 rounded-full bg-brass-2" />
                <span className="eyebrow text-cream/60">
                  Escritório de advocacia · Cametá e Belém, PA
                </span>
              </div>
              <h1 className="rise mt-7 max-w-[16ch] font-serif text-[clamp(2.6rem,6vw,4.75rem)] font-semibold leading-[0.98] tracking-tight text-balance">
                Defesa técnica com a precisão de quem conhece cada lado do processo.
              </h1>
              <p className="rise mt-6 max-w-[46ch] text-base leading-relaxed text-cream/65 text-pretty sm:text-lg">
                Atendimento direto com os sócios, jurisprudência atualizada em tempo real e um
                painel que organiza cada caso do primeiro contato ao trânsito em julgado.
              </p>
              <div className="rise mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#contato"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  Agendar consulta
                  <span aria-hidden="true">→</span>
                </a>
                <Link
                  to="/painel"
                  className="inline-flex items-center gap-2 rounded-full glass px-5 py-3 text-sm font-medium text-cream/80 transition-transform hover:-translate-y-0.5"
                >
                  Ver painel
                </Link>
              </div>
              <dl className="rise mt-12 grid grid-cols-3 gap-6 border-t border-border pt-6">
                <div>
                  <dt className="eyebrow text-muted-foreground">Casos conduzidos</dt>
                  <dd className="mt-1 font-serif text-2xl font-semibold">1.240</dd>
                </div>
                <div>
                  <dt className="eyebrow text-muted-foreground">Áreas de atuação</dt>
                  <dd className="mt-1 font-serif text-2xl font-semibold">04</dd>
                </div>
                <div>
                  <dt className="eyebrow text-muted-foreground">Tempo médio de resposta</dt>
                  <dd className="mt-1 font-serif text-2xl font-semibold">2h</dd>
                </div>
              </dl>
            </div>
            <div className="col-span-12 lg:col-span-5">
              <div className="rise relative">
                <div className="absolute -inset-3 rounded-3xl bg-primary/10 blur-2xl" />
                <div className="relative rounded-2xl glass p-3">
                  <img
                    src={tribunal}
                    alt="Sala de audiências em madeira escura com luz quente"
                    width={1024}
                    height={1280}
                    className="aspect-[4/5] w-full rounded-xl object-cover"
                  />
                  <div className="mt-3 flex items-center justify-between px-1">
                    <p className="eyebrow text-muted-foreground">Sala de audiências</p>
                    <p className="text-[11px] text-muted-foreground">Belém · PA</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="areas" className="relative z-10 border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-4">
              <p className="eyebrow text-brass-2">Áreas de atuação</p>
              <h2 className="mt-4 max-w-[20ch] font-serif text-3xl font-semibold leading-tight tracking-tight text-balance">
                Especialistas em causas que exigem rigor.
              </h2>
              <p className="mt-4 max-w-[38ch] text-sm leading-relaxed text-cream/55 text-pretty">
                Cada área é conduzida por um sócio, com estratégia própria e acompanhamento
                contínuo.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-8">
              <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-cream/10 ring-1 ring-border sm:grid-cols-2">
                {AREAS.map((a) => (
                  <div
                    key={a.nome}
                    className="bg-ink-2/60 p-6 backdrop-blur-md transition-colors hover:bg-ink-3/70"
                  >
                    <p className="font-serif text-lg font-medium">{a.nome}</p>
                    <p className="mt-2 text-sm leading-relaxed text-cream/55 text-pretty">
                      {a.texto}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="socios" className="relative z-10 border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="eyebrow text-brass-2">Quadro de sócios</p>
              <h2 className="mt-4 max-w-[24ch] font-serif text-3xl font-semibold leading-tight tracking-tight text-balance">
                Quem assina cada estratégia.
              </h2>
            </div>
            <p className="hidden max-w-[30ch] text-sm text-muted-foreground text-pretty sm:block">
              Dois perfis complementares: a experiência do foro e a engenharia da automação.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl glass p-6 transition-transform hover:-translate-y-1">
              <div className="flex items-start gap-5">
                <img
                  src={socioMaurilo}
                  alt="Maurilo Cardoso"
                  loading="lazy"
                  width={816}
                  height={816}
                  className="size-20 shrink-0 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-serif text-2xl font-semibold tracking-tight">
                    Maurilo Cardoso
                  </h3>
                  <p className="mt-1 text-sm font-medium text-brass-2">Delegado OAB/Cametá</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-cream/60 text-pretty">
                Lidera a atuação contenciosa e a relação institucional com a OAB, trazendo a
                leitura da sala de audiências para cada defesa.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full glass-soft px-3 py-1 text-[11px] text-cream/60">
                  Penal
                </span>
                <span className="rounded-full glass-soft px-3 py-1 text-[11px] text-cream/60">
                  Execução
                </span>
              </div>
            </div>
            <div className="rounded-2xl glass p-6 transition-transform hover:-translate-y-1">
              <div className="flex items-start gap-5">
                <img
                  src={socioLorenzo}
                  alt="Lorenzo Cardoso"
                  loading="lazy"
                  width={816}
                  height={816}
                  className="size-20 shrink-0 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-serif text-2xl font-semibold tracking-tight">
                    Lorenzo Cardoso
                  </h3>
                  <p className="mt-1 text-sm font-medium text-brass-2">
                    Engenheiro de Software e Automação
                  </p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-cream/60 text-pretty">
                Constrói o painel, o CRM e as automações de e-mail, WhatsApp e follow-up que
                organizam o escritório.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full glass-soft px-3 py-1 text-[11px] text-cream/60">
                  Automação
                </span>
                <span className="rounded-full glass-soft px-3 py-1 text-[11px] text-cream/60">
                  CRM
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="jurisprudencia" className="relative z-10 border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-4">
              <p className="eyebrow text-brass-2">Jurisprudência</p>
              <h2 className="mt-4 max-w-[20ch] font-serif text-3xl font-semibold leading-tight tracking-tight text-balance">
                Atualizada em tempo real.
              </h2>
              <p className="mt-4 max-w-[38ch] text-sm leading-relaxed text-cream/55 text-pretty">
                Consulta direta à base pública do Conselho Nacional de Justiça (DataJud), que reúne processos e
                decisões do STJ, TST e do Tribunal de Justiça do Pará.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-8">
              <Jurisprudencia />
            </div>
          </div>
        </div>
      </section>

      <section id="contato" className="relative z-10 border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-5">
              <p className="eyebrow text-brass-2">Fale com o escritório</p>
              <h2 className="mt-4 max-w-[18ch] font-serif text-3xl font-semibold leading-tight tracking-tight text-balance">
                Conte seu caso. Respondemos em até 2 horas.
              </h2>
              <a
                href={WHATSAPP}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                <span className="size-2 rounded-full bg-ink/70" />
                WhatsApp direto
              </a>
            </div>
            <div className="col-span-12 lg:col-span-7">
              <FormContato />
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-serif text-lg font-semibold">Andrade Cardoso</p>
              <p className="mt-1 text-sm text-muted-foreground">Advocacia · Cametá e Belém, Pará</p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                className="grid size-10 place-items-center rounded-full glass text-cream/70 transition-colors hover:text-cream"
              >
                IG
              </a>
              <a
                href="https://linkedin.com"
                aria-label="LinkedIn"
                className="grid size-10 place-items-center rounded-full glass text-cream/70 transition-colors hover:text-cream"
              >
                in
              </a>
              <a
                href="https://facebook.com"
                aria-label="Facebook"
                className="grid size-10 place-items-center rounded-full glass text-cream/70 transition-colors hover:text-cream"
              >
                fb
              </a>
              <a
                href="https://youtube.com"
                aria-label="YouTube"
                className="grid size-10 place-items-center rounded-full glass text-cream/70 transition-colors hover:text-cream"
              >
                YT
              </a>
              <a
                href={WHATSAPP}
                aria-label="WhatsApp"
                className="grid size-10 place-items-center rounded-full bg-primary/15 text-brass-2 transition-colors hover:text-cream"
              >
                WA
              </a>
            </div>
          </div>
          <p className="mt-10 text-[11px] text-muted-foreground">
            © 2026 Andrade Cardoso Advocacia. Conteúdo informativo, não constitui aconselhamento
            jurídico.
          </p>
        </div>
      </footer>
    </div>
  );
}
