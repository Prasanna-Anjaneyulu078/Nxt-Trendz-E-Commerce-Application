import './index.css'

const CartSummary = props => {
  const {totalItems, totalPrice} = props

  return (
    <div className="cart-summary-container">
      <h1 className="total-price">
        Order Total: <span>Rs {totalPrice}/-</span>
      </h1>
      <p className="total-items">{totalItems} Items in cart</p>
      <button type="button" className="checkout-button">
        Checkout
      </button>
    </div>
  )
}

export default CartSummary
