// Universal function to push events to dataLayer
function pushEvent(eventName, params = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    event_type: getEventType(eventName),
    page_id: getPageKey(),
    device_type: getDeviceType(),
    ...params,
    site_language: getSiteLanguage(),
    user_status: getUserStatus(),
    user_id: getUserId(),
  });
}



// === All Events in Project ===

// Page - Home Show
function scr_home_show() {
  pushEvent("scr_home_show", {
  });
}


// Page - Product List Show
function scr_products_list_show() {
  pushEvent("scr_products_list_show", {
    currency: "EUR",
    product_category: getProductCategory(),
    product_type: getShoeType(),
    products: getProductsList(),
    products_count: getProductsCount(),
    page_number: getPageNumber(),
    search_query: getSearchQuery(),
  });
}


// Custom - Product List Search Results
function cstm_prod_list_search_results() {
  const query = getSearchQuery();
  if (!query) return;
  pushEvent("cstm_prod_list_search_results", {
    currency: "EUR",
    product_category: getProductCategory(),
    product_type: getShoeType(),
    products: getProductsList(),
    products_count: getProductsCount(),
    search_query: query,
  });
}


// Custom - Product List Wishlist Click
function cstm_prod_list_wishlist_click(productId, productName, isAdded) {
  pushEvent("cstm_prod_list_wishlist_click", {
    currency: "EUR",
    wishlist_status: isAdded,
    product_id: parseInt(productId, 10),
    product_name: productName,
    product_category: getProductCategory(),
    product_type: getShoeType(),
  });
}
function initWishlistTracking() {
  document.addEventListener("click", function (e) {
    const btn = e.target.closest("#wishlist-toggle");
    if (!btn) return;
    const img = btn.querySelector("img");
    const productId = getProductId(btn);
    const productName = getProductName(btn);
    const settleAndPush = () => {
      const isAdded = isWishlistOn(img);
      cstm_prod_list_wishlist_click(productId, productName, isAdded);
    };
    let pushed = false;
    const observer = new MutationObserver(() => {
      if (!pushed) {
        pushed = true;
        observer.disconnect();
        settleAndPush();
      }
    });
    observer.observe(img, { attributes: true, attributeFilter: ["src", "alt"] });
    setTimeout(() => {
      if (!pushed) {
        observer.disconnect();
        settleAndPush();
      }
    }, 120);
  });
}


// Page - Product Detail Show
function scr_product_detail_show() {
  pushEvent("scr_product_detail_show", {
    currency: "EUR",
    product_id: getProductId(),
    product_name: getProductName(),
    product_category: getProductCategory(),
    product_type: getShoeType(),
    product_sku: getProductSku(),
    product_price: getProductPrice(),
    product_price_original: getProductPriceOriginal(),
    product_discount_rate: getProductDiscountRate(),
    stock_status: getStockStatus(),
    product_color: getProductColor(),
  });
}


// Page - Shopping Cart Show
function scr_shopping_cart_show() {
  pushEvent("scr_shopping_cart_show", {
    currency: "EUR",
    products: getProductsCart(),
    products_count: getProductsCount(),
    order_items: getOrderItems(),
    order_original_price: getOrderOriginalPrice(),
    order_discount: getOrderDiscount(),
    order_subtotal: getOrderSubtotal(),
    order_tax: getOrderTax(),
    order_delivery: getOrderDelivery(),
    order_total_price: getOrderTotalPrice(),
    basket_status: getBasketStatus(),
    session_id: getSessionId(),
  });
}


// Page - Order Checkout Show
function scr_order_checkout_show() {
  pushEvent("scr_order_checkout_show", {
    currency: "EUR",
    products: getProductsCheckout(),
    products_count: getProductsCount(),
    order_items: getOrderItems(),
    order_original_price: getOrderOriginalPrice(),
    order_discount: getOrderDiscount(),
    order_subtotal: getOrderSubtotal(),
    order_tax: getOrderTax(),
    order_delivery: getOrderDelivery(),
    order_total_price: getOrderTotalPrice(),
    payment_type: "credit_card",
    session_id: getSessionId(),
  });
}


// === Event Listeners ===
document.addEventListener("DOMContentLoaded", function () {
  const pageKey = getPageKey();

  if (pageKey === "home") {
    scr_home_show();
  } else if (pageKey === "products_list") {
    scr_products_list_show();
    cstm_prod_list_search_results();
    initWishlistTracking();
  } else if (pageKey === "product_detail") {
    scr_product_detail_show();
  } else if (pageKey === "shopping_cart") {
    scr_shopping_cart_show();
  } else if (pageKey === "order_checkout") {
    scr_order_checkout_show();
  }
});
