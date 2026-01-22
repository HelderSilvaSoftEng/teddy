# 🍞 Toast/Snackbar - Sistema de Notificações

## 📋 Visão Geral

Sistema de notificações (Toast) implementado com **React Context API** para feedback de ações do usuário.

---

## 🎯 Funcionalidades

- ✅ **4 tipos de toast**: `success`, `error`, `warning`, `info`
- ✅ **Auto-dismiss**: Desaparece automaticamente após 3 segundos
- ✅ **Stack vertical**: Múltiplos toasts aparecem em sequência
- ✅ **Fechar manual**: Botão para fechar o toast
- ✅ **Animações suaves**: Slide-in/out
- ✅ **Responsivo**: Adapta-se a telas menores
- ✅ **TypeScript**: Totalmente tipado

---

## 📦 Arquivos Criados

### 1. **Toast Context**

```
apps/frontend/src/presentation/contexts/toast.context.tsx
```

- Gerencia estado global dos toasts
- Hooks: `useToast()` e `useToastState()`

### 2. **Toast Container Component**

```
apps/frontend/src/adapters/components/common/toast-container.tsx
apps/frontend/src/adapters/components/common/toast-container.css
```

- Renderiza todos os toasts
- Estilos com animações

### 3. **Integrações**

```
apps/frontend/src/main.tsx           - ToastProvider wrapper
apps/frontend/src/app/app.tsx        - ToastContainer component
```

---

## 🚀 Como Usar

### 1. **Em um Componente React**

```typescript
import { useToast } from '../presentation/contexts';

export function MyComponent() {
  const { addToast } = useToast();

  const handleSuccess = () => {
    addToast('Ação concluída com sucesso!', 'success');
  };

  const handleError = () => {
    addToast('Ocorreu um erro!', 'error');
  };

  return (
    <>
      <button onClick={handleSuccess}>Sucesso</button>
      <button onClick={handleError}>Erro</button>
    </>
  );
}
```

### 2. **Exemplos de Uso**

```typescript
// Sucesso
addToast('Cliente criado com sucesso!', 'success');

// Erro
addToast('Falha ao deletar cliente', 'error');

// Aviso
addToast('Esta ação não pode ser desfeita', 'warning');

// Informação
addToast('Dados carregados', 'info');

// Com duração customizada (em ms)
addToast('Mensagem rápida', 'success', 1000);

// Toast sem auto-dismiss (duração = 0)
addToast('Clique para fechar', 'info', 0);
```

---

## 🎨 Tipos de Toast

| Tipo | Cor | Ícone | Uso |
|------|-----|-------|-----|
| `success` | Verde (#4CAF50) | ✓ | Ações bem-sucedidas |
| `error` | Vermelho (#f44336) | ✕ | Erros e falhas |
| `warning` | Laranja (#ff9800) | ⚠ | Avisos e confirmações |
| `info` | Azul (#2196F3) | ℹ | Informações gerais |

---

## 📍 Posicionamento

- **Padrão**: Canto superior direito (top: 20px, right: 20px)
- **Responsivo**: Adapta-se em telas menores (left: 10px, right: 10px)
- **Z-index**: 9999 (acima de todos os elementos)

---

## ⏱️ Tempos de Exibição

- **Padrão**: 3000ms (3 segundos)
- **Customizável**: Passar como terceiro parâmetro
- **Permanente**: Passar 0 para não desaparecer

---

## 🔧 API Completa

### `useToast()`

```typescript
interface UseToastReturn {
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}
```

### `useToastState()`

```typescript
interface UseToastState {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}
```

---

## 📝 Exemplo Completo

```typescript
import { useToast } from '../presentation/contexts';

export function LoginForm() {
  const { addToast } = useToast();

  const handleLogin = async (email: string, password: string) => {
    try {
      // Fazer login
      addToast('Login realizado com sucesso!', 'success');
      // Redirecionar...
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'Erro ao fazer login',
        'error'
      );
    }
  };

  return (
    // Seu formulário aqui
  );
}
```

---

## 🎯 Exemplo já Implementado

A página de clientes já está usando toasts:

```typescript
// apps/frontend/src/adapters/components/pages/customers-page.tsx

addToast(`Cliente "${newCustomer.name}" criado com sucesso!`, 'success');
addToast('Cliente atualizado com sucesso!', 'success');
addToast('Cliente deletado com sucesso!', 'success');
addToast(message, 'error');
```

---

## 🎨 Customizações Futuras

Se desejar customizar:

### 1. **Cores**

Editar em `toast-container.css`:

```css
.toast.toast-success {
  border-left-color: #YOUR_COLOR;
}
```

### 2. **Duração Padrão**

Editar em `toast.context.tsx`:

```typescript
const duration = 3000; // Mudar para 5000, por exemplo
```

### 3. **Posição**

Editar em `toast-container.css`:

```css
.toast-container {
  top: 20px;      /* Mudar para bottom, left, etc */
  right: 20px;
}
```

### 4. **Animações**

Adicionar novas animações em `toast-container.css`

---

## ✅ Checklist de Implementação

- [x] Toast Context criado
- [x] Toast Container component criado
- [x] Estilos CSS implementados
- [x] Animações funcionando
- [x] ToastProvider integrado em main.tsx
- [x] ToastContainer integrado em app.tsx
- [x] Exemplo de uso em CustomersPage
- [x] TypeScript totalmente tipado
- [x] Documentação completa

---

## 🚀 Próximos Passos

1. Adicionar toasts em outros componentes conforme necessário
2. Customizar cores/estilos conforme design do projeto
3. Considerar adicionar ações aos toasts (Desfazer, Tentar novamente, etc)
4. Adicionar testes unitários

---

**Implementado em**: 22 de janeiro de 2026
