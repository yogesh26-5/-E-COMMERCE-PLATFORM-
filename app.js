// Product Data
const products = [
  {
      id: 1,
      name: "Wireless Earbuds",
      description: "Premium sound quality with noise cancellation",
      price: 1299.99,
      image: "buds.jpeg",
      category: "electronics"
  },
  {
      id: 2,
      name: "Smart Watch",
      description: "Track your fitness and stay connected",
      price: 1449.99,
      image: "watch.jpeg",
      category: "electronics"
  },
  {
      id: 3,
      name: "Cotton T-Shirt",
      description: "Comfortable and stylish everyday wear",
      price: 129.99,
      image: "tshirt.jpeg",
      category: "clothing"
  },
  {
      id: 4,
      name: "Blender",
      description: "Powerful kitchen blender for smoothies and more",
      price: 2399.99,
      image: "blender.jpeg",
      category: "home"
  }
];

// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM Elements
const productGrid = document.getElementById('productGrid');
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const emptyCartMessage = document.getElementById('emptyCartMessage');
const checkoutBtn = document.getElementById('checkoutBtn');
const notificationToast = new bootstrap.Toast(document.getElementById('notificationToast'));
const notificationMessage = document.getElementById('notificationMessage');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateCartCount();
  setupEventListeners();
});

// Render products on the home page
function renderProducts() {
  productGrid.innerHTML = '';
  
  products.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = 'col-12 col-md-6 col-lg-4 col-xl-3';
      productCard.innerHTML = `
          <div class="card h-100 shadow-sm">
              <img src="${product.image}" class="card-img-top p-3" alt="${product.name}" loading="lazy">
              <div class="card-body">
                  <h5 class="card-title">${product.name}</h5>
                  <p class="card-text text-muted">${product.description}</p>
                  <div class="d-flex justify-content-between align-items-center">
                      <span class="h5 text-primary">₹${product.price.toFixed(2)}</span>
                      <button class="btn btn-sm btn-primary add-to-cart" data-id="${product.id}">
                          <i class="bi bi-cart-plus"></i> Add to Cart
                      </button>
                  </div>
              </div>
          </div>
      `;
      productGrid.appendChild(productCard);
  });
}
// Search functionality
document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    
    if (searchTerm) {
        // Filter products based on search term
        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) || 
            product.description.toLowerCase().includes(searchTerm)
        );
        
        // Display filtered products
        displayProducts(filteredProducts);
        
        // Show notification
        showNotification(`Showing results for "${searchTerm}"`);
    } else {
        // If search is empty, show all products
        displayProducts(products);
    }
});
// Clear search when clicking on the logo or home link
document.querySelector('.navbar-brand').addEventListener('click', function() {
    document.getElementById('searchInput').value = '';
    displayProducts(products);
});
document.querySelector('.nav-link[href="index.html"]').addEventListener('click', function() {
    document.getElementById('searchInput').value = '';
    displayProducts(products);
});
// Setup event listeners
function setupEventListeners() {
  // Cart button click
  cartBtn.addEventListener('click', () => {
      const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
      renderCartItems();
      cartModal.show();
  });
  // Add to cart buttons (delegated event)
  document.addEventListener('click', (e) => {
      if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
          const button = e.target.classList.contains('add-to-cart') ? e.target : e.target.closest('.add-to-cart');
          const productId = parseInt(button.getAttribute('data-id'));
          addToCart(productId);
      }
      // Remove item from cart
      if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
          const button = e.target.classList.contains('remove-item') ? e.target : e.target.closest('.remove-item');
          const productId = parseInt(button.getAttribute('data-id'));
          removeFromCart(productId);
      }
      // Quantity changes
      if (e.target.classList.contains('quantity-btn') || e.target.closest('.quantity-btn')) {
          const button = e.target.classList.contains('quantity-btn') ? e.target : e.target.closest('.quantity-btn');
          const productId = parseInt(button.getAttribute('data-id'));
          const action = button.getAttribute('data-action');
          updateQuantity(productId, action);
      }
  });
  // Checkout button
  checkoutBtn.addEventListener('click', () => {
      showNotification('Proceeding to checkout');
      window.location.href="checkout.html";
      // In a real app, you would redirect to checkout page
  });
}
// Cart functions
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
      existingItem.quantity += 1;
  } else {
      cart.push({
          ...product,
          quantity: 1
      });
  }
  saveCart();
  updateCartCount();
  showNotification(`${product.name} added to cart`);
}
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  renderCartItems();
  updateCartCount();
  showNotification('Item removed from cart');
}
function updateQuantity(productId, action) {
  const item = cart.find(item => item.id === productId); 
  if (action === 'increase') {
      item.quantity += 1;
  } else if (action === 'decrease' && item.quantity > 1) {
      item.quantity -= 1;
  }
  saveCart();
  renderCartItems();
  updateCartCount();
}
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}
function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  cartCount.textContent = count;
}
function renderCartItems() {
  if (cart.length === 0) {
      emptyCartMessage.style.display = 'block';
      cartItems.innerHTML = '';
      cartTotal.textContent = '₹0.00';
      checkoutBtn.disabled = true;
      return;
  }
  emptyCartMessage.style.display = 'none';
  checkoutBtn.disabled = false; 
  cartItems.innerHTML = '';
  let total = 0;
  cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      const cartItem = document.createElement('div');
      cartItem.className = 'd-flex mb-3 border-bottom pb-3';
      cartItem.innerHTML = `
          <img src="${item.image}" alt="${item.name}" class="rounded me-3" width="80" height="80">
          <div class="flex-grow-1">
              <h6 class="mb-1">${item.name}</h6>
              <p class="text-muted mb-2">₹${item.price.toFixed(2)}</p>
              <div class="d-flex align-items-center">
                  <button class="btn btn-sm btn-outline-secondary quantity-btn" data-id="${item.id}" data-action="decrease">
                      <i class="bi bi-dash"></i>
                  </button>
                  <span class="mx-2">${item.quantity}</span>
                  <button class="btn btn-sm btn-outline-secondary quantity-btn" data-id="${item.id}" data-action="increase">
                      <i class="bi bi-plus"></i>
                  </button>
                  <button class="btn btn-sm btn-danger ms-auto remove-item" data-id="${item.id}">
                      <i class="bi bi-trash"></i>
                  </button>
              </div>
          </div>
      `;
      cartItems.appendChild(cartItem);
  });
  cartTotal.textContent = `₹${total.toFixed(2)}`;
}
// Notification function
function showNotification(message) {
  notificationMessage.textContent = message;
  notificationToast.show();
}
// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
          .then(registration => {
              console.log('ServiceWorker registration successful');
          })
          .catch(err => {
              console.log('ServiceWorker registration failed: ', err);
          });
  });
}
// Connection status
window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);
function updateConnectionStatus() {
  const statusElement = document.getElementById('connectionStatus');
  if (navigator.onLine) {
      statusElement.textContent = 'Online';
      statusElement.className = 'badge bg-success';
  } else {
      statusElement.textContent = 'Offline';
      statusElement.className = 'badge bg-danger';
  }
}
// Install button functionality
const installBtn = document.getElementById('installBtn');
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'block';
  installBtn.addEventListener('click', () => {
      installBtn.style.display = 'none';
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
              console.log('User accepted install prompt');
          } else {
              console.log('User dismissed install prompt');
          }
          deferredPrompt = null;
      });
  });
});