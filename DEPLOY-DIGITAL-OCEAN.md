# Deploy para Digital Ocean - Guia de Solução

## Problema Resolvido
O erro "Run Command Not Executable" ocorria porque o projeto não tinha um Dockerfile configurado corretamente.

## Arquivos Criados

### 1. `Dockerfile`
- Dockerfile multi-stage otimizado para Next.js
- Usa Node.js 20 Alpine (imagem leve)
- Configura o container com usuário não-root para segurança
- Expõe a porta 3000
- Comando de execução: `node server.js`

### 2. `.dockerignore`
- Exclui arquivos desnecessários do build Docker
- Reduz o tamanho da imagem e tempo de build

### 3. `.do/app.yaml`
- Arquivo de especificação para Digital Ocean App Platform
- Configura health checks, variáveis de ambiente, etc.

### 4. `next.config.ts` (atualizado)
- Adicionado `output: 'standalone'` para gerar build otimizado para Docker

## Como Fazer Deploy na Digital Ocean

### Opção 1: Via Console Web (Recomendado)

1. Acesse [Digital Ocean App Platform](https://cloud.digitalocean.com/apps)
2. Clique em "Create App"
3. Conecte seu repositório GitHub/GitLab
4. A Digital Ocean detectará automaticamente o Dockerfile
5. **IMPORTANTE**: Na configuração do App:
   - Certifique-se que o "Run Command" está vazio ou removido
   - O comando será automaticamente obtido do Dockerfile (CMD ["node", "server.js"])
6. Configure as variáveis de ambiente necessárias:
   - `NEXT_PUBLIC_API_URL` (URL da sua API)
   - Outras variáveis que seu app precisa
7. Clique em "Next" e depois "Create Resources"

### Opção 2: Via CLI do Digital Ocean

```bash
# Instale o CLI (se ainda não tiver)
brew install doctl  # macOS
# ou
snap install doctl  # Linux

# Autentique
doctl auth init

# Faça deploy usando o app.yaml
doctl apps create --spec .do/app.yaml
```

## Variáveis de Ambiente

Configure estas variáveis no painel da Digital Ocean:

```
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_API_URL=https://sua-api.com
# Adicione outras variáveis conforme necessário
```

## Testando Localmente

### Com Docker

```bash
# Build da imagem
docker build -t moday-frontend .

# Run do container
docker run -p 3000:3000 moday-frontend

# Acesse http://localhost:3000
```

### Sem Docker (desenvolvimento)

```bash
npm run dev
```

## Troubleshooting

### Se ainda ocorrer erro "Run Command Not Executable":

1. **No painel da Digital Ocean**, vá em:
   - App Settings → Components → web
   - Procure por "Run Command"
   - **DELETE/REMOVA** qualquer comando customizado
   - Salve as configurações

2. **Verifique o Dockerfile**:
   - O CMD no final do Dockerfile deve estar presente
   - Formato correto: `CMD ["node", "server.js"]`

3. **Rebuild o app**:
   - Force um novo deploy através do console
   - Ou faça um push novo no repositório

### Se o build falhar:

1. Verifique se todas as dependências estão no `package.json`
2. Teste o build localmente: `npm run build`
3. Verifique os logs no painel da Digital Ocean

### Se o app não iniciar:

1. Verifique os logs no painel da Digital Ocean
2. Confirme que a porta 3000 está configurada
3. Verifique se as variáveis de ambiente estão corretas

## Arquitetura do Build

O Dockerfile usa 3 estágios:

1. **deps**: Instala as dependências
2. **builder**: Compila o Next.js
3. **runner**: Executa a aplicação (imagem final)

Isso resulta em uma imagem Docker muito menor e mais segura.

## Próximos Passos

1. Commit e push dos novos arquivos para o repositório
2. Configure o deploy automático na Digital Ocean (CI/CD)
3. Configure um domínio customizado se necessário
4. Configure SSL/HTTPS (automático na Digital Ocean)

## Comandos Úteis

```bash
# Verificar build local
npm run build

# Ver tamanho da imagem Docker
docker images moday-frontend

# Ver logs do container
docker logs <container-id>

# Entrar no container em execução
docker exec -it <container-id> sh
```
