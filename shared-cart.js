(function () {
  const CART_KEY = 'cart';
  const USER_KEY = 'ml_user';
  let cart = [];
  let currentUser = null;
  const pendingLoginActions = [];

  function loadCart() {
    try {
      const stored = localStorage.getItem(CART_KEY);
      cart = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(cart)) {
        cart = [];
      }
    } catch (error) {
      cart = [];
    }
  }

  function loadUser() {
    try {
      const stored = localStorage.getItem(USER_KEY);
      currentUser = stored ? JSON.parse(stored) : null;
      if (currentUser && typeof currentUser.name !== 'string') {
        currentUser = null;
      }
    } catch (error) {
      currentUser = null;
    }
  }

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function saveUser(user) {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Não foi possível salvar o usuário.', error);
    }
  }

  function clearStoredUser() {
    localStorage.removeItem(USER_KEY);
  }

  function isLoggedIn() {
    return Boolean(currentUser && currentUser.name);
  }

  function getCartCount() {
    return cart.reduce((total, item) => total + (item.qty || 0), 0);
  }

  function ensureCartIconAttributes() {
    const icons = document.querySelectorAll('.cart-icon');
    icons.forEach(icon => {
      icon.setAttribute('data-cart-icon', 'true');
    });
  }

  function ensureCartModal() {
    if (document.getElementById('cartModal')) {
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'cartModal';
    modal.className = 'cart-modal';
    modal.innerHTML = [
      '<div class="cart-modal-content">',
      '  <span class="cart-close" onclick="toggleCart()">&times;</span>',
      '  <h2 class="cart-title">Seu Carrinho</h2>',
      '  <div id="cartItemsContainer" class="cart-items"></div>',
      '  <div id="cartTotal" class="cart-total" style="display: none;">',
      '    <span class="cart-total-label">Total:</span>',
      '    <span class="cart-total-value" id="totalValue">R$ 0,00</span>',
      '  </div>',
      '  <button class="checkout-btn" id="checkoutBtn" onclick="goToCheckout()" disabled>Ir para Checkout</button>',
      '</div>'
    ].join('');
    document.body.appendChild(modal);
  }

  function ensureUserArea() {
    document.querySelectorAll('header nav').forEach(nav => {
      if (!nav.querySelector('[data-user-area]')) {
        const cartIcon = nav.querySelector('.cart-icon');
        const userArea = document.createElement('div');
        userArea.className = 'user-area';
        userArea.setAttribute('data-user-area', 'true');
        if (cartIcon) {
          nav.insertBefore(userArea, cartIcon);
        } else {
          nav.appendChild(userArea);
        }
      }
    });
  }

  function updateUserArea() {
    ensureUserArea();
    document.querySelectorAll('[data-user-area]').forEach(area => {
      area.innerHTML = '';

      if (isLoggedIn()) {
        const nameSpan = document.createElement('span');
        nameSpan.className = 'user-name';
        nameSpan.textContent = `Olá, ${currentUser.name}`;
        area.appendChild(nameSpan);

        const logoutBtn = document.createElement('button');
        logoutBtn.type = 'button';
        logoutBtn.className = 'logout-btn';
        logoutBtn.textContent = 'Sair';
        logoutBtn.addEventListener('click', handleLogout);
        area.appendChild(logoutBtn);
      } else {
        const loginBtn = document.createElement('button');
        loginBtn.type = 'button';
        loginBtn.className = 'login-btn';
        loginBtn.textContent = 'Entrar';
        loginBtn.addEventListener('click', () => promptLogin());
        area.appendChild(loginBtn);
      }
    });
  }

  function ensureLoginModal() {
    let modal = document.getElementById('loginModal');
    if (modal) {
      return modal;
    }

    modal = document.createElement('div');
    modal.id = 'loginModal';
    modal.className = 'auth-modal';
    modal.innerHTML = [
      '<div class="auth-modal-content">',
      '  <button type="button" class="auth-close" data-close-login>&times;</button>',
      '  <h2>Entrar na Maison</h2>',
      '  <p>Conecte-se para acessar o carrinho e finalizar suas experiências olfativas.</p>',
      '  <form data-login-form>',
      '    <div class="auth-control">',
      '      <label for="loginName">Nome</label>',
      '      <input id="loginName" name="userName" type="text" placeholder="Ex.: Maria Silva" autocomplete="name" required>',
      '    </div>',
      '    <div class="auth-control">',
      '      <label for="loginEmail">E-mail</label>',
      '      <input id="loginEmail" name="userEmail" type="email" placeholder="voce@exemplo.com" autocomplete="email">',
      '    </div>',
      '    <div class="auth-error" data-login-error></div>',
      '    <div class="auth-actions">',
      '      <button type="submit" class="auth-submit">Continuar</button>',
      '      <button type="button" class="auth-cancel" data-close-login>Cancelar</button>',
      '    </div>',
      '  </form>',
      '</div>'
    ].join('');

    document.body.appendChild(modal);

    const form = modal.querySelector('[data-login-form]');
    if (form) {
      form.addEventListener('submit', handleLoginSubmit);
    }

    modal.querySelectorAll('[data-close-login]').forEach(button => {
      button.addEventListener('click', () => closeLoginModal());
    });

    modal.addEventListener('click', event => {
      if (event.target === modal) {
        closeLoginModal();
      }
    });

    return modal;
  }

  function promptLogin(action) {
    if (typeof action === 'function') {
      pendingLoginActions.push(action);
    }

    const modal = ensureLoginModal();
    if (!modal) return;

    modal.classList.add('active');

    const nameInput = modal.querySelector('#loginName');
    if (nameInput) {
      requestAnimationFrame(() => nameInput.focus());
    }
  }

  function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (!modal) return;
    modal.classList.remove('active');
    const errorElement = modal.querySelector('[data-login-error]');
    if (errorElement) {
      errorElement.textContent = '';
    }
  }

  function handleLoginSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const nameInput = form.userName;
    const emailInput = form.userEmail;
    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const errorElement = form.querySelector('[data-login-error]');

    if (!name) {
      if (errorElement) {
        errorElement.textContent = 'Por favor, informe seu nome para continuar.';
      }
      if (nameInput) {
        nameInput.focus();
      }
      return;
    }

    currentUser = { name, email };
    saveUser(currentUser);
    updateUserArea();
    updateCartCount();
    renderCart();
    closeLoginModal();

    if (typeof window.showToast === 'function') {
      window.showToast(`Bem-vindo(a), ${name}!`, 'success');
    }

    if (pendingLoginActions.length) {
      const actions = pendingLoginActions.splice(0, pendingLoginActions.length);
      actions.forEach(fn => {
        try {
          fn();
        } catch (error) {
          console.error(error);
        }
      });
    }
  }

  function handleLogout() {
    currentUser = null;
    clearStoredUser();
    pendingLoginActions.length = 0;
    cart = [];
    saveCart();
    updateCartCount();
    renderCart();
    updateUserArea();

    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
      cartModal.classList.remove('active');
    }

    if (typeof window.showToast === 'function') {
      window.showToast('Você saiu da sua conta.', 'info');
    }
  }

  function updateCartCount() {
    const count = getCartCount();
    const displayCount = isLoggedIn() ? count : 0;

    document.querySelectorAll('[data-cart-count]').forEach(element => {
      element.textContent = displayCount;
    });

    const legacy = document.getElementById('cartCount');
    if (legacy) {
      legacy.textContent = displayCount;
    }

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
      checkoutBtn.disabled = !isLoggedIn() || count === 0;
    }
    return count;
  }

  function highlightCartIcon() {
    const cartIcon = document.querySelector('[data-cart-icon]');
    if (!cartIcon) return;
    cartIcon.classList.add('cart-pulse');
    setTimeout(() => cartIcon.classList.remove('cart-pulse'), 600);
  }

  function animateAddToCart(trigger) {
    const cartIcon = document.querySelector('[data-cart-icon]');
    if (!cartIcon) return;

    let sourceImage = null;

    if (trigger && trigger instanceof HTMLElement) {
      if (trigger.dataset && trigger.dataset.perfumeImg === 'true') {
        sourceImage = trigger;
      }

      if (!sourceImage) {
        const card = trigger.closest('[data-perfume-card]');
        if (card) {
          sourceImage = card.querySelector('[data-perfume-img]');
        }
      }

      if (!sourceImage && trigger.tagName === 'IMG') {
        sourceImage = trigger;
      }
    }

    if (!sourceImage) {
      sourceImage = document.querySelector('[data-perfume-hero]') || document.querySelector('[data-perfume-img]');
    }

    if (!sourceImage) {
      highlightCartIcon();
      return;
    }

    const sourceRect = sourceImage.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();
    const clone = sourceImage.cloneNode(true);

    clone.style.position = 'fixed';
    clone.style.pointerEvents = 'none';
    clone.style.left = `${sourceRect.left}px`;
    clone.style.top = `${sourceRect.top}px`;
    clone.style.width = `${sourceRect.width}px`;
    clone.style.height = `${sourceRect.height}px`;
    clone.style.zIndex = '2000';
    clone.style.transition = 'transform 0.85s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.85s ease, width 0.85s ease, height 0.85s ease';
    clone.style.borderRadius = window.getComputedStyle(sourceImage).borderRadius || '18px';
    clone.classList.add('flying-cart-image');

    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      const translateX = cartRect.left + cartRect.width / 2 - (sourceRect.left + sourceRect.width / 2);
      const translateY = cartRect.top + cartRect.height / 2 - (sourceRect.top + sourceRect.height / 2);
      clone.style.transform = `translate(${translateX}px, ${translateY}px) scale(0.2)`;
      clone.style.opacity = '0.2';
      clone.style.width = `${sourceRect.width * 0.4}px`;
      clone.style.height = `${sourceRect.height * 0.4}px`;
    });

    clone.addEventListener('transitionend', () => {
      clone.remove();
    }, { once: true });

    highlightCartIcon();
  }

  function parsePrice(value) {
    const normalized = typeof value === 'string' ? value.replace(/[^0-9,]/g, '').replace(',', '.') : value;
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatPrice(value) {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  }

  function renderCart() {
    const container = document.getElementById('cartItemsContainer');
    const totalDiv = document.getElementById('cartTotal');

    if (!container || !totalDiv) return;

    container.innerHTML = '';

    if (cart.length === 0) {
      container.innerHTML = '<div class="cart-empty">Seu carrinho está vazio</div>';
      totalDiv.style.display = 'none';
      return;
    }

    let total = 0;

    cart.forEach((item, index) => {
      const price = parsePrice(item.price);
      const itemTotal = price * (item.qty || 0);
      total += itemTotal;

      const html = [
        '<div class="cart-item">',
        '  <div class="cart-item-info">',
        `    <h4>${item.name}</h4>`,
        `    <p>${item.brand || ''}</p>`,
        '  </div>',
        '  <div class="cart-item-qty">',
        `    <button class="qty-btn" onclick="updateQty(${index}, -1)">−</button>`,
        `    <span>${item.qty || 0}</span>`,
        `    <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>`,
        '  </div>',
        `  <div class="cart-item-price">${formatPrice(itemTotal)}</div>`,
        `  <button class="remove-btn" onclick="removeFromCart(${index})">Remover</button>`,
        '</div>'
      ].join('');
      container.innerHTML += html;
    });

    totalDiv.style.display = 'flex';
    const totalValue = document.getElementById('totalValue');
    if (totalValue) {
      totalValue.textContent = formatPrice(total);
    }
  }

  function addToCart(perfume, trigger) {
    if (!perfume || !perfume.name) {
      return;
    }

    if (!isLoggedIn()) {
      promptLogin(() => addToCart(perfume, trigger));
      return;
    }

    const existingItem = cart.find(item => item.name === perfume.name);
    if (existingItem) {
      existingItem.qty = (existingItem.qty || 0) + 1;
    } else {
      cart.push({ ...perfume, qty: 1 });
    }

    saveCart();
    updateCartCount();
    renderCart();
    animateAddToCart(trigger);

    if (typeof window.showToast === 'function') {
      window.showToast(`${perfume.name} foi adicionado ao carrinho.`, 'success');
    }
  }

  function updateQty(index, change) {
    if (!cart[index]) return;

    const newQty = (cart[index].qty || 0) + change;
    if (newQty <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].qty = newQty;
    }

    saveCart();
    updateCartCount();
    renderCart();
  }

  function removeFromCart(index) {
    if (!cart[index]) return;
    cart.splice(index, 1);
    saveCart();
    updateCartCount();
    renderCart();
  }

  function toggleCart(force) {
    if (!isLoggedIn()) {
      promptLogin(() => toggleCart(force));
      return;
    }

    ensureCartModal();
    const modal = document.getElementById('cartModal');
    if (!modal) return;

    const shouldOpen = typeof force === 'boolean' ? force : !modal.classList.contains('active');
    modal.classList.toggle('active', shouldOpen);

    if (shouldOpen) {
      renderCart();
    }
  }

  function goToCheckout() {
    if (!isLoggedIn()) {
      promptLogin(() => goToCheckout());
      return;
    }

    if (!getCartCount()) {
      if (typeof window.showToast === 'function') {
        window.showToast('Adicione produtos ao carrinho para finalizar.', 'warning');
      }
      return;
    }
    window.location.href = 'checkout.html';
  }

  function getCartItems() {
    return cart.map(item => ({ ...item }));
  }

  function setCartItems(items) {
    if (!Array.isArray(items)) return;
    cart = items.map(item => ({ ...item }));
    saveCart();
    updateCartCount();
    renderCart();
  }

  function clearCart() {
    cart = [];
    saveCart();
    updateCartCount();
    renderCart();
  }

  function initCartUI() {
    ensureCartIconAttributes();
    ensureCartModal();
    ensureUserArea();
    updateUserArea();
    updateCartCount();
    renderCart();
  }

  loadCart();
  loadUser();

  document.addEventListener('DOMContentLoaded', initCartUI);

  window.addToCart = addToCart;
  window.toggleCart = toggleCart;
  window.updateQty = updateQty;
  window.removeFromCart = removeFromCart;
  window.goToCheckout = goToCheckout;
  window.updateCartCount = updateCartCount;
  window.renderCart = renderCart;
  window.getCartItems = getCartItems;
  window.setCartItems = setCartItems;
  window.clearCart = clearCart;
  window.initializeCartUI = initCartUI;
})();
