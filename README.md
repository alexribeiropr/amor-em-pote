# 🍰 Amor em Pote - Doces Artesanais

Aplicativo web completo, moderno, responsivo e mobile-first para microempreendedores que vendem **bolo de pote**. O sistema possui duas áreas distintas: **Área do Cliente** (para pedidos rápidos via WhatsApp com reserva de estoque) e **Área do Administrador** (para controle de vendas, estoque em tempo real e despacho de pedidos).

---

## 🚀 Funcionalidades Principais

### 👤 Área do Cliente
1. **Vitrine de Sabores**:
   - Fotos apetitosas, nome, descrição, categoria e preço em R$.
   - **Controle de Estoque em Tempo Real**: se o estoque for 0, o produto exibe a tag *"Esgotado"* e o botão de compra é desabilitado. Se o estoque estiver abaixo de 5 unidades, exibe o alerta *"Últimas X unidades! 🔥"*.
   - Filtro por categorias (*Tradicionais, Especiais, Premium, Frutas*) e barra de busca instantânea.
   - Barra flutuante de carrinho no celular com resumo do subtotal.

2. **Carrinho de Compras**:
   - Ajuste de quantidade (+ / -) com **limite travado no estoque disponível** (o cliente nunca consegue pedir mais do que há em estoque).
   - Cálculo automático de subtotal, taxa de entrega estimada e total.
   - Remoção individual de itens e aviso de carrinho vazio.

3. **Checkout Completo**:
   - Coleta de dados: Nome, WhatsApp com DDD, Endereço completo (Rua, Número, Bairro, Complemento e Ponto de Referência).
   - Opções de Pagamento: **PIX**, **Cartão** ou **Dinheiro** (com campo para troco).
   - Campo para observações especiais do pedido (ex: *"Sem granulado"*).

4. **Automação ao Enviar o Pedido**:
   - **Débito Automático do Estoque**: o sistema dá baixa imediata nos produtos comprados e registra o motivo no histórico de auditoria.
   - **Chama o WhatsApp do Vendedor**: abre automaticamente uma conversa com mensagem pré-formatada contendo todos os dados do cliente, itens, total, endereço e ID do pedido.
   - **Chuva de Confetes 🎉** e redirecionamento para a tela de confirmação do pedido com botão para reabrir o WhatsApp caso necessário.

---

### 🧑‍🍳 Área do Administrador (Protegida por Senha)
Acesso via botão discreto no rodapé ou pelo link `/admin`. Senha inicial padrão: **`admin123`** (configurável no painel).

1. **Dashboard de Vendas**:
   - Faturamento total do **Dia**, da **Semana** e do **Mês**.
   - Contador de pedidos pendentes (*Novos* ou *Em preparo*).
   - **Alerta de Estoque Baixo (< 5 unidades)** com atalho para reposição imediata.
   - Listagem dos últimos pedidos recebidos.

2. **Gestão de Estoque & Sabores**:
   - Listagem em cards com foto, preço e quantidade.
   - **Ajustes Rápidos de Estoque**: botões de incremento/decremento rápido (`-1`, `+1`, `+5`) com atualização instantânea.
   - **Cadastrar Novo Sabor**: formulário com nome, descrição, preço, estoque inicial, categoria e URL da foto (com sugestões de fotos pré-configuradas).
   - **Edição e Exclusão** de sabores.
   - **Histórico de Entradas e Saídas**: trilha de auditoria completa com data, horário, quantidade movimentada, saldo resultante e motivo (ex: *"Saída automática - Pedido #PED-1001"*, *"Devolução por cancelamento"*, etc.).

3. **Gestão de Pedidos**:
   - Filtro por abas: *Todos, Novo, Em preparo, Enviado, Entregue, Cancelado*.
   - Exibição de endereço detalhado, ponto de referência, forma de pagamento e observações do cliente.
   - **Fluxo de Status**: `Novo` ➔ `Em preparo` ➔ `Enviado 🛵` ➔ `Entregue ✅`.
   - **Botão "Falar com cliente no WhatsApp"**: abre o WhatsApp do cliente com mensagem pré-formatada contendo a confirmação do pedido, valor, forma de pagamento, endereço e tempo estimado de entrega.
   - **Regra de Cancelamento**: ao cancelar um pedido, o sistema **DEVOLVE automaticamente as unidades ao estoque** e registra a devolução no histórico! Ao marcar como entregue, não devolve.

4. **Configurações da Loja**:
   - Edição do nome da loja, WhatsApp do vendedor, taxa de entrega, chave PIX, tempo estimado de entrega e alteração da senha de acesso.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, Vite, TailwindCSS (paleta artesanal em tons de chocolate, rosa e baunilha).
- **Ícones**: Lucide React.
- **Roteamento**: React Router DOM (v6).
- **Efeitos visuais**: Canvas Confetti & Google Fonts (Pacifico & Quicksand).
- **Backend**: Node.js + Express.
- **Persistência Híbrida Inteligente**:
  - Salva em arquivo JSON persistente (`server/data/store.json`) quando o backend Express estiver rodando.
  - Possui **Fallback Automático para LocalStorage**: caso você rode apenas o frontend ou publique estático na Vercel/Netlify, o app continua funcionando 100% de forma autônoma!

---

## 💻 Como Rodar o Projeto Localmente

### Pré-requisitos
- Node.js instalado (versão 18 ou superior).

### Passo a Passo

1. Abra o terminal na pasta do projeto:
```bash
cd "amor-em-pote"
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o sistema completo (Frontend + Backend juntos):
```bash
npm run dev
```

4. Abra no navegador:
- **Área do Cliente**: `http://localhost:5173/`
- **Área do Administrador**: `http://localhost:5173/admin` (Senha: `admin123`)

---

## 🌐 Como Publicar Online Gratuitamente

### Opção 1: Vercel (Recomendado - 100% Grátis em 2 Minutos)

Como o sistema conta com suporte a dados locais no navegador via fallback automático, você pode subir o app na Vercel imediatamente:

1. Crie uma conta gratuita em [vercel.com](https://vercel.com).
2. Suba a pasta do projeto para o seu GitHub (ou instale o utilitário `npm i -g vercel`).
3. No painel da Vercel, clique em **"Add New Project"** e selecione o repositório.
4. A Vercel detectará automaticamente as configurações do Vite:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Clique em **Deploy**! Em instantes seu aplicativo estará online com link HTTPS próprio.

---

### Opção 2: Backend Completo no Render.com (Grátis) + Frontend na Vercel

Se você quiser que os pedidos e o estoque fiquem sincronizados na nuvem entre diferentes aparelhos:

1. **Backend no Render**:
   - Crie uma conta no [Render.com](https://render.com).
   - Clique em **New Web Service** e conecte seu repositório.
   - Defina o **Build Command** como `npm install`.
   - Defina o **Start Command** como `npm run server`.
   - Copie a URL gerada (ex: `https://meu-amor-em-pote.onrender.com`).
2. **Frontend na Vercel**:
   - Configure a URL base da API no frontend apontando para seu serviço do Render.

---

## 📱 Como Gerar o APK Android

O projeto já está configurado com o **Capacitor** e uma rotina de compilação automática na nuvem com **GitHub Actions** (você não precisa instalar 15GB de Android Studio nem Java no seu computador!).

### Opção A: Gerar o APK na Nuvem (100% Grátis pelo GitHub Actions)

1. Suba este projeto para um repositório no seu **GitHub**:
```bash
git init
git add .
git commit -m "Amor em Pote - App Completo"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/amor-em-pote.git
git push -u origin main
```

2. No seu repositório no GitHub, clique na aba **"Actions"**.
3. O fluxo **"Gerar APK Android"** iniciará automaticamente.
4. Quando a execução terminar (cerca de 2 a 3 minutos), clique na execução e baixe o arquivo **`Amor-em-Pote-APK`** na seção *Artifacts*.
5. Pronto! Basta enviar o arquivo `.apk` para o seu celular Android e instalar!

---

### Opção B: Instalação Direta no Celular via PWA (Sem precisar de APK!)

O aplicativo já conta com **Web App Manifest** e ícone oficial:
1. Abra o link do app no navegador do celular (ex: Google Chrome).
2. Toque nos **3 pontinhos** do navegador no canto superior.
3. Toque em **"Adicionar à tela inicial"** ou **"Instalar aplicativo"**.
4. O app será instalado na hora no celular com o ícone do bolo de pote 🍰, abrindo em tela cheia sem barra de navegador, exatamente como um app da Play Store!

---

### Opção C: Compilar Localmente com Android Studio

Se você tiver o Android Studio instalado:
```bash
npm run cap:build
npm run cap:open
```
No Android Studio, clique em **Build ➔ Build Bundle(s) / APK(s) ➔ Build APK(s)**.

---

## 🧁 Estrutura de Arquivos

```
amor-em-pote/
├── server/
│   ├── index.js              # Servidor Express com APIs de produtos, estoque e pedidos
│   └── data/                 # Pasta de persistência (store.json gerado automaticamente)
├── src/
│   ├── components/
│   │   ├── Navbar.jsx        # Cabeçalho com logo, contador de carrinho e acesso admin
│   │   └── Footer.jsx        # Rodapé artesanal com horários e contatos
│   ├── context/
│   │   └── CartContext.jsx   # Gestão de carrinho e validação de estoque
│   ├── pages/
│   │   ├── client/
│   │   │   ├── Home.jsx      # Vitrine de bolos no pote com filtro e busca
│   │   │   ├── Cart.jsx      # Carrinho com controles + / -
│   │   │   ├── Checkout.jsx  # Formulário, débito de estoque e envio ao WhatsApp
│   │   │   └── OrderConfirmation.jsx # Tela de confirmação e link do WhatsApp
│   │   └── admin/
│   │       ├── AdminLogin.jsx        # Tela de login com senha
│   │       ├── AdminLayout.jsx       # Layout com abas e notificações em tempo real
│   │       ├── AdminDashboard.jsx    # Métricas de vendas e alerta de estoque baixo
│   │       ├── AdminStock.jsx        # CRUD de sabores, botões rápidos e histórico
│   │       ├── AdminOrders.jsx       # Gestão de status e WhatsApp com o cliente
│   │       └── AdminSettings.jsx     # Configurações de telefone, senha e PIX
│   ├── services/
│   │   └── api.js            # Cliente HTTP com fallback transparente para LocalStorage
│   ├── App.jsx               # Definição das rotas do sistema
│   ├── index.css             # Estilos Tailwind e fontes customizadas
│   └── main.jsx              # Ponto de entrada do React
├── index.html                # HTML com fontes Google (Pacifico e Quicksand)
├── tailwind.config.js        # Configuração das cores temáticas
├── vite.config.js            # Configuração do Vite e proxy para o backend
├── vercel.json               # Regras de rewrite para SPA na Vercel
└── package.json              # Scripts e dependências
```

---

🍰 **Feito com amor para adoçar os negócios!**
