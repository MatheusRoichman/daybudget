# DayBudget — Referência Técnica

## Arquitetura de Pastas

```
src/
  app/
    page.tsx                        # Dashboard — resumo de campanhas ativas
    layout.tsx                      # Root layout com tema escuro e navegação
    campaigns/
      page.tsx                      # Lista de campanhas (tabs: ativa/futura/encerrada)
      new/page.tsx                  # Formulário de criação de campanha
      [id]/page.tsx                 # Detalhe da campanha + gastos
  lib/
    db/
      schema.ts                     # Schema Drizzle (campaigns, expenses)
      index.ts                      # Cliente Turso (libSQL) + Drizzle
    budget.ts                       # Lógica pura de cálculo de saldo
    validations.ts                  # Schemas Zod para formulários
    format.ts                       # Formatação de moeda e data
    queries.ts                      # Funções de leitura do banco
    actions/
      campaigns.ts                  # Server actions de campanhas
      expenses.ts                   # Server actions de gastos
  components/
    campaigns/                      # Componentes específicos de campanhas
    dashboard/                      # Componentes do dashboard
    ui/                             # shadcn/ui (gerado) + balance-text
drizzle.config.ts                   # Configuração do Drizzle Kit
```

## Lógica de Cálculo (`src/lib/budget.ts`)

### Fórmula Central

```
saldo_disponível = limite_diário × dias_decorridos − total_gasto_até_aqui
```

Onde:
- `limite_diário = valor_total / número_de_dias`
- `dias_decorridos = dias desde startDate até targetDate (inclusive)`
- `total_gasto_até_aqui = soma de todos os gastos até targetDate`

Isso é matematicamente equivalente ao modelo de carry-forward:
```
saldo_hoje = limite_diário + Σ(limite_diário − gastos_do_dia) para todos os dias anteriores
```

### Funções

| Função | Entrada | Saída |
|--------|---------|-------|
| `getCampaignDays(campaign)` | CampaignData | número de dias (inclusive) |
| `getDailyLimit(campaign)` | CampaignData | valor / dias |
| `getCampaignStatus(campaign, today)` | CampaignData, string | "future" \| "active" \| "ended" |
| `getAvailableBalance(campaign, expenses, targetDate)` | CampaignData, ExpenseEntry[], string | saldo disponível |
| `getDailyBreakdown(campaign, expenses, today)` | CampaignData, ExpenseEntry[], string | DailyBreakdown[] |
| `getFinalBalance(campaign, expenses)` | CampaignData, ExpenseEntry[] | saldo final |
| `getDaysRemaining(campaign, today)` | CampaignData, string | dias restantes |
| `getCurrentDay(campaign, today)` | CampaignData, string | dia atual (1-based) |
| `getTotalSpent(expenses)` | ExpenseEntry[] | soma total dos gastos |

### Exemplo

```typescript
const campaign = { amount: 3000, startDate: "2026-04-06", endDate: "2026-04-30" };
// 25 dias → R$ 120/dia

const expenses = [
  { amount: 50, date: "2026-04-06" },
  { amount: 80, date: "2026-04-07" },
];

getAvailableBalance(campaign, expenses, "2026-04-07");
// = 120 * 2 - (50 + 80) = 240 - 130 = R$ 110
```

## Schema do Banco

### Tabela `campaigns`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | INTEGER (PK, auto-increment) | Identificador |
| name | TEXT (NOT NULL) | Nome da campanha |
| amount | REAL (NOT NULL) | Valor total do orçamento |
| start_date | TEXT (NOT NULL) | Data de início (YYYY-MM-DD) |
| end_date | TEXT (NOT NULL) | Data de fim (YYYY-MM-DD) |
| created_at | TEXT (NOT NULL) | Timestamp de criação (ISO 8601) |

### Tabela `expenses`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | INTEGER (PK, auto-increment) | Identificador |
| campaign_id | INTEGER (NOT NULL, FK → campaigns.id, CASCADE) | Campanha associada |
| description | TEXT (NOT NULL) | Descrição do gasto |
| amount | REAL (NOT NULL) | Valor do gasto |
| date | TEXT (NOT NULL) | Data do gasto (YYYY-MM-DD) |
| created_at | TEXT (NOT NULL) | Timestamp de criação (ISO 8601) |

## Banco de Dados

O banco é hospedado no **Turso** (libSQL remoto). As credenciais são lidas das variáveis de ambiente:

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | URL do banco no formato `libsql://<db-name>.turso.io` |
| `DATABASE_AUTH_TOKEN` | Token JWT de autenticação do Turso |

## Migrations

```bash
# Aplicar schema diretamente (dev)
bun run db:push

# Gerar migration SQL
bun run db:generate

# Interface visual do banco
bun run db:studio
```

## Adicionando uma campanha programaticamente

```typescript
import { db } from "@/lib/db";
import { campaigns } from "@/lib/db/schema";

db.insert(campaigns).values({
  name: "Abril 2026",
  amount: 3000,
  startDate: "2026-04-06",
  endDate: "2026-04-30",
}).run();
```

## Decisões Técnicas

### Por que Drizzle ORM?
- Type-safe por padrão com inferência do schema
- Suporta SQLite e PostgreSQL com o mesmo schema (troca de driver)
- Leve e sem overhead de runtime pesado
- Relational queries integradas

### Por que Turso?
- Banco libSQL remoto com baixa latência via réplicas de borda
- Compatível com o driver `@libsql/client` (mesmo protocolo do SQLite)
- Sem necessidade de gerenciar infraestrutura local
- Free tier suficiente para desenvolvimento e uso pessoal

### Por que date-fns?
- Tree-shakeable (importa apenas funções usadas)
- Imutável por padrão
- API funcional que se encaixa bem com funções puras

### Por que funções puras para cálculo?
- Testabilidade: sem dependência de I/O ou estado
- Reusabilidade: mesmas funções usadas em dashboard, lista e detalhe
- Previsibilidade: dado o mesmo input, sempre o mesmo output
