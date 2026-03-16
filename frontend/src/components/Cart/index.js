import {Component} from 'react'

import Header from '../Header'
import CartListView from '../CartListView'
import CartContext from '../../context/CartContext'
import EmptyCartView from '../EmptyCartView'
import CartSummary from '../CartSummary'

import './index.css'

class Cart extends Component {
  componentDidMount() {
    const {loadCart} = this.context
    loadCart()
  }

  render() {
    const {cartList, removeAllCartItems} = this.context

    const onClickRemoveAllCartItems = () => {
      removeAllCartItems()
    }

    const showEmptyView = cartList.length === 0

    let totalPrice = 0
    let totalItems = 0

    if (!showEmptyView) {
      totalPrice = cartList.reduce(
        (acc, eachItem) => acc + eachItem.price * eachItem.quantity,
        0,
      )

      totalItems = cartList.reduce(
        (acc, eachItem) => acc + eachItem.quantity,
        0,
      )
    }

    return (
      <>
        <Header />
        <div className="cart-container">
          {showEmptyView ? (
            <EmptyCartView />
          ) : (
            <div className="cart-content-container">
              <h1 className="cart-heading">My Cart</h1>
              <button
                type="button"
                className="remove-all-carts"
                onClick={onClickRemoveAllCartItems}
              >
                Remove All
              </button>
              <CartListView />
              {/* TODO: Add your code for Cart Summary here */}
              <CartSummary totalItems={totalItems} totalPrice={totalPrice} />
            </div>
          )}
        </div>
      </>
    )
  }
}

Cart.contextType = CartContext

export default Cart
