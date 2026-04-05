# DayBudget

Gerenciador de finanças pessoais baseado em **campanhas de orçamento com limite diário acumulativo**.

## O que é?

DayBudget permite criar campanhas de orçamento: você define um valor total e um período de datas. A aplicação calcula automaticamente o limite diário e rastreia seus gastos com saldo acumulativo.

- Se você gastou **menos** que o limite do dia, o saldo restante é adicionado ao dia seguinte
- Se gastou **mais**, o excesso é descontado do dia seguinte

**Exemplo:** R$ 3.000 entre 06/04 e 30/04 = 25 dias = R$ 120/dia
- Dia 06/04: gastou R$ 50 → sobram R$ 70
- Dia 07/04: tem R$ 190 disponíveis (R$ 120 + R$ 70)

## Como instalar

```bash
# Clonar o repositório
git clone <repo-url>
cd daybudget

# Instalar dependências
bun install

# Configurar variáveis de ambiente
cp .env.example .env
# Preencha DATABASE_URL e DATABASE_AUTH_TOKEN com as credenciais do Turso

# Aplicar schema ao banco remoto
bun run db:push

# Iniciar o servidor de desenvolvimento
bun run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Variáveis de ambiente

Crie um arquivo `.env` na raiz com as seguintes variáveis (obrigatórias):

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | URL do banco Turso no formato `libsql://<db-name>.turso.io` |
| `DATABASE_AUTH_TOKEN` | Token de autenticação gerado no painel do Turso |

Para obter essas credenciais, acesse o [painel do Turso](https://app.turso.tech) e crie ou selecione um banco de dados.

## Como usar

### Dashboard (/)
A página inicial mostra um resumo de todas as campanhas ativas, com o saldo agregado disponível hoje. Se alguma campanha está com saldo negativo, um alerta visual é exibido.

### Campanhas (/campaigns)
Lista todas as campanhas organizadas em abas: Ativas, Futuras e Encerradas. Cada card mostra o saldo disponível, limite diário e progresso.

### Criar Campanha (/campaigns/new)
Formulário para criar uma nova campanha com:
- Nome da campanha
- Valor total do orçamento
- Data de início e fim

### Detalhe da Campanha (/campaigns/[id])
Página completa com:
- Saldo disponível hoje (destaque visual)
- Estatísticas: limite diário, orçamento total, total gasto, dias restantes
- Gráfico de linha mostrando a evolução do saldo
- Formulário para adicionar gastos
- Lista de todos os gastos com opção de excluir

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `bun run dev` | Servidor de desenvolvimento |
| `bun run build` | Build de produção |
| `bun run start` | Servidor de produção |
| `bun run db:push` | Aplicar schema ao banco |
| `bun run db:generate` | Gerar migrations |
| `bun run db:studio` | Abrir Drizzle Studio |

## Stack

- Next.js 16 (App Router, TypeScript)
- Drizzle ORM + Turso (libSQL)
- shadcn/ui + Tailwind CSS
- Zod (validação)
- date-fns (datas)
- Recharts (gráficos)
