let cartItems = []
let allProducts = []

function loadCartFromStorage() {
    let saved = localStorage.getItem("techshop_cart")

    if (saved) {
        cartItems = JSON.parse(saved)
    } else {
        cartItems = []
    }
}

function saveCartToStorage() {
    localStorage.setItem("techshop_cart", JSON.stringify(cartItems))
}

function collectProducts() {
    allProducts = []

    let cards = document.querySelectorAll(".product-card")

    cards.forEach(function(card) {
        let product = {
            id: card.querySelector(".btn--cart").dataset.id,
            name: card.dataset.name,
            price: Number(card.dataset.price),
            category: card.dataset.category,
            image: card.querySelector("img").src
        }

        allProducts.push(product)
    })
}

function findProductById(productId) {
    let found = null

    for (let i = 0; i < allProducts.length; i++) {
        if (allProducts[i].id === productId) {
            found = allProducts[i]
            break
        }
    }

    return found
}

function addToCart(productId) {
    let product = findProductById(productId)

    if (!product) {
        return
    }

    let existing = null

    for (let i = 0; i < cartItems.length; i++) {
        if (cartItems[i].id === productId) {
            existing = cartItems[i]
            break
        }
    }

    if (existing) {
        existing.quantity = existing.quantity + 1
    } else {
        cartItems.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        })
    }

    saveCartToStorage()
    updateCartCounter()
    renderCart()
}

function removeFromCart(productId) {
    let newCart = []

    for (let i = 0; i < cartItems.length; i++) {
        if (cartItems[i].id !== productId) {
            newCart.push(cartItems[i])
        }
    }

    cartItems = newCart

    saveCartToStorage()
    updateCartCounter()
    renderCart()
}

function changeQuantity(productId, delta) {
    for (let i = 0; i < cartItems.length; i++) {
        if (cartItems[i].id === productId) {
            cartItems[i].quantity = cartItems[i].quantity + delta

            if (cartItems[i].quantity <= 0) {
                removeFromCart(productId)
                return
            }

            break
        }
    }

    saveCartToStorage()
    updateCartCounter()
    renderCart()
}

function getCartTotal() {
    let total = 0

    for (let i = 0; i < cartItems.length; i++) {
        total = total + cartItems[i].price * cartItems[i].quantity
    }

    return total
}

function getCartCount() {
    let count = 0

    for (let i = 0; i < cartItems.length; i++) {
        count = count + cartItems[i].quantity
    }

    return count
}

function formatPrice(number) {
    return number.toLocaleString("ru-RU") + " ₽"
}

function updateCartCounter() {
    let counter = document.getElementById("cartCount")
    counter.textContent = getCartCount()
}

function renderCart() {
    let cartBody = document.getElementById("cartBody")
    let cartTotal = document.getElementById("cartTotal")

    if (cartItems.length === 0) {
        cartBody.innerHTML = '<div class="cart-empty">Корзина пуста 🛒</div>'
        cartTotal.textContent = "0 ₽"
        return
    }

    let html = ""

    for (let i = 0; i < cartItems.length; i++) {
        let item = cartItems[i]

        html = html + `
            <div class="cart-item">
                <img src="${item.image}" width="60" height="60" style="border-radius:8px;object-fit:cover">
                <div class="cart-item__info">
                    <div class="cart-item__title">${item.name}</div>
                    <div class="cart-item__price">${formatPrice(item.price)}</div>
                    <div class="cart-item__controls">
                        <button onclick="changeQuantity('${item.id}', -1)">−</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>
                <button class="cart-item__remove" onclick="removeFromCart('${item.id}')">🗑</button>
            </div>
        `
    }

    cartBody.innerHTML = html
    cartTotal.textContent = formatPrice(getCartTotal())
}

function openCart() {
    document.getElementById("cartPanel").classList.add("open")
    document.getElementById("overlay").classList.add("show")
}

function closeCart() {
    document.getElementById("cartPanel").classList.remove("open")
    document.getElementById("overlay").classList.remove("show")
}

function filterByCategory(category) {
    let cards = document.querySelectorAll(".product-card")
    let visibleCount = 0

    cards.forEach(function(card) {
        if (category === "all" || card.dataset.category === category) {
            card.style.display = ""
            visibleCount = visibleCount + 1
        } else {
            card.style.display = "none"
        }
    })

    checkEmpty(visibleCount)
}

function searchProducts(query) {
    let cards = document.querySelectorAll(".product-card")
    let visibleCount = 0
    let lowerQuery = query.toLowerCase().trim()

    cards.forEach(function(card) {
        let name = card.dataset.name.toLowerCase()

        if (name.includes(lowerQuery)) {
            card.style.display = ""
            visibleCount = visibleCount + 1
        } else {
            card.style.display = "none"
        }
    })

    checkEmpty(visibleCount)
}

function checkEmpty(visibleCount) {
    let message = document.getElementById("emptyMessage")

    if (visibleCount === 0) {
        message.classList.add("show")
    } else {
        message.classList.remove("show")
    }
}

function setupCartButtons() {
    let buttons = document.querySelectorAll(".btn--cart")

    buttons.forEach(function(button) {
        button.addEventListener("click", function() {
            let id = button.dataset.id
            addToCart(id)

            let originalText = button.textContent
            button.textContent = "✓ Добавлено"
            button.style.background = "#50c878"

            setTimeout(function() {
                button.textContent = originalText
                button.style.background = ""
            }, 1000)
        })
    })
}

function setupFilters() {
    let filterButtons = document.querySelectorAll(".filter-btn")

    filterButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            filterButtons.forEach(function(b) {
                b.classList.remove("active")
            })

            button.classList.add("active")

            let category = button.dataset.category
            filterByCategory(category)

            document.getElementById("searchInput").value = ""
        })
    })
}

function setupSearch() {
    let searchBtn = document.getElementById("searchBtn")
    let searchBar = document.getElementById("searchBar")
    let searchInput = document.getElementById("searchInput")
    let searchClose = document.getElementById("searchClose")

    searchBtn.addEventListener("click", function() {
        searchBar.classList.toggle("open")

        if (searchBar.classList.contains("open")) {
            searchInput.focus()
        }
    })

    searchClose.addEventListener("click", function() {
        searchBar.classList.remove("open")
        searchInput.value = ""
        searchProducts("")
    })

    searchInput.addEventListener("input", function() {
        searchProducts(searchInput.value)
    })
}

function setupCartPanel() {
    document.getElementById("cartBtn").addEventListener("click", openCart)
    document.getElementById("cartClose").addEventListener("click", closeCart)
    document.getElementById("overlay").addEventListener("click", closeCart)
}

function setupCheckout() {
    let checkoutBtn = document.getElementById("checkoutBtn")
    let modal = document.getElementById("orderModal")
    let modalClose = document.getElementById("modalClose")

    checkoutBtn.addEventListener("click", function() {
        if (cartItems.length === 0) {
            alert("Корзина пуста!")
            return
        }

        modal.classList.add("show")
        closeCart()
    })

    modalClose.addEventListener("click", function() {
        modal.classList.remove("show")

        cartItems = []
        saveCartToStorage()
        updateCartCounter()
        renderCart()
    })
}

function setupBurger() {
    let burger = document.getElementById("burger")
    let nav = document.querySelector(".nav")

    burger.addEventListener("click", function() {
        nav.classList.toggle("nav--open")
    })
}

function setupSmoothScroll() {
    let links = document.querySelectorAll('a[href^="#"]')

    links.forEach(function(link) {
        link.addEventListener("click", function(event) {
            let target = document.querySelector(link.getAttribute("href"))

            if (target) {
                event.preventDefault()
                target.scrollIntoView({ behavior: "smooth" })
            }
        })
    })
}

function startApp() {
    loadCartFromStorage()
    collectProducts()
    setupCartButtons()
    setupFilters()
    setupSearch()
    setupCartPanel()
    setupCheckout()
    setupBurger()
    setupSmoothScroll()
    updateCartCounter()
    renderCart()
}

startApp()