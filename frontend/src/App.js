import {Component} from 'react'
import {Route, Switch, Redirect} from 'react-router-dom'
import Cookies from 'js-cookie'

import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import Home from './components/Home'
import Products from './components/Products'
import ProductItemDetails from './components/ProductItemDetails'
import Cart from './components/Cart'
import NotFound from './components/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import CartContext from './context/CartContext'

import './App.css'

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'
const API_BASE_URL = 'https://nxt-trendz-backend-alqp.onrender.com'

class App extends Component {
  state = {
    cartList: [],
  }

  getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${Cookies.get('jwt_token')}`,
  })

  // GET /cart — seed cartList from DB on Cart page mount
  loadCart = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        this.setState({cartList: data.cartList})
      }
    } catch (error) {
      console.error('Failed to load cart:', error)
    }
  }

  // POST /cart — add item (backend increments qty if already exists)
  addCartItem = async product => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(product),
      })
      if (response.ok) {
        const data = await response.json()
        this.setState({cartList: data.cartList})
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
      // Optimistic fallback — keep UI working if network fails
      this.setState(prevState => {
        const exists = prevState.cartList.find(item => item.id === product.id)
        if (exists) {
          return {
            cartList: prevState.cartList.map(item =>
              item.id === product.id
                ? {...item, quantity: item.quantity + product.quantity}
                : item,
            ),
          }
        }
        return {cartList: [...prevState.cartList, product]}
      })
    }
  }

  // DELETE /cart/:productId — remove single item
  removeCartItem = async id => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        this.setState({cartList: data.cartList})
      }
    } catch (error) {
      console.error('Failed to remove cart item:', error)
      this.setState(prevState => ({
        cartList: prevState.cartList.filter(item => item.id !== id),
      }))
    }
  }

  // DELETE /cart — clear entire cart (only this user's cart)
  removeAllCartItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })
      if (response.ok) {
        this.setState({cartList: []})
      }
    } catch (error) {
      console.error('Failed to clear cart:', error)
      this.setState({cartList: []})
    }
  }

  // PUT /cart/:productId — increment quantity by 1
  incrementCartItemQuantity = async id => {
    const item = this.state.cartList.find(i => i.id === id)
    if (!item) return
    const newQuantity = item.quantity + 1
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({quantity: newQuantity}),
      })
      if (response.ok) {
        const data = await response.json()
        this.setState({cartList: data.cartList})
      }
    } catch (error) {
      console.error('Failed to increment quantity:', error)
      this.setState(prevState => ({
        cartList: prevState.cartList.map(i =>
          i.id === id ? {...i, quantity: i.quantity + 1} : i,
        ),
      }))
    }
  }

  // PUT /cart/:productId — decrement quantity by 1 (quantity 0 removes item via backend)
  decrementCartItemQuantity = async id => {
    const item = this.state.cartList.find(i => i.id === id)
    if (!item) return
    const newQuantity = item.quantity - 1
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({quantity: newQuantity}),
      })
      if (response.ok) {
        const data = await response.json()
        this.setState({cartList: data.cartList})
      }
    } catch (error) {
      console.error('Failed to decrement quantity:', error)
      if (newQuantity < 1) {
        this.setState(prevState => ({
          cartList: prevState.cartList.filter(i => i.id !== id),
        }))
      } else {
        this.setState(prevState => ({
          cartList: prevState.cartList.map(i =>
            i.id === id ? {...i, quantity: i.quantity - 1} : i,
          ),
        }))
      }
    }
  }

  render() {
    const {cartList} = this.state

    return (
      <CartContext.Provider
        value={{
          cartList,
          loadCart: this.loadCart,
          addCartItem: this.addCartItem,
          removeCartItem: this.removeCartItem,
          removeAllCartItems: this.removeAllCartItems,
          incrementCartItemQuantity: this.incrementCartItemQuantity,
          decrementCartItemQuantity: this.decrementCartItemQuantity,
        }}
      >
        <Switch>
          <Route exact path="/login" component={LoginForm} />
          <Route exact path="/register" component={RegisterForm} />
          <ProtectedRoute exact path="/" component={Home} />
          <ProtectedRoute exact path="/products" component={Products} />
          <ProtectedRoute
            exact
            path="/products/:id"
            component={ProductItemDetails}
          />
          <ProtectedRoute exact path="/cart" component={Cart} />
          <Route path="/not-found" component={NotFound} />
          <Redirect to="/not-found" />
        </Switch>
      </CartContext.Provider>
    )
  }
}

export default App
