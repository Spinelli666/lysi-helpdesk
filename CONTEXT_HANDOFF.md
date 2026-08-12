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
- Tela de Usuários simplificada: hoje só tem login básico (nome, e-mail, senha, cargo Admin/Suporte) — **ver tarefa pendente abaixo, isso está prestes a mudar**.

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

## TAREFA PENDENTE — próxima coisa a fazer neste chat

Adicionar ao formulário de "Novo usuário" (`app/(dashboard)/admin/users/page.tsx`) os campos abaixo, **todos opcionais** (nenhum obrigatório para salvar):

- **Projeto** — dropdown
- **Unidade** — depende do Projeto escolhido (dropdown/multi-seleção, filtrado pela lista de unidades daquele projeto)
- **Departamento** — campo de texto livre
- **Cargo** — dropdown com lista de cargos pré-definida

Diferente do helpdesk-ige (onde Projeto/Unidade são obrigatórios quando a empresa não é HTS, e Cargo tem lógica condicional por empresa), **aqui em Lýsi não existe conceito de Empresa** — então os 4 campos (Projeto, Unidade, Departamento, Cargo) devem aparecer sempre, mas todos como **opcionais**, sem nenhuma validação bloqueando o salvamento se ficarem em branco.

### Origem dos dados (copiar do helpdesk-ige)

As listas de opções (Projetos, Unidades por projeto, Cargos) já existem prontas no projeto `helpdesk-ige`, no arquivo:
`c:\Users\HTS\Downloads\helpdesk-ige\app\(dashboard)\tickets\user-creation-constants.ts`

Lá tem as constantes `PROJECTS` (17 projetos), `UNITS_BY_PROJECT` (mapa projeto → lista de unidades, ~250+ unidades no total) e `CARGOS` (~299 cargos). A ideia é **reaproveitar essas mesmas listas** aqui em Lýsi (copiar os dados, não precisa reinventar), só que sem a lógica de "Empresa HTS vs IGEDES" que existe lá — aqui é sempre a mesma organização (IGEDES), então os campos Projeto/Unidade/Cargo ficam disponíveis direto, sem depender de uma Empresa selecionada primeiro.

### O que precisa mudar

1. **Schema Prisma** (`prisma/schema.prisma`): adicionar ao model `User` os campos opcionais `project String?`, `unit String[]` (ou `String?` se for single-select — decidir), `department String?`, `position String?`. Gerar migração.
2. **Constantes**: criar um arquivo equivalente a `user-creation-constants.ts` em Lýsi (ex: `app/lib/user-fields-constants.ts`) com `PROJECTS`, `UNITS_BY_PROJECT`, `CARGOS` copiados do helpdesk-ige.
3. **API** (`app/api/users/route.ts` e `app/api/users/[id]/route.ts`): aceitar os novos campos no POST/PATCH, sem exigir nenhum deles.
4. **UI** (`app/(dashboard)/admin/users/page.tsx`): adicionar os 4 campos no formulário de criar/editar usuário, seguindo o mesmo padrão visual de seletor usado no helpdesk-ige (picker com busca para Projeto/Unidade/Cargo), mas sem nenhuma validação obrigatória.
5. Verificar se esses campos precisam aparecer em algum outro lugar (ex: tabela de listagem de usuários, tela de perfil) — decidir com o usuário se for ambíguo.

## Depois dessa tarefa — próximos passos (ordem combinada)

1. Branding/identidade visual Lýsi (Indigo `#4F46E5`, tipografia Inter/Manrope, logo Λ, tagline "Support, solved.") — app hoje ainda está com esquema visual placeholder (verde/vermelho do helpdesk-ige). Buscar o spec completo de branding no histórico da conversa anterior se necessário.
2. Criar repositório no GitHub (`https://github.com/Spinelli666/lysi-helpdesk.git`) e fazer o push — ainda não foi feito `git init`/commit/push neste projeto.
3. Hospedagem/deploy — usuário pediu "mesmo tipo de setup" que o helpdesk-ige usa em produção, ainda não detalhado.
4. (Fase futura, não agora) Fluxos estruturados de Criação de Usuário / Desligamento de Usuário — adiado explicitamente pelo usuário.

---

**Instrução para o novo chat**: comece pela TAREFA PENDENTE acima (adicionar os 4 campos opcionais ao formulário de usuário). Depois de concluir e validar, pergunte ao usuário se quer seguir para o próximo passo (branding).
