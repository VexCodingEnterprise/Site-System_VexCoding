# Rotação de credenciais

O repositório continha `.env` versionado. Mesmo sem registrar os valores antigos, trate todas as credenciais que já estiveram nesse arquivo ou no histórico Git como comprometidas.

## O que rotacionar

- Chave secreta do Supabase: criar uma nova `SUPABASE_SECRET_KEY` no projeto Supabase.
- Chaves públicas do Supabase: revisar e substituir se a política da organização exigir; elas não são segredos, mas devem apontar para o projeto correto.
- `SESSION_SECRET` legado: não é mais usado pelo código e deve ser invalidado/removido dos ambientes.
- Chave secreta do Turnstile: gerar outra no painel Cloudflare Turnstile.
- Credencial do provedor de e-mail legado: revogar se já esteve no `.env`.
- Tokens de Cloudflare, GitHub, bancos ou outros serviços que tenham aparecido no arquivo.

## Procedimento

1. Nos painéis do Supabase e Cloudflare Turnstile, revogue as credenciais antigas.
2. Crie credenciais novas sem enviá-las pelo chat.
3. Configure os valores no ambiente local ignorado e como secrets do Cloudflare Workers.
4. Atualize o Supabase Auth: os parceiros devem ser usuários reais e estar vinculados por `partners.auth_user_id`.
5. Faça um deploy de staging e confirme login, logout, leads, Storage e portal do cliente.

## Histórico Git

O `.env` foi removido do tracking nesta branch, mas isso não apaga o conteúdo de commits antigos. Não faça force push automaticamente. Após a rotação, combine com os responsáveis do repositório uma limpeza revisada do histórico usando `git filter-repo` ou BFG, faça backup e force push somente com autorização explícita da equipe.

## Validação

- `git ls-files .env` não deve retornar arquivo.
- `rg` no código e documentação não deve encontrar valores de secrets.
- O deploy deve funcionar apenas com os secrets novos.
- Uma tentativa de uso de cada credencial antiga deve falhar ou estar revogada.
