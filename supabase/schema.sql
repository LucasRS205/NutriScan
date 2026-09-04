-- Schema do Supabase para o projeto NutriScan.
-- Execute este script no SQL Editor do painel do Supabase
-- (Project > SQL Editor > New query > colar e rodar).

create table if not exists analises_nutricionais (
  id uuid primary key,
  nome_produto text,
  calorias numeric,
  acucares numeric,
  sodio numeric,
  gorduras_saturadas numeric,
  status text not null check (status in ('saudavel', 'moderado', 'evitar')),
  texto_bruto_ocr text,
  criado_em timestamptz not null default now(),
  sincronizado_em timestamptz not null default now()
);

-- Índice para consultas por data (útil para telas de histórico/dashboard).
create index if not exists idx_analises_criado_em
  on analises_nutricionais (criado_em desc);

-- ATENÇÃO: este MVP não implementa autenticação de usuário (Supabase Auth),
-- então a política abaixo libera leitura/escrita para a chave "anon".
-- Isso é aceitável para fins de demonstração acadêmica, mas NÃO deve ser
-- usado em produção real. Para produção, seria necessário:
--   1. Ativar Supabase Auth (login por e-mail ou anônimo);
--   2. Adicionar uma coluna "usuario_id uuid" na tabela;
--   3. Trocar as políticas abaixo para restringir por usuario_id = auth.uid().

alter table analises_nutricionais enable row level security;

create policy "Permitir leitura publica (MVP sem autenticacao)"
  on analises_nutricionais
  for select
  using (true);

create policy "Permitir insercao publica (MVP sem autenticacao)"
  on analises_nutricionais
  for insert
  with check (true);

create policy "Permitir atualizacao publica (MVP sem autenticacao)"
  on analises_nutricionais
  for update
  using (true);
