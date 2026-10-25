document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.nav a[href], .mobile-links a[href]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = new URL(link.href, window.location.href);
      const current = new URL(window.location.href);
      const targetId = target.hash.slice(1);
      const destination = targetId ? document.getElementById(targetId) : null;

      if (target.origin !== current.origin || target.pathname !== current.pathname || !destination || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      event.preventDefault();
      destination.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      history.pushState(null, '', target.hash);
    });
  });

  const whatsappNumber = '919925135476';

  document.querySelectorAll('.product').forEach((product) => {
    const action = product.querySelector('.card-action');
    const productName = product.querySelector('h3')?.textContent.trim();
    const priceText = action?.querySelector('.price')?.textContent.trim();
    const actionLink = action?.querySelector('a');
    if (!action || !productName || !priceText || !actionLink) return;

    const unitPrice = Number(priceText.replace(/[^0-9]/g, ''));
    if (!unitPrice) return;

    const quantityControl = document.createElement('div');
    quantityControl.className = 'quantity-control';
    quantityControl.setAttribute('role', 'group');
    quantityControl.setAttribute('aria-label', `Quantity for ${productName}`);
    quantityControl.innerHTML = `
      <button type="button" aria-label="Decrease quantity for ${productName}" data-quantity="decrease">−</button>
      <input type="number" min="1" value="1" inputmode="numeric" aria-label="Quantity for ${productName}">
      <button type="button" aria-label="Increase quantity for ${productName}" data-quantity="increase">+</button>`;

    const input = quantityControl.querySelector('input');
    const normaliseQuantity = () => {
      const quantity = Math.max(1, Number.parseInt(input.value, 10) || 1);
      input.value = quantity;
      return quantity;
    };

    quantityControl.addEventListener('click', (event) => {
      const control = event.target.closest('button[data-quantity]');
      if (!control) return;
      const currentQuantity = normaliseQuantity();
      input.value = control.dataset.quantity === 'increase' ? currentQuantity + 1 : Math.max(1, currentQuantity - 1);
    });
    input.addEventListener('change', normaliseQuantity);

    action.insertBefore(quantityControl, actionLink);
    actionLink.textContent = 'Order on WhatsApp';
    actionLink.classList.add('whatsapp-order');
    actionLink.href = `https://wa.me/${whatsappNumber}`;
    actionLink.target = '_blank';
    actionLink.rel = 'noopener noreferrer';
    actionLink.addEventListener('click', (event) => {
      event.preventDefault();
      const quantity = normaliseQuantity();
      const total = (unitPrice * quantity).toLocaleString('en-IN');
      const message = `Hi Sweet Bites, I'd like to order ${quantity} × ${productName} (${priceText} each). Total: ₹${total}.`;
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    });
  });
});
