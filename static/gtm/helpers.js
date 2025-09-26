// User-Type
function getDeviceType() {
  const width = window.innerWidth;
  if (width <= 767) return "mobile";    
  if (width <= 1024) return "tablet";
  return "desktop";  
}


// Site-Language
function getSiteLanguage() {
  return navigator.language || "unknown";
}


// User-Status (guest / logged_in)
function getUserStatus() {
  return document.body.getAttribute("data-user-status") || "guest";
}


// Page-ID (if set in body)
function getPageKey() {
  return document.body.getAttribute("data-page-key") || null;
}


// Event-Type (screen_view / custom / other)
function getEventType(eventName) {
  if (typeof eventName !== "string") return "other";
  if (eventName.startsWith("scr_")) return "screen_view";
  if (eventName.startsWith("cstm_")) return "custom";
  return "other";
}


// Shoe-Type 
function getShoeType() {
  const urlParams = new URLSearchParams(window.location.search);
  const typeFromUrl = urlParams.get("shoe_type");
  if (typeFromUrl) return typeFromUrl.toLowerCase();
  const h2 = document.querySelector("h2.font-bold, h2.text-3xl");
  if (h2) {
    let text = cleanText(h2);
    text = text.replace(/^(Men's|Women's|Kids')\s+/i, "");
    if (/^Shoes$/i.test(text)) return "all";
    const slug = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_") 
      .replace(/^_+|_+$/g, "");
    return slug || "all";
  }
  return "all";
}


// Clean text helper
function cleanText(el) {
  if (!el) return null;
  const s = (el.innerText !== undefined ? el.innerText : el.textContent) || "";
  return s.replace(/\s+/g, " ").trim();
}


// Product category getter
function getProductCategory() {
  const h2 = document.querySelector("h2.text-3xl, h2.font-bold");
  if (h2) return cleanText(h2);
  const path = window.location.pathname;
  if (path.includes("/mens")) return "Men's Shoes";
  if (path.includes("/womens")) return "Women's Shoes";
  if (path.includes("/kids")) return "Kids' Shoes";
  return "All Shoes";
}


// Product list extractor
function getProductsList() {
  const cards = document.querySelectorAll('.self-end');
  const products = [];
  const toNumber = (el) =>
    el ? parseFloat(el.textContent.replace(/[^\d.,]/g, '').replace(',', '.')) : null;
  cards.forEach(card => {
    let product_id = null;
    const idEl = card.querySelector('[data-product-id]');
    if (idEl) {
      product_id = parseInt(idEl.getAttribute('data-product-id'), 10);
    } else {
      const link = card.querySelector('a[href*="/products/product-detail/"]');
      const m = link && link.href.match(/product-detail\/(\d+)/);
      if (m) product_id = parseInt(m[1], 10);
    }
    const nameEl = card.querySelector('h2');
    const product_name = nameEl ? nameEl.textContent.trim() : null;
    const priceRowImg = card.querySelector('img[alt="Price tag icon"]');
    const priceRow = priceRowImg ? priceRowImg.parentElement : null;
    let product_price = null;
    let product_price_original = null;
    let product_discount_rate = 0;
    if (priceRow) {
      const originalEl = priceRow.querySelector('span.line-through');
      const spans = priceRow.querySelectorAll('span');
      const sellingEl = originalEl ? spans[spans.length - 1] : spans[0];
      product_price = toNumber(sellingEl);
      product_price_original = originalEl ? toNumber(originalEl) : product_price;
      const discountEl = priceRow.querySelector('div.bg-black');
      if (discountEl) {
        const r = parseInt(discountEl.textContent.replace(/[^\d]/g, ''), 10);
        if (!isNaN(r)) product_discount_rate = r;
      }
    }
    const item = {};
    if (product_id != null) item.product_id = product_id;
    if (product_name) item.product_name = product_name;
    if (product_price != null) item.product_price = product_price;
    if (product_price_original != null) item.product_price_original = product_price_original;
    item.product_discount_rate = product_discount_rate;
    products.push(item);
  });
  return products;
}


// Page number from URL (?page=2)
function getPageNumber() {
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get("page");
  return page ? `page=${page}` : "page=1";
}


// Products count on page
function getProductsCount() {
  return document.querySelectorAll('a[href*="/products/product-detail/"]').length;
}


// Search query from URL (?search_query=)
function getSearchQuery() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("search_query") || null;
}


// Product name extractor
function getProductName(element) {
  if (element) {
    const card = element.closest(".self-end, [data-product-card], .product-card");
    const nameEl = card?.querySelector("h2, .product-name");
    if (nameEl) return nameEl.textContent.trim();
  }
  const detailTitle = document.querySelector("h1.text-5xl");
  return detailTitle ? detailTitle.textContent.trim() : null;
}


// Product ID extractor
function getProductId(element) {
  if (element?.getAttribute && element.getAttribute("data-product-id")) {
    return parseInt(element.getAttribute("data-product-id"), 10);
  }
  if (element) {
    const link = element.closest(".self-end")?.querySelector('a[href*="/products/product-detail/"]');
    if (link) {
      const match = link.href.match(/product-detail\/(\d+)/);
      if (match) return parseInt(match[1], 10);
    }
  }
  const pathMatch = window.location.pathname.match(/product-detail\/(\d+)/);
  return pathMatch ? parseInt(pathMatch[1], 10) : null;
}


// Wishlist icon state checker
function normalizePath(url) {
  try {
    const u = new URL(url, window.location.origin);
    return u.pathname;
  } catch {
    return (url || '').split('?')[0];
  }
}
function isWishlistOn(imgEl) {
  if (!imgEl) return false;
  const curr = normalizePath(imgEl.getAttribute('src'));
  const wish = normalizePath(imgEl.dataset.wishlistIconUrl);        
  const heart = normalizePath(imgEl.dataset.heartOutlineIconUrl);
  if (curr && wish && curr === wish) return true;
  if (curr && heart && curr === heart) return false;
  return imgEl.getAttribute('alt') === 'Product in Wishlist';
}


// Product SKU extractor
function getProductSku() {
  const elements = document.querySelectorAll("p");
  for (const el of elements) {
    const text = (el.textContent || "").trim();
    if (text.startsWith("SKU:")) {
      return text.replace("SKU:", "").trim();
    }
  }
  return null;
}


// Product color extractor
function getProductColor() {
  const el = document.querySelector("p:has(span[data-color]) span[data-color]"); 
  if (el) {
    return el.getAttribute("data-color") || null;
  }
  return null;
}


// Product price extractor
function getProductPrice() {
  const saleEl = document.querySelector(".product-price .text-red-600"); 
  if (saleEl) {
    return parseFloat(saleEl.textContent.replace(/[^\d.,]/g, "").replace(",", "."));
  }
  const regularEl = document.querySelector(".product-price");
  if (regularEl) {
    return parseFloat(regularEl.textContent.replace(/[^\d.,]/g, "").replace(",", "."));
  }
  return null;
}


// Original price extractor (if on sale)
function getProductPriceOriginal() {
  const originalEl = document.querySelector(".product-price .line-through");
  if (originalEl) {
    return parseFloat(originalEl.textContent.replace(/[^\d.,]/g, "").replace(",", "."));
  }
  return getProductPrice();
}


// Discount rate extractor (if on sale)
function getProductDiscountRate() {
  const rateEl = document.querySelector(".product-price .bg-purple-600");
  if (rateEl) {
    return parseInt(rateEl.textContent.replace(/[^\d]/g, ""), 10);
  }
  return 0;
}


// Stock status extractor (true = in_stock, false = out_of_stock)
function getStockStatus() {
  const discountEl = document.querySelector(".product-price .line-through, .product-price .bg-purple-600");
  return !!discountEl;
}


// Cart products extractor
function getProductsCart() {
  const cartItems = document.querySelectorAll(
    '.flex.flex-col.mx-auto.justify-between.items-center'
  );
  const products = [];
  const toNumber = (el) =>
    el ? parseFloat(el.textContent.replace(/[^\d.,]/g, '').replace(',', '.')) : null;
  cartItems.forEach(card => {
    let product_id = null;
    const qtyInput = card.querySelector('input.qty-input');
    if (qtyInput && qtyInput.id) {
      const match = qtyInput.id.match(/^(\d+)_quantity$/);
      if (match) product_id = parseInt(match[1], 10);
    }
    const nameEl = card.querySelector('h2');
    const product_name = nameEl ? nameEl.textContent.trim() : null;
    const skuEl = Array.from(card.querySelectorAll('p'))
      .find(p => p.textContent.trim().startsWith('SKU:'));
    const product_sku = skuEl ? skuEl.textContent.replace('SKU:', '').trim() : null;
    const colorEl = card.querySelector('span[data-color]');
    const product_color = colorEl ? colorEl.getAttribute('data-color') : null;
    const sizeEl = Array.from(card.querySelectorAll('p strong'))
      .find(strong => strong.previousSibling?.textContent.includes('Size:'));
    const product_size = sizeEl ? sizeEl.textContent.trim() : null;
    let quantity = 1;
    if (qtyInput) quantity = parseInt(qtyInput.value, 10) || 1;
    const priceEl = card.querySelector('span.font-bold');
    const product_price = toNumber(priceEl);
    const priceOriginalEl = card.querySelector('span.line-through');
    const product_price_original = priceOriginalEl
      ? toNumber(priceOriginalEl)
      : product_price;
    const discountEl = card.querySelector('div.bg-black');
    const product_discount_rate = discountEl
      ? parseInt(discountEl.textContent.replace(/[^\d]/g, ''), 10) || 0
      : 0;
    const categoryEl = card.querySelector('h3.text-sm.text-gray-500');
    let product_category = null;
    let product_type = null;
    if (categoryEl) {
      const text = cleanText(categoryEl);
      product_category = text;
      let typeText = text.replace(/^(Men's|Women's|Kids')\s+/i, "");
      product_type = typeText
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
    }
    products.push({
      product_id,
      product_name,
      product_category,
      product_type,
      product_sku,
      product_color,
      product_size,
      product_price,
      product_price_original,
      product_discount_rate,
      quantity,
    });
  });
  return products;
}


// Price parsing helper
function parsePrice(str) {
  if (!str) return 0;
  const num = parseFloat(str.replace(/[^\d.,-]/g, '').replace(',', '.'));
  return isNaN(num) ? 0 : num;
}


// Get order_items count from Cart Summary
function getOrderItems() {
  const rows = document.querySelectorAll(".flex.justify-between");
  for (const row of rows) {
    const label = row.querySelector("span:first-child");
    const value = row.querySelector("span:last-child");
    if (label && /items/i.test(label.textContent)) {
      const num = parseInt(value?.textContent.replace(/\D/g, ""), 10);
      return isNaN(num) ? 0 : num;
    }
  }
  return 0;
}


// Get order original price from Cart Summary
function getOrderOriginalPrice() {
  const el = [...document.querySelectorAll('.flex.justify-between')].find(
    row => row.querySelector('span')?.textContent.includes('Original Price')
  );
  return el ? parsePrice(el.querySelector('span:last-child').textContent) : 0;
}


// Get order discount from Cart Summary
function getOrderDiscount() {
  const el = [...document.querySelectorAll('.flex.justify-between')].find(
    row => row.querySelector('span')?.textContent.includes('Discount')
  );
  return el ? parsePrice(el.querySelector('span:last-child').textContent) : 0;
}


// Get order subtotal from Cart Summary
function getOrderSubtotal() {
  const el = [...document.querySelectorAll('.flex.justify-between')].find(
    row => row.querySelector('span')?.textContent.includes('Subtotal')
  );
  return el ? parsePrice(el.querySelector('span:last-child').textContent) : 0;
}


// Get order tax from Cart Summary
function getOrderTax() {
  const el = [...document.querySelectorAll('.flex.justify-between')].find(
    row => row.querySelector('span')?.textContent.includes('Tax')
  );
  return el ? parsePrice(el.querySelector('span:last-child').textContent) : 0;
}


// Get order delivery from Cart Summary
function getOrderDelivery() {
  const el = [...document.querySelectorAll('.flex.justify-between')].find(
    row => row.querySelector('span')?.textContent.includes('Delivery')
  );
  return el ? parsePrice(el.querySelector('span:last-child').textContent) : 0;
}


// Get order total price from Cart Summary
function getOrderTotalPrice() {
  const el = [...document.querySelectorAll('.flex.justify-between')].find(
    row => row.querySelector('span')?.textContent.trim() === 'Total'
  );
  return el ? parsePrice(el.querySelector('span:last-child').textContent) : 0;
}


// Basket status: true = empty, false = has items
function getBasketStatus() {
  const emptyMessage = document.querySelector('.text-gray-400');
  if (emptyMessage && emptyMessage.textContent.includes('Your shopping cart is empty')) {
    return true;
  }
  return false;
}


// Session Cart ID (from cookie sessionid)
function getSessionId() {
  const el = document.querySelector("#cart-meta");
  const val = el?.dataset.session;
  return val && val.trim() !== "" ? val : null;
}


// Checkout products extractor
function getProductsCheckout() {
  const items = [];
  const productElements = document.querySelectorAll('.w-full.space-y-8.sm\\:w-2\\/3.md\\:w-full > div');
  productElements.forEach(el => {
    const nameEl = el.querySelector('h2');
    const paragraphs = el.querySelectorAll('p');
    let skuEl = null;
    paragraphs.forEach(p => { if ((p.textContent || '').includes('SKU:')) skuEl = p; });
    const colorEl = el.querySelector('[data-color]');
    const sizeEl = paragraphs.length > 1 ? paragraphs[paragraphs.length - 2].querySelector('strong') : null; // "Size"
    const qtyEl  = paragraphs.length > 0 ? paragraphs[paragraphs.length - 1].querySelector('strong') : null;  // "Qty"
    const currentPriceEl  = el.querySelector('.font-bold');
    const originalPriceEl = el.querySelector('.line-through');
    const discountEl      = el.querySelector('.bg-black');
    let product_id = null;
    const linkEl = el.querySelector('a[href*="/products/product-detail/"]');
    if (linkEl && linkEl.href) {
      const m = linkEl.href.match(/product-detail\/(\d+)/);
      if (m) product_id = parseInt(m[1], 10);
    }
    const categoryEl = el.querySelector('h3.text-sm.text-gray-500');
    let product_category = null;
    let product_type = null;
    if (categoryEl) {
      const text = cleanText(categoryEl);  
      product_category = text;
      const typeText = text.replace(/^(Men's|Women's|Kids')\s+/i, "");
      product_type = typeText
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, ""); 
    }
    items.push({
      product_id,
      product_name: nameEl ? nameEl.textContent.trim() : null,
      product_category,
      product_type,
      product_sku: skuEl ? skuEl.textContent.replace('SKU:', '').trim() : null,
      product_color: colorEl ? colorEl.dataset.color : null,
      product_size: sizeEl ? sizeEl.textContent.trim() : null,
      product_price: currentPriceEl ? parsePrice(currentPriceEl.textContent) : null,
      product_price_original: originalPriceEl
        ? parsePrice(originalPriceEl.textContent)
        : (currentPriceEl ? parsePrice(currentPriceEl.textContent) : null),
      product_discount_rate: discountEl ? parseInt(discountEl.textContent.replace(/\D/g, ''), 10) : 0,
      quantity: qtyEl ? parseInt(qtyEl.textContent.replace(/\D/g, ''), 10) : 1,
    });
  });
  return items;
}


// User ID
function getUserId() {
  if (getUserStatus() === "logged_in") {
    const id = document.body.getAttribute("data-user-id");
    return id && id.trim() !== "" ? id : null;
  }
  return null;
}


// Expose functions to global scope
window.getDeviceType = getDeviceType;
window.getSiteLanguage = getSiteLanguage;
window.getUserStatus = getUserStatus;
window.getPageKey = getPageKey;
window.getUserId = getUserId;
window.getEventType = getEventType;
window.getProductCategory = getProductCategory;
window.getShoeType = getShoeType;
window.getProductsList = getProductsList;
window.getPageNumber = getPageNumber;
window.getProductsCount = getProductsCount;
window.getSearchQuery = getSearchQuery;
window.getProductName = getProductName;
window.getProductId = getProductId;
window.normalizePath = normalizePath;
window.isWishlistOn = isWishlistOn;
window.getProductSku = getProductSku;
window.getProductColor = getProductColor;
window.getProductPrice = getProductPrice;
window.getProductPriceOriginal = getProductPriceOriginal;
window.getProductDiscountRate = getProductDiscountRate;
window.getStockStatus = getStockStatus;
window.getProductsCart = getProductsCart;
window.getOrderItems = getOrderItems;
window.getOrderOriginalPrice = getOrderOriginalPrice;
window.getOrderDiscount = getOrderDiscount;
window.getOrderSubtotal = getOrderSubtotal;
window.getOrderTax = getOrderTax;
window.getOrderDelivery = getOrderDelivery;
window.getOrderTotalPrice = getOrderTotalPrice;
window.getBasketStatus = getBasketStatus;
window.getSessionId = getSessionId;
window.getProductsCheckout = getProductsCheckout;
// End of helpers.js
