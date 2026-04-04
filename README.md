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
npm install

# Criar o banco de dados
npm run db:push

# Iniciar o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

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
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run db:push` | Aplicar schema ao banco |
| `npm run db:generate` | Gerar migrations |
| `npm run db:studio` | Abrir Drizzle Studio |

## Stack

- Next.js 16 (App Router, TypeScript)
- Drizzle ORM + SQLite (better-sqlite3)
- shadcn/ui + Tailwind CSS
- Zod (validação)
- date-fns (datas)
- Recharts (gráficos)
