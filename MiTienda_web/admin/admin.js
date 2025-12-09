const passwordEl = document.getElementById('password');
const loginForm = document.getElementById('loginForm');
const adminContent = document.getElementById('adminContent');
const adminPassword = "1234"; // ← Misma que en script.js

function login() {
  if (passwordEl.value === adminPassword) {
    loginForm.style.display = 'none';
    adminContent.style.display = 'block';
    cargarProductosAdmin();
  } else {
    alert('Contraseña incorrecta');
  }
}

function logout() {
  loginForm.style.display = 'block';
  adminContent.style.display = 'none';
  passwordEl.value = '';
}

// Cargar productos en admin
function cargarProductosAdmin() {
  const productos = JSON.parse(localStorage.getItem('productos')) || [];
  const container = document.getElementById('adminProducts');
  container.innerHTML = productos.map(prod => `
    <div class="admin-product">
      <h3>${prod.nombre}</h3>
      <p>${prod.descripcion}</p>
      <p>Precio: $<span id="precio-${prod.id}">${prod.precio}</span></p>
      <p>Stock: <span id="stock-${prod.id}">${prod.stock}</span></p>
      <input type="number" id="newPrecio-${prod.id}" placeholder="Nuevo precio" />
      <input type="number" id="newStock-${prod.id}" placeholder="Nuevo stock" />
      <button onclick="editarProducto(${prod.id})">Guardar cambios</button>
      <button onclick="eliminarProducto(${prod.id})" style="background:#e74c3c;">Eliminar</button>
    </div>
  `).join('');
}

function agregarProducto() {
  const nombre = document.getElementById('nombre').value;
  const precio = parseInt(document.getElementById('precio').value);
  const descripcion = document.getElementById('descripcion').value;
  const categoria = document.getElementById('categoria').value;
  const stock = parseInt(document.getElementById('stock').value);
  const file = document.getElementById('imagen').files[0];

  if (!nombre || !precio || !descripcion || !categoria) {
    alert('Completa todos los campos');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const nuevoProd = {
      id: Date.now(),
      nombre,
      precio,
      descripcion,
      categoria,
      imagen: e.target.result, // Base64 para local, pero para prod usa upload a imgur
      stock
    };

    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    productos.push(nuevoProd);
    localStorage.setItem('productos', JSON.stringify(productos));

    alert('Producto agregado!');
    // Limpiar form
    document.getElementById('nombre').value = '';
    document.getElementById('precio').value = '';
    document.getElementById('descripcion').value = '';
    document.getElementById('categoria').value = '';
    document.getElementById('stock').value = '10';
    document.getElementById('imagen').value = '';

    cargarProductosAdmin();
  };
  if (file) {
    reader.readAsDataURL(file);
  } else {
    nuevoProd.imagen = 'https://via.placeholder.com/300x250?text=' + encodeURIComponent(nombre);
    // Guardar sin foto
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    productos.push(nuevoProd);
    localStorage.setItem('productos', JSON.stringify(productos));
    alert('Producto agregado sin foto (usa placeholder)');
    cargarProductosAdmin();
  }
}

function editarProducto(id) {
  const newPrecio = parseInt(document.getElementById(`newPrecio-${id}`).value);
  const newStock = parseInt(document.getElementById(`newStock-${id}`).value);

  if (newPrecio || newStock) {
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    const prod = productos.find(p => p.id === id);
    if (prod) {
      if (newPrecio) prod.precio = newPrecio;
      if (newStock !== undefined) prod.stock = newStock;
      localStorage.setItem('productos', JSON.stringify(productos));
      document.getElementById(`precio-${id}`).textContent = newPrecio || prod.precio;
      document.getElementById(`stock-${id}`).textContent = newStock !== undefined ? newStock : prod.stock;
      alert('Cambios guardados!');
      cargarProductosAdmin(); // Recargar para limpiar inputs
    }
  }
}

function eliminarProducto(id) {
  if (confirm('¿Seguro que querés eliminar este producto?')) {
    let productos = JSON.parse(localStorage.getItem('productos')) || [];
    productos = productos.filter(p => p.id !== id);
    localStorage.setItem('productos', JSON.stringify(productos));
    // Limpiar carrito si tiene ese producto
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito = carrito.filter(item => item.id !== id);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    cargarProductosAdmin();
    alert('Producto eliminado');
  }
}

// Enter para login
passwordEl.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') login();
});