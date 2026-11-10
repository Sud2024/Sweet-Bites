const chocolateMenu = [
  { name: 'Plain Chocolate', image: 'plain-chocolate', price: 15, unit: 'piece' },
  { name: 'Dry Fruit Chocolate', image: 'dry-fruit-chocolate', price: 25, unit: 'piece' },
  { name: 'Dates with Almond', image: 'almond-dates', price: 35, unit: 'piece' },
  { name: 'Chocolate Lollipop', image: 'chocolate-lollipop', price: 30, unit: 'piece' },
  { name: 'Chocolate Lollipop with Dry Fruits', image: 'dry-fruit-lollipop', price: 40, unit: 'piece' },
  { name: 'Birthday / Diwali Bar — Simple Design', image: 'celebration-bars', price: 200, unit: 'bar' },
  { name: 'Birthday / Diwali Bar — Detailed Design with Name', image: 'celebration-bars', price: 250, unit: 'bar' },
  { name: 'Plain Small Bar', image: 'plain-small-bar', price: 50, unit: 'bar' },
  { name: 'Dry Fruit Small Bar', image: 'dry-fruit-small-bar', price: 70, unit: 'bar' },
  { name: 'Dry Fruit Sticks', image: 'dry-fruit-sticks', price: 35, unit: 'piece' }
];

const candleMenu = [
  { name: 'Rose Candle', image: 'rose', price: 45, illustrated: true },
  { name: 'Small Urali with Pearls', image: 'pearl-urali', price: 60, illustrated: true },
  { name: 'Daisy Flower Candle', image: 'daisy', price: 35 },
  { name: 'Glass Candle', image: 'glass', price: 350, illustrated: true },
  { name: 'Peacock Urali Candle with 6 Diyas', image: 'peacock-urali', price: 180, unit: 'set' },
  { name: 'Lotus Candle', image: 'lotus', price: 80, illustrated: true }
];

const hamper = {
  name: 'Gift Box',
  image: 'category-gift-boxes',
  description: 'Custom gift hampers available. Each includes a candle, chocolate and mixed dry fruits.',
  price: 280,
  unit: 'hamper',
  startingPrice: true
};

function productCard(product, folder = '') {
  const { name, image, price, unit } = product;
  return `
    <article class="product card" data-product="${name}">
      <img src="assets/images/${folder}${image}.jpg" alt="" loading="lazy" />
      <div class="product-body">
        ${product.illustrated ? '<small>Product illustration</small>' : ''}
        <h3>${name}</h3>
        ${product.description ? `<p>${product.description}</p>` : ''}
        <div class="card-action"${product.startingPrice ? ' data-starting-price' : ''}>
          <span class="menu-price">${product.startingPrice ? 'Starting from ' : ''}<span class="price">₹${price}</span> / ${unit || 'candle'}</span>
          <div class="quantity-control" role="group" aria-label="Quantity for ${name}">
            <button type="button" data-step="-1" aria-label="Decrease quantity for ${name}">−</button>
            <input type="number" min="1" step="1" value="1" required inputmode="numeric" aria-label="Quantity for ${name}" />
            <button type="button" data-step="1" aria-label="Increase quantity for ${name}">+</button>
          </div>
          <button type="button" class="btn" data-add-to-cart>Add to Cart</button>
        </div>
      </div>
    </article>`;
}

for (const grid of document.querySelectorAll('[data-product-menu]')) {
  switch (grid.dataset.productMenu) {
    case 'chocolates':
      grid.innerHTML = chocolateMenu.map(item => productCard(item, 'chocolates/')).join('');
      break;
    case 'candles':
      grid.innerHTML = candleMenu.map(item => productCard(item, 'candles/')).join('');
      break;
    case 'hampers':
      grid.innerHTML = productCard(hamper);
      break;
    case 'featured':
      grid.innerHTML = [
        productCard(chocolateMenu[0], 'chocolates/'),
        productCard(candleMenu.find(item => item.image === 'daisy'), 'candles/'),
        productCard(candleMenu.find(item => item.image === 'peacock-urali'), 'candles/'),
        productCard(hamper)
      ].join('');
      break;
  }
}
