# Controle de Estoque Paraguay

Sistema mobile-first para controle de estoque de produtos importados do Paraguai.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TanStack Start (file-based routing) + Tailwind 4 + shadcn/ui |
| Backend | Python 3.12 + FastAPI + SQLAlchemy 2 async + Pydantic v2 |
| Banco | PostgreSQL via Supabase (Session Pooler / asyncpg) |
| Migrações | Alembic |
| Storage | Supabase Storage (fotos de produtos) |
| Infra | Docker + EasyPanel |

## Estrutura

```
estoque_gi/
├── backend/             # API FastAPI
│   ├── app/
│   │   ├── api/         # routers
│   │   ├── core/        # config, database, storage
│   │   ├── models/      # SQLAlchemy ORM
│   │   ├── schemas/     # Pydantic
│   │   └── services/    # regras de negócio (custo médio, validações)
│   ├── alembic/         # migrações
│   ├── main.py
│   └── Dockerfile
├── paraguay-wares/      # Frontend React/TanStack Start
│   └── src/
│       ├── routes/
│       ├── components/
│       └── lib/         # api.ts, queries.ts
└── docker-compose.yml
```

## Rodando localmente

### 1. Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# criar .env (ver .env.example) com DATABASE_URL e credenciais Supabase
copy .env.example .env

alembic upgrade head
uvicorn main:app --reload --port 8000
```

- API: http://localhost:8000
- Docs (Swagger): http://localhost:8000/docs

### 2. Frontend

```powershell
cd paraguay-wares
npm install --legacy-peer-deps   # necessário por conflito de peer-deps do @lovable.dev/vite-tanstack-config
copy .env.example .env           # default já aponta para http://localhost:8000/api
npm run dev
```

App: http://localhost:3000

## Variáveis de ambiente

### `backend/.env`

```
DATABASE_URL=postgresql+asyncpg://postgres.<ref>:<senha>@aws-1-<region>.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_SERVICE_KEY=<service_role_key>
SUPABASE_BUCKET=produtos
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080
```

### `paraguay-wares/.env`

```
VITE_API_URL=http://localhost:8000/api
```

## Endpoints principais

| Método | Rota | Descrição |
|---|---|---|
| `GET/POST` | `/api/produtos` | Lista / cria produtos (com entrada inicial opcional) |
| `PUT/DELETE` | `/api/produtos/{id}` | Atualiza / remove |
| `GET/POST` | `/api/movimentacoes` | Histórico / registra entrada, venda, perda, uso_pessoal, ajuste |
| `GET` | `/api/relatorios/dashboard` | Totais para a home |
| `GET` | `/api/relatorios/estoque-baixo` | Produtos abaixo do mínimo |
| `GET` | `/api/relatorios/vendas?de=&ate=` | Vendas agrupadas por dia |
| `POST` | `/api/produtos/{id}/foto` | Upload de foto (multipart, max 5 MB, jpg/png/webp) |

## Regras de negócio

- **Entrada:** atualiza `custo_medio` ponderado: `(custo_atual × qtd_atual + valor_unit × qtd_entrada) / (qtd_atual + qtd_entrada)`.
- **Saída (venda/perda/uso pessoal):** valida estoque, bloqueia com HTTP 422 quando insuficiente.
- **Ajuste:** sobrescreve `quantidade_atual` com o valor informado.
- Tudo dentro de transação com `SELECT ... FOR UPDATE` para evitar race conditions.

## Deploy (EasyPanel + Docker Compose)

O `docker-compose.yml` na raiz publica **dois serviços** na rede Docker externa `easypanel`:

- **`backend`** — FastAPI na porta `8080`; roda as migrações Alembic automaticamente no startup; tem healthcheck em `/health`. Alias interno: `estoque_paraguay_backend`.
- **`frontend`** — build SPA do React (via `vite.config.docker.ts`) servido por **Nginx** na porta `80`; sobe após o backend ficar saudável. Alias interno: `estoque_paraguay_frontend`.

### Passos

1. Configure as variáveis de ambiente no painel do EasyPanel (ver [`.env.example`](.env.example)):
   - Backend: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_BUCKET`, `CORS_ORIGINS`.
   - Frontend (build-time): `VITE_API_URL` apontando para o domínio público do backend, com sufixo `/api`.
2. Suba a stack:
   ```bash
   docker compose up --build
   ```
   `VITE_API_URL` é injetado no build do frontend como `build-arg`; as migrações do banco rodam sozinhas no start do backend.
3. No EasyPanel, exponha o domínio do frontend (porta 80) e o do backend (porta 8080), e garanta que `CORS_ORIGINS` inclua o domínio do frontend.
