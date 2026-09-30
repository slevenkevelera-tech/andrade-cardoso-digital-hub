-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'advogado');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuario ve os proprios papeis" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Perfis
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  nome text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Perfis visiveis para autenticados" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuario atualiza o proprio perfil" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Usuario cria o proprio perfil" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Leads / CRM
CREATE TYPE public.lead_status AS ENUM ('contato', 'qualificado', 'proposta', 'contrato', 'perdido');

CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text,
  telefone text,
  area text NOT NULL DEFAULT 'Geral',
  mensagem text,
  origem text NOT NULL DEFAULT 'site',
  status public.lead_status NOT NULL DEFAULT 'contato',
  valor_estimado numeric NOT NULL DEFAULT 0,
  proximo_followup timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Qualquer visitante pode enviar contato" ON public.leads
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Autenticado pode enviar contato" ON public.leads
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Equipe le os leads" ON public.leads
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Equipe atualiza os leads" ON public.leads
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Equipe remove leads" ON public.leads
  FOR DELETE TO authenticated USING (true);

-- Interacoes / automacoes
CREATE TYPE public.canal AS ENUM ('email', 'whatsapp', 'telefone', 'reuniao', 'automacao');

CREATE TABLE public.interacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  canal public.canal NOT NULL DEFAULT 'email',
  automatica boolean NOT NULL DEFAULT false,
  conteudo text NOT NULL,
  criado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interacoes TO authenticated;
GRANT ALL ON public.interacoes TO service_role;
ALTER TABLE public.interacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipe le interacoes" ON public.interacoes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Equipe cria interacoes" ON public.interacoes
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Equipe atualiza interacoes" ON public.interacoes
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Equipe remove interacoes" ON public.interacoes
  FOR DELETE TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER leads_touch BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.leads (nome, email, telefone, area, mensagem, status, valor_estimado, proximo_followup) VALUES
('Ana Beatriz Moraes','ana.moraes@email.com','(91) 98111-2233','Direito Trabalhista','Rescisão indireta em empresa de logística.','qualificado',4200, now() + interval '1 day'),
('Construtora Belém Norte','contato@belemnorte.com.br','(91) 3222-8890','Direito Empresarial','Revisão de contratos societários.','proposta',18500, now() + interval '2 days'),
('Rafael Nunes','rafael.nunes@email.com','(91) 99444-1020','Direito Penal','Defesa em inquérito policial.','contrato',9800, now() + interval '5 days'),
('Marina Tavares','marina.t@email.com','(91) 98777-4455','Direito Civil','Ação de cobrança de aluguéis atrasados.','contato',3100, now() + interval '3 hours'),
('Transportes Cametá','financeiro@transcameta.com','(91) 3333-1212','Direito Trabalhista','Defesa em reclamatória coletiva.','contato',12000, now() + interval '6 hours');
