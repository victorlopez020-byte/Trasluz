// ==== CONFIGURACIÓN RÁPIDA ====
const whatsappNumber = "543777216995"; // ← CAMBIA POR TU NÚMERO (con código de país, sin +)
const adminPassword = "1234"; // ← Contraseña del admin (cámbiala si querés)
const mensajeBase = "¡Hola!%20Quiero%20hacer%20este%20pedido%20de%20Trazluz!";

// Productos iniciales (se cargan desde localStorage o estos de ejemplo)
let productos = JSON.parse(localStorage.getItem('productos')) || [
  {
    id: 1,
    nombre: "Remera Negra Básica",
    precio: 18900,
    descripcion: "Remera 100% algodón, talle M",
    categoria: "remeras",
    imagen: "https://via.placeholder.com/300x250/333/fff?text=Remera",
    stock: 10
  },
  {
    id: 2,
    nombre: "Jean Mom Azul",
    precio: 45900,
    descripcion: "Jean mom fit, stretch",
    categoria: "pantalones",
    imagen: "https://via.placeholder.com/300x250/336699/fff?text=Jean",
    stock: 5
  },
  {
    id: 3,
    nombre: "Zapatillas Blancas",
    precio: 78900,
    descripcion: "Zapatillas urbanas, talle 40",
    categoria: "calzado",
    imagen: "https://via.placeholder.com/300x250/fff/000?text=Zapatillas",
    stock: 3
  }
];

// Carrito
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Elementos DOM
const categoriesEl = document.getElementById('categories');
const productsEl = document.getElementById('products');
const searchEl = document.getElementById('search');
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const cartOverlay = document.getElementById('cartOverlay');
const finalizarBtn = document.getElementById('finalizarCompra');
const whatsappLink = document.getElementById('whatsappLink');

// Inicializar
cargarCategorias();
mostrarProductos();
actualizarCarritoUI();

// Categorías automáticas
function cargarCategorias() {
  const cats = [...new Set(productos.map(p => p.categoria))];
  categoriesEl.innerHTML = '<button class="cat-btn active" data-cat="todos">Todos</button>';
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn';
    btn.dataset.cat = cat;
    btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoriesEl.appendChild(btn);
  });

  // Event listeners para categorías
  categoriesEl.addEventListener('click', (e) => {
    if (e.target.classList.contains('cat-btn')) {
      document.querySelector('.cat-btn.active').classList.remove('active');
      e.target.classList.add('active');
      mostrarProductos();
    }
  });
}

// Mostrar productos
function mostrarProductos(filtro = '') {
  const catActiva = document.querySelector('.cat-btn.active').dataset.cat;
  const textoBusqueda = filtro.toLowerCase();

  productsEl.innerHTML = '';
  productos
    .filter(p => (catActiva === 'todos' || p.categoria === catActiva) && p.nombre.toLowerCase().includes(textoBusqueda))
    .forEach(prod => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${prod.imagen}" alt="${prod.nombre}">
        <div class="card-content">
          <h3>${prod.nombre}</h3>
          <p>${prod.descripcion}</p>
          <div class="price">$${prod.precio.toLocaleString()}</div>
          ${prod.stock < 5 ? `<span class="stock-low">¡Pocas unidades!</span>` : ''}
          <button class="btn-add" onclick="agregarAlCarrito(${prod.id})" ${prod.stock === 0 ? 'disabled' : ''}>
            ${prod.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
          </button>
        </div>
      `;
      productsEl.appendChild(card);
    });
}

// Buscador
searchEl.addEventListener('input', (e) => mostrarProductos(e.target.value));

// Carrito functions
function agregarAlCarrito(id) {
  const prod = productos.find(p => p.id === id);
  if (prod.stock === 0) return;

  const itemEnCarrito = carrito.find(item => item.id === id);
  if (itemEnCarrito) {
    if (itemEnCarrito.cantidad >= prod.stock) {
      alert('No hay más stock disponible');
      return;
    }
    itemEnCarrito.cantidad++;
  } else {
    carrito.push({ ...prod, cantidad: 1 });
  }
  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarCarritoUI();
}

function removerDelCarrito(id) {
  carrito = carrito.filter(item => item.id !== id);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarCarritoUI();
  mostrarProductos();
}

function cambiarCantidad(id, delta) {
  const item = carrito.find(item => item.id === id);
  if (item) {
    item.cantidad += delta;
    if (item.cantidad <= 0) {
      removerDelCarrito(id);
    } else if (item.cantidad > item.stock) {
      alert('No hay más stock');
      item.cantidad = item.stock;
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarCarritoUI();
  }
}

function actualizarCarritoUI() {
  const cartCount = document.getElementById('cartCount');
  const cartItemsEl = document.getElementById('cartItems');
  const totalPriceEl = document.getElementById('totalPrice');

  cartCount.textContent = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  cartItemsEl.innerHTML = carrito.map(item => `
    <div class="cart-item">
      <img src="${item.imagen}" alt="${item.nombre}">
      <div class="cart-item-content">
        <h4>${item.nombre}</h4>
        <p>$${item.precio.toLocaleString()} x <span class="qty">${item.cantidad}</span></p>
        <div class="quantity-controls">
          <button class="quantity-btn" onclick="cambiarCantidad(${item.id}, -1)">-</button>
          <span>${item.cantidad}</span>
          <button class="quantity-btn" onclick="cambiarCantidad(${item.id}, 1)">+</button>
        </div>
        <button onclick="removerDelCarrito(${item.id})" style="background:none;border:none;color:#e74c3c;">Eliminar</button>
      </div>
    </div>
  `).join('');

  const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  totalPriceEl.textContent = total.toLocaleString();

  // Actualizar stock en productos
  productos.forEach(p => {
    const item = carrito.find(i => i.id === p.id);
    p.stock = item ? p.stock - item.cantidad : p.stock; // Simplificado, en prod real resta del original
  });
  localStorage.setItem('productos', JSON.stringify(productos));
}

// Abrir/cerrar carrito
cartBtn.addEventListener('click', () => {
  cartSidebar.classList.add('open');
  cartOverlay.style.display = 'block';
});
closeCart.addEventListener('click', () => {
  cartSidebar.classList.remove('open');
  cartOverlay.style.display = 'none';
});
cartOverlay.addEventListener('click', () => {
  cartSidebar.classList.remove('open');
  cartOverlay.style.display = 'none';
});

// Finalizar compra
finalizarBtn.addEventListener('click', () => {
  if (carrito.length === 0) {
    alert('Tu carrito está vacío');
    return;
  }

  const delivery = document.querySelector('input[name="delivery"]:checked').value;
  let mensaje = mensajeBase;
  carrito.forEach(item => {
    mensaje += `${item.nombre} x${item.cantidad} - $${(item.precio * item.cantidad).toLocaleString()}\n`;
  });
  mensaje += `\nTotal: $${carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0).toLocaleString()}\n`;
  mensaje += `\nEntrega: ${delivery === 'retiro' ? 'Retiro en local' : 'Envío a domicilio'}\n`;
  mensaje += `\n¿Cuándo podés coordinar? 😊`;

  const url = `https://wa.me/${whatsappNumber}?text=${mensaje}`;
  window.open(url, '_blank');
});

// WhatsApp fijo (mensaje genérico)
whatsappLink.href = `https://wa.me/${whatsappNumber}?text=${mensajeBase.replace('%0A', '')}...`;