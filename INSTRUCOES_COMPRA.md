# 🛍️ Sistema de Compra - Maison Lumière

## ✨ Funcionalidades Implementadas

### 1. **Carrossel com Navegação Manual** ⭐ NOVO
- Setas **❮** e **❯** para navegar manualmente
- **Clique nas imagens** para ir direto à página do perfume
- Auto-rotação a cada 10 segundos (reseta ao clicar)
- Indicadores de pontos para cada perfume
- **5 perfumes aleatórios** em cada carregamento

### 2. **Ícone do Carrinho**
- Header fixo com ícone de compras (🛍️)
- Contador de itens em tempo real
- Disponível em todas as páginas

### 3. **Adicionar ao Carrinho**
- Botões em cada card de perfume (homepage e catálogo)
- Armazena dados no localStorage
- Notificação de confirmação

### 4. **Modal do Carrinho**
- Clique no ícone 🛍️ para abrir
- Visualizar itens
- Aumentar/diminuir quantidade
- Remover itens
- Cálculo automático de totais

### 5. **Página de Checkout**
- **URL:** `checkout.html`
- Resumo do pedido lado a lado
- Formulário com campos:
  - Nome Completo
  - Email
  - Telefone
  - Endereço
  - Cidade
  - Estado (lista completa do Brasil)
  - CEP
  - Método de Pagamento

### 6. **Confirmação de Pedido**
- Mensagem de sucesso
- Dados salvos no localStorage
- Redirecionamento automático

## 🔄 Fluxo de Compra

1. **Navegue** pelas coleções
2. **Clique** em "Adicionar ao Carrinho"
3. **Clique** no ícone 🛍️ para ver carrinho
4. **Ajuste** quantidades se necessário
5. **Clique** em "Ir para Checkout"
6. **Preencha** o formulário
7. **Clique** em "Finalizar Compra"
8. **Receba** confirmação e redirecionamento

## 🎠 Como Usar o Carrossel

- **Clique nas setas** (❮ ❯) para mudar de perfume manualmente
- **Clique na imagem** para ir para a página do perfume em destaque
- **Clique nos pontos** abaixo para pular para um perfume específico
- O carrossel se auto-rotaciona, mas reseta o timer ao clicar nas setas

## 💾 Dados Armazenados

- **Carrinho:** localStorage > `cart`
- **Pedidos:** localStorage > `orders`

Cada pedido salva:
- Dados do cliente
- Itens comprados
- Data/Hora
- ID único do pedido

## 📱 Responsivo

Design funciona em:
- ✓ Desktop
- ✓ Tablet
- ✓ Mobile

## 🎨 Estética Premium

- Paleta: Preto, Ouro, Rosa Wine
- Tipografia: Playfair Display + Montserrat
- Animações suaves
- Efeitos hover elegantes
- Modal sofisticado

---

**Pronto para vender!** 💎
