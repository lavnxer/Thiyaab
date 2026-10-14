import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.jsx'
import MenPage from './pages/MenPage.jsx'
import WomenPage from './pages/WomenPage.jsx'
import AccessoriesPage from './pages/AccessoriesPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ProductPage from './pages/ProductPage.jsx'
import CartPage from './pages/CartPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import WishlistPage from './pages/WishlistPage.jsx'
import AccountPage from './pages/AccountPage.jsx'
import TrackOrderPage from './pages/TrackOrderPage.jsx'
import SizeGuidePage from './pages/SizeGuidePage.jsx'
import ProductReviewsPage from './pages/ProductReviewsPage.jsx'
import AdminDashboardPage from './pages/AdminDashboardPage.jsx'
import Navbar from './components/Navbar.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ShopProvider } from './context/ShopContext.jsx'
import './style.css'

function Layout({ children }) {
    return (
        <>
            <Navbar />
            {children}
        </>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <ShopProvider>
                    <ToastProvider>
                        <ScrollToTop />
                        <Routes>
                            <Route path="/" element={<Layout><App /></Layout>} />
                            <Route path="/men" element={<Layout><MenPage /></Layout>} />
                            <Route path="/women" element={<Layout><WomenPage /></Layout>} />
                            <Route path="/accessories" element={<Layout><AccessoriesPage /></Layout>} />
                            <Route path="/shoes" element={<Navigate to="/men?category=أحذية" replace />} />
                            <Route path="/fashion" element={<Navigate to="/men" replace />} />
                            <Route path="/product/:id" element={<Layout><ProductPage /></Layout>} />
                            <Route path="/cart" element={<Layout><CartPage /></Layout>} />
                            <Route path="/checkout" element={<Layout><CheckoutPage /></Layout>} />
                            <Route path="/wishlist" element={<Layout><WishlistPage /></Layout>} />
                            <Route path="/account" element={<Layout><AccountPage /></Layout>} />
                            <Route path="/track-order/:id" element={<Layout><TrackOrderPage /></Layout>} />
                            <Route path="/track-order" element={<Layout><TrackOrderPage /></Layout>} />
                            <Route path="/size-guide" element={<Layout><SizeGuidePage /></Layout>} />
                            <Route path="/reviews" element={<Layout><ProductReviewsPage /></Layout>} />
                            <Route path="/product/:id/reviews" element={<Layout><ProductReviewsPage /></Layout>} />
                            <Route path="/admin" element={<AdminDashboardPage initialTab="overview" />} />
                            <Route path="/admin/sales" element={<AdminDashboardPage initialTab="sales" />} />
                            <Route path="/admin/orders" element={<AdminDashboardPage initialTab="orders" />} />
                            <Route path="/admin/add-product" element={<AdminDashboardPage initialTab="add-product" />} />
                            <Route path="/admin/products" element={<AdminDashboardPage initialTab="products" />} />
                            <Route path="/admin/offer" element={<AdminDashboardPage initialTab="sections" />} />
                            <Route path="/admin/sections" element={<AdminDashboardPage initialTab="sections" />} />
                            <Route path="/login" element={<LoginPage />} />
                        </Routes>
                    </ToastProvider>
                </ShopProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>,
)
