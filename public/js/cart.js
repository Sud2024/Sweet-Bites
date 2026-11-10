(() => {
  const products = new Map([...chocolateMenu, ...candleMenu, hamper].map(item => [item.name, item]));
  const storageKey = 'sweet-bites-cart-v1';
  const money = value => '₹' + value.toLocaleString('en-IN');
  let cart = new Map();

  function total(items) {
    return [...items].reduce((sum, [name, qty]) => sum + products.get(name).price * qty, 0);
  }

  function loadCart() {
    try {
      const entries = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const valid = new Map();
      for (const [name, qty] of entries) {
        if (products.has(name) && Number.isSafeInteger(qty) && qty > 0) valid.set(name, qty);
      }
      if (Number.isSafeInteger(total(valid))) cart = valid;
    } catch { /* The current page can still use its in-memory cart. */ }
  }

  const toolbar = document.createElement('div');
  toolbar.className = 'cart-toolbar';
  toolbar.innerHTML = `
    <span role="status" class="cart-status"></span>
    <div class="cart-actions">
      <button type="button" class="btn btn--light" data-open-cart aria-haspopup="dialog">Cart (<span data-cart-count>0</span>)</button>
      <button type="button" class="btn" data-checkout aria-haspopup="dialog">Order on WhatsApp</button>
    </div>`;
  const catalogue = document.getElementById('catalogue');
  if (catalogue) catalogue.append(toolbar);
  else document.querySelector('[data-product-menu]').before(toolbar);

  document.body.insertAdjacentHTML('beforeend', `
    <dialog class="order-dialog" id="shopping-cart" aria-labelledby="cart-heading">
      <header><h2 id="cart-heading">Your cart</h2>
        <form method="dialog"><button class="dialog-close" aria-label="Close cart">×</button></form>
      </header>
      <ul class="cart-items"></ul>
      <p class="cart-total" aria-live="polite"></p>
      <button type="button" class="btn" data-checkout aria-haspopup="dialog">Order on WhatsApp</button>
    </dialog>
    <dialog class="order-dialog" id="order-details" aria-labelledby="order-heading">
      <header><h2 id="order-heading">Delivery details</h2>
        <form method="dialog"><button class="dialog-close" aria-label="Close delivery details">×</button></form>
      </header>
      <form class="checkout-form">
        <label>Your name<input name="customer" autocomplete="name" required /></label>
        <label>WhatsApp number<input type="tel" name="phone" autocomplete="tel" required /></label>
        <label>Delivery address<textarea name="address" rows="3" autocomplete="street-address" required></textarea></label>
        <p class="checkout-total"></p>
        <p>Review and send your order in WhatsApp.</p>
        <button type="submit" class="btn">Order</button>
      </form>
    </dialog>`);

  const review = document.getElementById('shopping-cart');
  const checkout = document.getElementById('order-details');
  const form = checkout.querySelector('.checkout-form');
  const status = toolbar.querySelector('[role="status"]');

  function renderCart() {
    const count = [...cart.values()].reduce((sum, qty) => sum + qty, 0);
    toolbar.querySelector('[data-cart-count]').textContent = count;
    const estimate = [...cart.keys()].some(name => products.get(name).startingPrice);
    const summary = (estimate ? 'Estimated total from ' : 'Total ') + money(total(cart));
    const empty = cart.size === 0;
    for (const button of document.querySelectorAll('[data-checkout], .checkout-form [type="submit"]')) {
      button.disabled = empty;
    }
    review.querySelector('.cart-items').innerHTML = [...cart].map(([name, qty]) => {
      const item = products.get(name);
      const prefix = item.startingPrice ? 'From ' : '';
      return `<li><div><strong>${name}</strong><small>${qty} × ${prefix}${money(item.price)} each</small></div>
        <div><strong>${prefix}${money(item.price * qty)}</strong>
        <button type="button" data-remove="${name}" aria-label="Remove ${name}">Remove</button></div></li>`;
    }).join('');
    review.querySelector('.cart-total').textContent = empty ? 'Your cart is empty.' : summary;
    checkout.querySelector('.checkout-total').textContent = empty ? 'Your cart is empty.' : summary;
    for (const card of document.querySelectorAll('[data-product]')) {
      const qty = cart.get(card.dataset.product);
      let note = card.querySelector('.in-cart');
      if (!note && qty) {
        note = document.createElement('small');
        note.className = 'in-cart';
        card.querySelector('.card-action').after(note);
      }
      if (note) note.textContent = qty ? `In cart: ${qty}` : '';
    }
  }

  function saveCart() {
    try { localStorage.setItem(storageKey, JSON.stringify([...cart])); }
    catch { /* Keep the cart usable if browser storage is unavailable. */ }
    renderCart();
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-open-cart') || button.hasAttribute('data-checkout')) {
      loadCart();
      renderCart();
      if (button.hasAttribute('data-open-cart')) review.showModal();
      else if (cart.size) checkout.showModal();
      return;
    }
    if (button.hasAttribute('data-remove')) {
      const index = [...review.querySelectorAll('[data-remove]')].indexOf(button);
      loadCart();
      cart.delete(button.dataset.remove);
      saveCart();
      status.textContent = `${button.dataset.remove} removed from cart.`;
      const remaining = review.querySelectorAll('[data-remove]');
      (remaining[Math.min(index, remaining.length - 1)] || review.querySelector('.dialog-close')).focus();
      return;
    }
    const card = button.closest('[data-product]');
    if (!card) return;
    const input = card.querySelector('input[type="number"]');
    if (button.hasAttribute('data-step')) {
      input.value = Math.max(1, (Number(input.value) || 1) + Number(button.dataset.step));
    } else if (button.hasAttribute('data-add-to-cart')) {
      const qty = input.valueAsNumber;
      if (!input.reportValidity() || !Number.isSafeInteger(qty) || qty < 1) {
        input.focus();
        return;
      }
      loadCart();
      const name = card.dataset.product;
      if (!Number.isSafeInteger(total(cart) + products.get(name).price * qty)) {
        status.textContent = 'Please choose a smaller quantity.';
        return;
      }
      cart.set(name, (cart.get(name) || 0) + qty);
      saveCart();
      status.textContent = `Added ${qty} × ${name} to cart.`;
    }
  });

  form.addEventListener('input', event => event.target.setCustomValidity(''));
  form.addEventListener('submit', event => {
    event.preventDefault();
    loadCart();
    renderCart();
    if (!cart.size) return;
    const { customer, phone, address } = form.elements;
    customer.setCustomValidity(customer.value.trim() ? '' : 'Enter your name.');
    address.setCustomValidity(address.value.trim() ? '' : 'Enter your delivery address.');
    const digits = phone.value.trim().replace(/[\s().-]/g, '');
    phone.setCustomValidity(/^\+?\d{7,15}$/.test(digits) ? '' : 'Enter a valid WhatsApp number, including the country code if needed.');
    if (!form.reportValidity()) return;
    const lines = [...cart].map(([name, qty]) => {
      const item = products.get(name);
      const price = (item.startingPrice ? 'from ' : '') + money(item.price);
      return `${qty} × ${name} (${price} each) — ${item.startingPrice ? 'from ' : ''}${money(item.price * qty)}`;
    });
    const message = [
      'Hi Sweet Bites, I would like to order:', ...lines,
      checkout.querySelector('.checkout-total').textContent, '',
      'Name: ' + customer.value.trim(), 'WhatsApp: ' + phone.value.trim(),
      'Delivery address: ' + address.value.trim()
    ].join('\n');
    window.open('https://wa.me/919925135476?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
  });

  function refresh() {
    loadCart();
    renderCart();
  }
  window.addEventListener('pageshow', refresh);
  window.addEventListener('storage', event => {
    if (event.key === storageKey || event.key === null) {
      refresh();
      status.textContent = '';
    }
  });
  refresh();
})();
