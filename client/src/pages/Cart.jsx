import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { showSuccess, showInfo } from "../utils/toast"; // ✅ custom toast
import styles from "../styles/Cart.module.css";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart, getTotalPrice, getTotalItems } = useCart();

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id, name) => {
    removeFromCart(id);
    showSuccess(`${name} has been removed from your cart.`, "Item removed");
  };

  const handleClearCart = () => {
    clearCart();
    showInfo("All items have been removed from your cart.", "Cart cleared");
  };

  const formatPrice = (price) => {
    return `₹${(price / 100000).toFixed(1)}L`;
  };

  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <ShoppingCart size={28} />
            Shopping Cart
          </h1>
        </div>
        
        <div className={styles.empty}>
          <ShoppingCart size={64} className={styles.emptyIcon} />
          <h2>Your cart is empty</h2>
          <p>Add some services to get started</p>
          <Link to="/" className={styles.shopButton}>
            Explore Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <ShoppingCart size={28} />
          Shopping Cart ({getTotalItems()} items)
        </h1>
        
        <button 
          className={styles.clearCart}
          onClick={handleClearCart}
        >
          Clear Cart
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.itemsList}>
          {items.map((item) => (
            <div key={item.id} className={styles.cartItem}>
              <div className={styles.itemImage}>
                <Link to={`/service/${item.id}`}>
                  <img src={item.image} alt={item.name} />
                </Link>
              </div>
              
              <div className={styles.itemDetails}>
                <Link to={`/service/${item.id}`} className={styles.itemName}>
                  {item.name}
                </Link>
                <p className={styles.itemVendor}>by {item.vendorName}</p>
                <p className={styles.itemType}>{item.serviceType}</p>
                <p className={styles.itemPrice}>
                  {formatPrice(item.price)} each
                </p>
              </div>
              
              <div className={styles.itemControls}>
                <div className={styles.quantityControls}>
                  <button 
                    className={styles.quantityBtn}
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className={styles.quantity}>{item.quantity}</span>
                  <button 
                    className={styles.quantityBtn}
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                <p className={styles.itemTotal}>
                  {formatPrice(item.price * item.quantity)}
                </p>
                
                <button 
                  className={styles.removeBtn}
                  onClick={() => handleRemoveItem(item.id, item.name)}
                  aria-label="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.cartSummary}>
          <div className={styles.summaryCard}>
            <h3>Order Summary</h3>
            
            <div className={styles.summaryRow}>
              <span>Subtotal ({getTotalItems()} items)</span>
              <span>{formatPrice(getTotalPrice())}</span>
            </div>
            
            <div className={styles.summaryRow}>
              <span>Booking Fee</span>
              <span>₹2,500</span>
            </div>
            
            <div className={styles.summaryRow}>
              <span>Service Tax (18%)</span>
              <span>{formatPrice(getTotalPrice() * 0.18)}</span>
            </div>
            
            <div className={styles.divider}></div>
            
            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Total Amount</span>
              <span>{formatPrice(getTotalPrice() + 250000 + (getTotalPrice() * 0.18))}</span>
            </div>
            
            <button className={styles.checkoutBtn}>
              Proceed to Checkout
              <ArrowRight size={18} />
            </button>
            
            <Link to="/" className={styles.continueShoppingBtn}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
