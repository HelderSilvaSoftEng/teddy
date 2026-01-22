# 📦 Package Manager Configuration - PNPM ONLY

## ⚠️ IMPORTANTE: Este projeto usa **PNPM** exclusivamente

### ❌ NÃO use NPM ou Yarn
- ❌ `npm install` - PROIBIDO
- ❌ `npm run dev` - PROIBIDO
- ❌ `yarn install` - PROIBIDO

### ✅ Use apenas PNPM
- ✅ `pnpm install`
- ✅ `pnpm run dev`
- ✅ `pnpm run test`
- ✅ `pnpm add <package>`

---

## 🔧 Configuração Atual

### Lock Files
- ✅ `pnpm-lock.yaml` - Lock file oficial (monorepo)
- ❌ `package-lock.json` - DELETADO (conflitava com pnpm)
- ❌ `yarn.lock` - NÃO DEVE EXISTIR

### Verificações Implementadas
1. ✅ `package.json` contém `"packageManager": "pnpm@10.28.0"`
2. ✅ `.npmrc` configurado para forçar comportamento de pnpm
3. ✅ Workspace configurado em `pnpm-lock.yaml`

---

## 🎯 Por que PNPM?

### Monorepo (Este Projeto)
- Compartilha dependências entre packages via symlinks
- Lockfile único para toda estrutura
- Reduz tamanho de `node_modules` em ~60%

### Segurança
- Evita que dependências não declaradas sejam instaladas
- Phantom dependencies detectadas
- Strict mode garante integridade

### Performance
- Instalação mais rápida (uso de symlinks)
- Cache inteligente entre projects
- Menor uso de disco

### Problemas Mistos (npm + pnpm)
- Lockfiles conflitam
- Dependências desincronizadas
- Comportamentos inconsistentes entre dev/prod
- Erros aleatórios e difíceis de debugar

---

## 📋 Checklist

- [x] `pnpm-lock.yaml` criado e versionado
- [x] `package-lock.json` deletado
- [x] `packageManager` definido em `package.json`
- [x] `.npmrc` configurado
- [x] Workspace configurado em `pnpm.yaml` (se necessário)
- [x] Documentação adicionada

---

## 🚀 Instalação do PNPM (Se não tem)

```bash
# Via npm (primeira vez)
npm install -g pnpm

# Via npm (atualizar)
npm install -g pnpm@latest

# Via Homebrew (macOS)
brew install pnpm

# Via Chocolatey (Windows)
choco install pnpm

# Verificar instalação
pnpm --version  # Deve ser 10.28.0+
```

---

## 📝 Comandos Comuns

| Tarefa | Comando |
|--------|---------|
| Instalar dependências | `pnpm install` |
| Instalar novo pacote | `pnpm add <pacote>` |
| Instalar dev dependency | `pnpm add -D <pacote>` |
| Atualizar pacote | `pnpm update <pacote>` |
| Remover pacote | `pnpm remove <pacote>` |
| Rodar script | `pnpm run <script>` |
| Dev server | `pnpm run dev` |
| Build | `pnpm run build` |
| Testes | `pnpm run test` |
| Lint | `pnpm run lint` |

---

## 🔍 Verificar Configuração

```bash
# Verificar qual package manager será usado
pnpm config get packageManager

# Listar workspaces
pnpm list -r --depth=0

# Ver espaço em disco economizado
du -sh node_modules
```

---

## ⚡ Performance Tips

1. **Cache Local**
   ```bash
   pnpm store status
   pnpm store prune  # Limpar cache
   ```

2. **Instalação Offline**
   ```bash
   pnpm install --prefer-offline
   ```

3. **Instalação Rápida**
   ```bash
   pnpm install --no-frozen-lockfile
   ```

---

## 🆘 Troubleshooting

### Erro: "Cannot use npm with this project"
**Solução**: Use `pnpm` em vez de `npm`

### Erro: "Missing dependencies"
**Solução**: Execute `pnpm install` de novo

### Erro: "node_modules corrompido"
**Solução**:
```bash
pnpm store prune
rm -rf node_modules
pnpm install
```

### Erro: "Versão diferente de pnpm"
**Solução**:
```bash
pnpm install -g pnpm@10.28.0
pnpm --version  # Verificar
pnpm install
```

---

## 📚 Referências

- Documentação oficial: https://pnpm.io/
- Workspaces: https://pnpm.io/workspaces
- CLI: https://pnpm.io/cli/install
- Troubleshooting: https://pnpm.io/troubleshooting

---

**Última atualização**: 22 de janeiro de 2026
**Configuração Padrão**: pnpm 10.28.0
