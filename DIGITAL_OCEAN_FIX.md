# Digital Ocean Deployment Fix

## Problema Identificado

O erro `bash: line 1: pnpm: command not found` ocorreu porque o Digital Ocean estava tentando usar o gerenciador de pacotes `pnpm`, mas o projeto está configurado para usar `npm`.

## Causa

A ausência do arquivo `package-lock.json` no repositório fez com que o Digital Ocean não conseguisse detectar corretamente qual gerenciador de pacotes usar, resultando na tentativa de usar `pnpm` por padrão.

## Soluções Aplicadas

### 1. Adicionado `package-lock.json`
- Executado `npm install --legacy-peer-deps` para gerar o arquivo `package-lock.json`
- Este arquivo garante que o Digital Ocean saiba que o projeto usa npm

### 2. Atualizado `.do/app.yaml`
- Adicionado `build_command: ""` para indicar que o build deve usar apenas o Dockerfile
- Isso evita que o Digital Ocean tente executar comandos de build fora do container

## Arquivos Alterados

1. **package-lock.json** (novo)
   - Arquivo de lock do npm com todas as dependências
   - Deve ser mantido no controle de versão

2. **.do/app.yaml**
   - Adicionado `build_command: ""`
   - Mantém a configuração de usar apenas o Dockerfile

## Próximos Passos para Deploy

### 1. Push das Alterações
```bash
git push origin main
```

### 2. Verificar no Digital Ocean
O deploy deve iniciar automaticamente após o push. Verifique:
- O build está usando npm (não mais pnpm)
- O Dockerfile está sendo executado corretamente
- As 3 stages do Docker são concluídas com sucesso

### 3. Monitorar os Logs
Acompanhe os logs no painel do Digital Ocean para garantir que:
- `npm ci --legacy-peer-deps` executa com sucesso
- `npm run build` completa sem erros
- O container inicia com `node server.js`

## Estrutura do Build

O projeto usa um Dockerfile multi-stage:

1. **Stage 1 (deps)**: Instala as dependências usando npm
2. **Stage 2 (builder)**: Faz o build da aplicação Next.js
3. **Stage 3 (runner)**: Executa a aplicação em produção

## Verificação de Sucesso

Após o deploy, você deve ver:
- Status: Deploy Successful
- Aplicação acessível na URL fornecida pelo Digital Ocean
- Logs mostrando "Ready started server on 0.0.0.0:3000"

## Troubleshooting

Se ainda houver problemas:

1. **Verificar variáveis de ambiente**
   - Adicione as variáveis necessárias em `.do/app.yaml`
   - Exemplo: `NEXT_PUBLIC_API_URL`

2. **Verificar health check**
   - O health check está configurado para `/` na porta 3000
   - Initial delay: 20 segundos

3. **Verificar recursos**
   - Instance size: basic-xxs
   - Pode precisar aumentar se o build falhar por falta de memória

## Notas Importantes

- **NÃO** adicione `pnpm-lock.yaml` ao projeto
- **SEMPRE** use `npm install --legacy-peer-deps` para atualizar dependências
- **MANTENHA** o `package-lock.json` no controle de versão
- O Dockerfile já está otimizado para produção com output standalone

## Commit Realizado

```
fix: Add package-lock.json and update Digital Ocean config to use npm instead of pnpm
```

Este commit resolve o erro de "pnpm: command not found" garantindo que o Digital Ocean use npm corretamente.
