# Contexto do projeto Lýsi (lysi-helpdesk) — handoff para novo chat

Cole esta mensagem inteira na primeira mensagem do chat novo aberto nesta pasta, para o Claude ter todo o contexto sem eu precisar reexplicar.

## O que é este projeto

`lysi-helpdesk` é um projeto **novo e separado**, criado a partir de um fork do projeto `helpdesk-ige` (pasta `c:\Users\HTS\Downloads\helpdesk-ige`), simplificado para um caso de uso mais restrito: uma ferramenta interna onde o time de **Suporte** registra chamados que **já foram concluídos** (não é um sistema de abertura/aprovação/fila de chamados, é um registro/histórico de atendimentos feitos).

Nome/marca: **Lýsi** (Λύση = "solução" em grego). Tagline: "Support, solved."

## Stack (igual ao helpdesk-ige)

- Next.js (App Router, v16.2.9, webpack dev)
- Prisma ORM + `@prisma/adapter-pg` + PostgreSQL
- NextAuth v5 beta (JWT, Credentials provider)
- Tailwind CSS v4
- shadcn/ui + Radix UI

**IMPORTANTE**: leia `AGENTS.md` na raiz do projeto antes de mexer em código — essa versão do Next.js tem breaking changes vs. o conhecimento de treinamento do modelo, e há docs relevantes em `node_modules/next/dist/docs/`.

## Diferenças em relação ao helpdesk-ige (o que foi tirado/mudado)

- Só 2 roles: `ADMIN` e `SUPPORT` (sem outras).
- **Sem workflow de aprovação, sem status "Aguardando Vínculo", sem prioridade/SLA/prazo.** Um chamado, ao ser criado pelo Suporte, já nasce concluído — é só um registro do que foi feito.
- **Sem e-mail** (nada de Resend, nada de preview de e-mail, nada é enviado).
- **Sem fluxo de Criação de Usuário / Desligamento de Usuário** (isso existia no helpdesk-ige; foi decidido deixar para uma fase futura, não implementar agora).
- `Category` virou `Subject` ("Assunto") — sem a flag `manualOnly` que existia no helpdesk-ige, porque aqui **todo** chamado é manual.
- Comentários/anexos em cada chamado foram mantidos (para o Suporte anotar o que fez e anexar prints como "prova"), mas sem thread de resposta, sem reações, sem marcação de nota interna/pública (não existe essa distinção aqui).
- Dashboard mantido, adaptado: sem card de "tempo médio de resolução" (não faz sentido sem workflow), com KPIs de total de chamados, chamados hoje, assunto mais comum, atendente mais ativo, gráficos por mês/dia, por assunto, por atendente.
- Tela de Usuários simplificada: só login básico (nome, e-mail, senha, cargo Admin/Suporte) — sem os campos extras que o helpdesk-ige tinha (posição, departamento, telefone, data de nascimento etc.).

## Modelos Prisma atuais

`User`, `Subject`, `Ticket`, `Comment`, `Attachment`. Enum `Role { ADMIN, SUPPORT }`. Sem `Approval`, sem `TicketUserCreation`, sem os campos de workflow que existem no helpdesk-ige.

## Ambiente local

- Banco Postgres separado via Docker (`docker-compose.yml`), porta **5434** (o helpdesk-ige usa 5433, para não conflitar).
- `.env` com `DATABASE_URL` apontando pra esse banco, `AUTH_SECRET` gerado do zero (não compartilhado com o helpdesk-ige).
- Seed cria um admin: `admin@lysi.com` / `admin123`, e os 10 "assuntos" padrão que já estavam definidos.
- Dev server roda normalmente com `npm run dev` na porta 3000.

## Status atual (já feito e validado)

1. ✅ Scaffold copiado do helpdesk-ige e simplificado.
2. ✅ `.env`, docker-compose (porta/DB nova) e `.gitignore` configurados.
3. ✅ Schema Prisma reescrito e migrado (`prisma/migrations/20260812144348_init`).
4. ✅ Código de aprovação, e-mail, wizard multi-step e telas não usadas removidos.
5. ✅ Fluxo único de criação de chamado (assunto + título + descrição + anexos) reconstruído, componente `NewTicketDialog` reutilizável (usado tanto na tela de Chamados quanto no Dashboard).
6. ✅ Tela/API de Usuários simplificada (login simples).
7. ✅ Dashboard ajustado (métricas novas, sem tempo médio de resolução).
8. ✅ Sidebar/nav ajustada para as 2 roles: Chamados, Dashboard (todos) + Administrador → Usuários, Assuntos (admin only).
9. ✅ Migração/seed rodados, `npx tsc --noEmit` sem erros, smoke test manual completo passou (login → criar chamado → adicionar nota → ver detalhe → deletar chamado), incluindo checagem de todas as rotas principais (200 OK).

## O que falta (próximos passos combinados, nessa ordem)

1. **Branding/identidade visual Lýsi** (PRÓXIMO PASSO, ainda não iniciado). Especificação completa:
   - Cor primária: Indigo `#4F46E5` (o app hoje ainda está com o esquema visual antigo do helpdesk-ige — verde `#008A83` / vermelho `#d53320` — como placeholder temporário, precisa trocar).
   - Paleta de cores de status definida no briefing original (pedir para o usuário reenviar se não estiver disponível no histórico).
   - Tipografia: Inter/Manrope.
   - Logo/símbolo: um "Λ" (lambda) estilizado combinando check + bolha de chat — precisa virar favicon e wordmark da sidebar (hoje só tem texto "Lýsi" como placeholder em `app/layout.tsx`, `app/(auth)/layout.tsx`, tela de login e `dashboard-shell.tsx`).
   - Tagline: "Support, solved."
   - Ajustes de espaçamento/raio/componentes conforme o spec detalhado que o usuário forneceu (buscar no histórico da conversa anterior se necessário, pois o documento completo de branding foi colado em uma mensagem anterior).
   - **Isso foi propositalmente deixado por último**, para validar a funcionalidade primeiro sem mexer em cor/fonte no meio da reestruturação do schema.
2. **Criar repositório no GitHub e push**: repo `https://github.com/Spinelli666/lysi-helpdesk.git` (o usuário disse que criaria o repo manualmente pelo GitHub antes). Ainda não foi feito `git init`/commit/push neste projeto.
3. **Hospedagem/deploy**: usuário pediu "mesmo tipo de setup" que o helpdesk-ige usa em produção — ainda não detalhado/confirmado, verificar como o helpdesk-ige está hospedado antes de replicar.
4. (Fase futura, não agora) Fluxos estruturados de Criação de Usuário / Desligamento de Usuário — o usuário decidiu adiar isso explicitamente.

## Pendência secundária do outro projeto (helpdesk-ige, não deste)

Existe uma lista de ~9 cargos ambíguos/agrupados (ex: "MÉDICO (e variações)", "MOTORISTA (e variações)") que ficou pendente de expansão na lista de CARGOS do helpdesk-ige — só relevante se o usuário voltar a falar sobre isso, não é deste projeto.

---

**Instrução para o novo chat**: continue a partir daqui. O próximo passo natural é perguntar ao usuário se ele quer seguir agora para o rebrand (passo 1 acima) ou revisar o app funcional primeiro.
