# 🎨 Frontend - Teddy CRM

Interface visual do sistema de gestão de clientes. Aqui é onde você consegue ver e mexer com tudo que envolve clientes e autenticação.

## 📄 Páginas e Funcionalidades

### 🔐 **Login** (`login-page.tsx`)

- Primeira tela que você vê
- Digita email e senha para entrar
- Email padrão: `admin@teddy.com`
- Senha padrão: `123456`
- Se errar, mostra aviso em vermelho
- Se acertar, leva pra dashboard

### 📊 **Dashboard** (`dashboard-page.tsx`)

- Resume o que está acontecendo no sistema
- Mostra total de clientes ativos
- Mostra clientes que estão selecionados
- Gráfico de tendência (dia/mês)
- Último cliente adicionado
- Porcentagem de clientes selecionados

### 👥 **Clientes** (`customers-page.tsx`)

- Lista de todos os clientes ativos
- Pode fazer 4 coisas com cada cliente:

#### Adicionar aos Selecionados

- Clica no botão "+" do cliente
- Toaster aparece: "Cliente adicionado aos selecionados!"
- Cliente sai da lista de ativos
- Contagem no topo atualiza automaticamente

#### Editar Informações

- Clica no lápis do cliente
- Abre modal para mexer em nome, salário, empresa
- Salva e volta pra lista atualizado

#### Deletar Cliente

- Clica na lixeira do cliente
- Pede confirmação
- Se confirmar, cliente é deletado permanentemente
- Toaster confirma: "Cliente deletado com sucesso!"

#### Remover de Selecionados

- Se o cliente já estava selecionado antes, tem botão "-"
- Clica para tirar dos selecionados
- Volta pra lista de ativos

### ⭐ **Clientes Selecionados** (`selected-customers-page.tsx`)

- Mostra clientes que você marcou como "SELECTED"
- Útil para trabalhar com um grupo específico

#### Remover Individual

- Clica no "-" de um cliente
- Toaster mostra: "Cliente removido dos selecionados!"
- Cliente volta pra lista de ativos

#### Limpar Todos

- Botão no topo que limpa tudo de uma vez
- Toaster mostra: "X cliente(s) removido(s) dos selecionados!"
- Prático pra começar do zero

#### Editar e Deletar

- Funciona igual aos clientes normais
- Lápis pra editar
- Lixeira pra deletar

### 👤 **Usuário** (`user-page.tsx`)

- Mostra suas informações de login
- Número de acessos ao sistema
- Data que criou a conta
- Status (ativo ou não)

### ⏱️ **Teste de Carga** (`load-test-page.tsx`)

- Página técnica pra testar performance
- Simula um monte de requisições
- Mostra quanto tempo demora
- Util pra ver se o sistema aguenta pressão

## 🧩 Estrutura das Pastas

```
src/
├── adapters/               # Como o frontend se conecta com o backend
│   └── components/         # Componentes React (páginas, cards, modais)
├── application/            # Lógica de negócio (use cases)
├── domain/                 # Tipos e interfaces (o que é um cliente, usuário, etc)
├── infra/                  # Repositórios (como busca dados do backend)
└── presentation/           # Contextos (autenticação, toaster, etc)
```

## 🎛️ Funcionalidades Importantes

### 🔔 Toaster (Notificações)

Aquele aviso que aparece no canto da tela:

- **Verde (sucesso)**: Ação deu certo
- **Vermelho (erro)**: Algo deu errado
- **Azul (info)**: Informação importante
- **Amarelo (warning)**: Cuidado com isso

Desaparece automaticamente depois de 3 segundos.

### 🔑 Contextos (Estado Global)

- **AuthContext**: Mantém seus dados de login
- **ToastContext**: Sistema de notificações
- **SelectedCustomersContext**: Rastreia clientes selecionados (se tiver)

### 📡 Comunicação com Backend

- Usa repositórios pra fazer requisições HTTP
- Cada página chama "use cases" que vêm do backend
- Dados são salvos em estado local (React state) pra não piscar a tela

## 🖼️ Componentes Reutilizáveis

### `CustomerCard`

Aquele card que mostra cada cliente com botões de ação

### `Header`

Barra no topo com menu

### `Sidebar`

Menu na lateral com navegação

### `Modals`

Caixas de diálogo:

- `CreateCustomerModal`: Criar novo cliente
- `UpdateCustomerModal`: Editar cliente
- `ConfirmDeleteModal`: Confirmar deletação

## ⚙️ Variáveis de Ambiente

```
VITE_API_URL=http://localhost:3000/api
```

## 🐛 Troubleshooting

### "Não consigo fazer login"

- Verifica se o backend tá rodando em `http://localhost:3000`
- Tenta usar email: `admin@teddy.com` e senha: `123456`

### "Página brancar ou botões não funcionam"

- Abre DevTools (F12) e vê a aba Console
- Se tiver erro vermelho lá, é mais fácil debugar

### "Clientes não atualizam quando add/remove"

- Já foi corrigido!
- Agora atualiza em tempo real sem precisar fazer refresh

### "Toaster não aparece"

- Verifica se o ToastProvider tá envolvendo a app
- Tá em `src/main.tsx`

## 📚 Stack Usado

- **React 19**: Biblioteca pra interfaces
- **TypeScript**: JavaScript com tipos (mais seguro)
- **Vite**: Bundler rápido pra rodar o app
- **React Hook Form**: Formulários fáceis
- **CSS Modular**: Estilos isolados por página

## 🎯 Próximas Melhorias Possíveis

- [ ] Busca/filtro de clientes
- [ ] Paginação com abas (próxima/anterior)
- [ ] Exportar clientes em Excel
- [ ] Modo escuro
- [ ] Confirmar logout
- [ ] Validação de email em tempo real
