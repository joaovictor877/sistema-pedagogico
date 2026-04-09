# Historico da conversa - deploy em rede interna

Data: 2026-04-09

## Objetivo
Subir o projeto em um PC para acesso pela rede interna da empresa.

## O que foi identificado
- O erro inicial do Docker era engine parado no Windows.
- O compose original subia apenas PostgreSQL e PgAdmin.
- Para uso em rede por outras pessoas, era necessario adicionar backend + frontend em containers.

## Alteracoes aplicadas
- docker-compose.yml:
  - adicionados servicos backend e frontend
  - frontend publicado na porta 80
  - banco sem exposicao publica de porta
  - healthcheck no Postgres
  - pgadmin como perfil opcional admin
  - pgadmin bound em 127.0.0.1:5050
- backend/src/app.js:
  - CORS ajustado para aceitar lista via FRONTEND_URLS
  - suporte a wildcard (*)
- Novos arquivos:
  - backend/Dockerfile
  - backend/.dockerignore
  - frontend/Dockerfile
  - frontend/.dockerignore
  - frontend/nginx.conf
- README.md:
  - adicionada secao de deploy em rede interna

## Comandos principais
### Subir stack principal
docker compose up -d --build

### Subir PgAdmin opcional
docker compose --profile admin up -d

### Ver status
docker compose ps

### Parar tudo
docker compose down

## Acesso esperado
- App (rede interna): http://IP_DO_PC_SERVIDOR/
- PgAdmin (somente no host local): http://localhost:5050

## Observacoes de seguranca
- Trocar senhas padrao (Postgres, JWT, PgAdmin) antes de uso real.
- Liberar apenas a porta 80/TCP no firewall para usuarios.
- Nao expor banco para toda a rede sem necessidade.

## Nota sobre mudancas inesperadas
Durante o processo apareceram arquivos de migracao Prisma no repositorio. A decisao sobre manter/remover esses arquivos ficou pendente de confirmacao do usuario.
