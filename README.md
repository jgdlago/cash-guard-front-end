# Cash Guard Front-end

Front-end Vue 3 + TypeScript do Cash Guard, alinhado ao planejamento do produto.

## Estado atual

A base inicial cobre a Fase 3 do plano no nível de shell de aplicação:

- autenticação por token com backend Laravel/Sanctum;
- dashboard mensal;
- tela de lançamentos;
- tela de categorias;
- tela de origens de pagamento;
- tela de parcelamentos com valores variáveis;
- navegação via Vue Router;
- estado de autenticação com Pinia;
- política de dinheiro em string na entrada e exibição via `amount_cents`/formatadores.

## Requisitos

- Node 20+
- backend rodando em `http://localhost`

## Variáveis de ambiente

Crie um `.env` se quiser sobrescrever a API:

```bash
VITE_API_BASE_URL=http://localhost/api/v1
```

## Scripts

```bash
npm run dev
npm run build
npm run test:unit
npm run lint
```
