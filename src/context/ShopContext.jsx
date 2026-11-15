import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { cartApi, wishlistApi, productsApi, ordersApi, settingsApi } from '../lib/api';
import { DEFAULT_HOME_OFFER } from '../data/homeOfferData';
import { DEFAULT_HOME_SECTIONS } from '../data/homeSectionsData';

const ShopContext = createContext();

export function ShopProvider({ children }) {
    const { user } = useAuth();

    // 0. Home Page Complete Sections State (Men Outfit, Best Sellers, Women Outfit, Offer Banner)
    const [homeSections, setHomeSections] = useState(() => {
        try {
            const saved = localStorage.getItem('thyiaab_home_sections');
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    menOutfit: { ...DEFAULT_HOME_SECTIONS.menOutfit, ...(parsed.menOutfit || {}) },
                    bestSellers: { ...DEFAULT_HOME_SECTIONS.bestSellers, ...(parsed.bestSellers || {}) },
                    womenOutfit: { ...DEFAULT_HOME_SECTIONS.womenOutfit, ...(parsed.womenOutfit || {}) },
                    offer: { ...DEFAULT_HOME_SECTIONS.offer, ...(parsed.offer || {}) }
                };
            }
        } catch (e) {
            console.error('Failed to parse home sections from localStorage:', e);
        }
        return DEFAULT_HOME_SECTIONS;
    });

    // 0.1 Home Page Offer Banner State (Synced across admin & store)
    // 0.1 Home Page Offer Banner State (Synced across admin & store)
    const [homeOffer, setHomeOffer] = useState(() => {
        try {
            const savedOffer = localStorage.getItem('thyiaab_home_offer');
            if (savedOffer) {
                const parsed = JSON.parse(savedOffer);
                if (parsed.imageOffsetX === 65 || parsed.imageOffsetX === 85 || parsed.imageOffsetX === 95) {
                    parsed.imageOffsetX = DEFAULT_HOME_OFFER.imageOffsetX;
                }
                let offer = { ...DEFAULT_HOME_OFFER, ...parsed };
                if (!offer.endTimestamp || isNaN(Number(offer.endTimestamp))) {
                    const daysMs = (Number(offer.durationDays) || 3) * 86400000;
                    const hoursMs = (Number(offer.durationHours) || 23) * 3600000;
                    const minsMs = (Number(offer.durationMinutes) || 15) * 60000;
                    const secsMs = (Number(offer.durationSeconds) || 33) * 1000;
                    offer.endTimestamp = Date.now() + daysMs + hoursMs + minsMs + secsMs;
                    localStorage.setItem('thyiaab_home_offer', JSON.stringify(offer));
                }
                return offer;
            }
            const savedSections = localStorage.getItem('thyiaab_home_sections');
            if (savedSections) {
                const parsed = JSON.parse(savedSections);
                if (parsed.offer) {
                    let offer = { ...DEFAULT_HOME_OFFER, ...parsed.offer };
                    if (!offer.endTimestamp || isNaN(Number(offer.endTimestamp))) {
                        const daysMs = (Number(offer.durationDays) || 3) * 86400000;
                        const hoursMs = (Number(offer.durationHours) || 23) * 3600000;
                        const minsMs = (Number(offer.durationMinutes) || 15) * 60000;
                        const secsMs = (Number(offer.durationSeconds) || 33) * 1000;
                        offer.endTimestamp = Date.now() + daysMs + hoursMs + minsMs + secsMs;
                        localStorage.setItem('thyiaab_home_offer', JSON.stringify(offer));
                    }
                    return offer;
                }
            }
        } catch (e) {
            console.error('Failed to parse home offer from localStorage:', e);
        }
        const initialOffer = {
            ...DEFAULT_HOME_OFFER,
            endTimestamp: Date.now() + (3 * 86400000) + (23 * 3600000) + (15 * 60000) + (33 * 1000)
        };
        try {
            localStorage.setItem('thyiaab_home_offer', JSON.stringify(initialOffer));
        } catch {}
        return initialOffer;
    });

    const updateHomeSection = useCallback((sectionKey, updatedData) => {
        setHomeSections(prev => {
            const currentSec = prev[sectionKey] || {};
            const newSec = typeof updatedData === 'function' ? updatedData(currentSec) : { ...currentSec, ...updatedData };
            const next = { ...prev, [sectionKey]: newSec };
            try {
                localStorage.setItem('thyiaab_home_sections', JSON.stringify(next));
                if (sectionKey === 'offer') {
                    localStorage.setItem('thyiaab_home_offer', JSON.stringify(newSec));
                    setHomeOffer(newSec);
                    window.dispatchEvent(new CustomEvent('thyiaab_home_offer_updated', { detail: newSec }));
                }
                window.dispatchEvent(new CustomEvent('thyiaab_home_sections_updated', { detail: next }));
            } catch (e) {
                console.error('Failed to save home section to localStorage:', e);
            }

            // Sync with Supabase store_settings asynchronously
            settingsApi.set('home_sections', next).catch(err => {
                console.error('Failed to sync home_sections with Supabase:', err);
            });
            if (sectionKey === 'offer') {
                settingsApi.set('home_offer', newSec).catch(err => {
                    console.error('Failed to sync home_offer with Supabase:', err);
                });
            }

            return next;
        });
    }, []);

    const resetHomeSection = useCallback((sectionKey) => {
        if (DEFAULT_HOME_SECTIONS[sectionKey]) {
            updateHomeSection(sectionKey, DEFAULT_HOME_SECTIONS[sectionKey]);
        }
    }, [updateHomeSection]);

    const resetAllHomeSections = useCallback(() => {
        setHomeSections(DEFAULT_HOME_SECTIONS);
        setHomeOffer(DEFAULT_HOME_SECTIONS.offer);
        try {
            localStorage.setItem('thyiaab_home_sections', JSON.stringify(DEFAULT_HOME_SECTIONS));
            localStorage.setItem('thyiaab_home_offer', JSON.stringify(DEFAULT_HOME_SECTIONS.offer));
            window.dispatchEvent(new CustomEvent('thyiaab_home_sections_updated', { detail: DEFAULT_HOME_SECTIONS }));
        } catch (e) {
            console.error('Failed to reset all home sections:', e);
        }
        // Sync reset with Supabase
        settingsApi.set('home_sections', DEFAULT_HOME_SECTIONS).catch(() => {});
        settingsApi.set('home_offer', DEFAULT_HOME_SECTIONS.offer).catch(() => {});
    }, []);

    const updateHomeOffer = useCallback((updatedOffer) => {
        updateHomeSection('offer', updatedOffer);
    }, [updateHomeSection]);

    const resetHomeOffer = useCallback(() => {
        resetHomeSection('offer');
    }, [resetHomeSection]);

    // Top Selling products calculated automatically from orders
    const [autoBestSellers, setAutoBestSellers] = useState([]);

    const fetchTopSellingProducts = useCallback(async () => {
        try {
            const [{ data: orders }, { data: products }] = await Promise.all([
                ordersApi.getAllOrders(),
                productsApi.getAll()
            ]);

            const salesCountMap = {};
            if (orders && orders.length > 0) {
                orders.forEach(order => {
                    const items = order.items || [];
                    items.forEach(it => {
                        const pid = String(it.product_id || it.productId || it.id || '');
                        if (pid) {
                            salesCountMap[pid] = (salesCountMap[pid] || 0) + (Number(it.quantity || it.qty) || 1);
                        }
                    });
                });
            }

            if (products && products.length > 0) {
                const enriched = products.map(p => ({
                    id: p.id,
                    name: p.name,
                    price: Number(p.price),
                    oldPrice: p.original_price ? Number(p.original_price) : null,
                    category: p.category?.name || 'أزياء',
                    image: p.image_url || (p.images && p.images[0]) || '/images/coat_transparent.png',
                    salesCount: salesCountMap[String(p.id)] || 0
                }));

                enriched.sort((a, b) => {
                    if (b.salesCount !== a.salesCount) return b.salesCount - a.salesCount;
                    return (b.price || 0) - (a.price || 0);
                });

                setAutoBestSellers(enriched);
            }
        } catch (err) {
            console.error('Failed to calculate top selling products:', err);
        }
    }, []);

    useEffect(() => {
        fetchTopSellingProducts();
    }, [fetchTopSellingProducts]);

    // Load remote store settings (Home Sections, Offers) from Supabase store_settings
    useEffect(() => {
        let isMounted = true;
        const loadRemoteSettings = async () => {
            try {
                const { data: remoteSections } = await settingsApi.get('home_sections');
                if (remoteSections && isMounted) {
                    setHomeSections(prev => ({
                        menOutfit: { ...DEFAULT_HOME_SECTIONS.menOutfit, ...(remoteSections.menOutfit || {}) },
                        bestSellers: { ...DEFAULT_HOME_SECTIONS.bestSellers, ...(remoteSections.bestSellers || {}) },
                        womenOutfit: { ...DEFAULT_HOME_SECTIONS.womenOutfit, ...(remoteSections.womenOutfit || {}) },
                        offer: { ...DEFAULT_HOME_SECTIONS.offer, ...(remoteSections.offer || {}) }
                    }));
                    if (remoteSections.offer) {
                        setHomeOffer(prev => ({ ...prev, ...remoteSections.offer }));
                    }
                    try {
                        localStorage.setItem('thyiaab_home_sections', JSON.stringify(remoteSections));
                    } catch {}
                }

                const { data: remoteOffer } = await settingsApi.get('home_offer');
                if (remoteOffer && isMounted) {
                    setHomeOffer(prev => ({ ...prev, ...remoteOffer }));
                    try {
                        localStorage.setItem('thyiaab_home_offer', JSON.stringify(remoteOffer));
                    } catch {}
                }
            } catch (err) {
                console.warn('Failed to load store settings from Supabase:', err);
            }
        };
        loadRemoteSettings();
        return () => { isMounted = false; };
    }, []);

    // Listen to custom event or storage event for multi-tab sync
    useEffect(() => {
        const handleSync = (e) => {
            if (e.detail) {
                setHomeSections(e.detail);
                if (e.detail.offer) setHomeOffer(e.detail.offer);
            } else {
                try {
                    const saved = localStorage.getItem('thyiaab_home_sections');
                    if (saved) {
                        const parsed = JSON.parse(saved);
                        setHomeSections(parsed);
                        if (parsed.offer) setHomeOffer(parsed.offer);
                    }
                } catch {}
            }
        };
        window.addEventListener('thyiaab_home_sections_updated', handleSync);
        window.addEventListener('thyiaab_home_offer_updated', handleSync);
        window.addEventListener('storage', handleSync);
        return () => {
            window.removeEventListener('thyiaab_home_sections_updated', handleSync);
            window.removeEventListener('thyiaab_home_offer_updated', handleSync);
            window.removeEventListener('storage', handleSync);
        };
    }, []);

    // 1. Instant state initialized from localStorage for ZERO latency (0ms)
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem('thyiaab_cart_items');
            if (!saved) return [];
            const parsed = JSON.parse(saved);
            if (!Array.isArray(parsed)) return [];
            const seen = new Set();
            return parsed.map((item, idx) => {
                let uniqueId = item.id;
                // If id is missing, or already seen, or identical to productId (was accidentally product.id):
                if (!uniqueId || seen.has(String(uniqueId)) || (item.productId && String(uniqueId) === String(item.productId))) {
                    uniqueId = `cart-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 8)}`;
                }
                seen.add(String(uniqueId));
                return {
                    ...item,
                    id: uniqueId,
                    productId: item.productId || item.product_id || item.id
                };
            });
        } catch {
            return [];
        }
    });

    const [wishlistItems, setWishlistItems] = useState(() => {
        try {
            const saved = localStorage.getItem('thyiaab_wishlist_items');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Fast lookup Set of wishlisted product IDs
    const wishlistIds = useMemo(() => {
        return new Set(wishlistItems.map(item => String(item.id || item.productId || item)));
    }, [wishlistItems]);

    // Instant counts
    const cartCount = useMemo(() => {
        return cartItems.reduce((sum, item) => sum + (Number(item.qty) || 1), 0);
    }, [cartItems]);

    const wishlistCount = useMemo(() => {
        return wishlistItems.length;
    }, [wishlistItems]);

    // Sync to localStorage immediately on any change
    useEffect(() => {
        try {
            localStorage.setItem('thyiaab_cart_items', JSON.stringify(cartItems));
        } catch (e) {
            console.error('Failed to save cart to localStorage:', e);
        }
    }, [cartItems]);

    useEffect(() => {
        try {
            localStorage.setItem('thyiaab_wishlist_items', JSON.stringify(wishlistItems));
        } catch (e) {
            console.error('Failed to save wishlist to localStorage:', e);
        }
    }, [wishlistItems]);

    // 2. Background synchronization with Supabase when user logs in
    useEffect(() => {
        if (!user) return;
        let isMounted = true;

        // Fetch Supabase Cart
        cartApi.getItems().then(({ data, error }) => {
            if (!isMounted || error || !data) return;
            const mapped = data.map(item => ({
                id: item.id,
                productId: item.product_id,
                name: item.product?.name || 'منتج من المتجر',
                category: item.product?.category?.slug || item.product?.category?.name || 'clothes',
                price: Number(item.product?.price) || 299,
                oldPrice: item.product?.original_price ? Number(item.product?.original_price) : null,
                qty: item.quantity || 1,
                size: item.size || 'L',
                color: item.color || 'أسود',
                img: item.product?.image_url || '/images/coat_transparent.png',
                availableSizes: item.product?.sizes?.map(s => s.size) || [],
                availableColors: item.product?.colors?.map(c => c.name) || [],
                colorObjects: item.product?.colors || [],
                product: item.product || null
            }));
            setCartItems(mapped);
        });

        // Fetch Supabase Wishlist
        wishlistApi.getItems().then(({ data, error }) => {
            if (!isMounted || error || !data) return;
            const mapped = data.map(row => ({
                id: row.product?.id || row.product_id,
                productId: row.product?.id || row.product_id,
                wishlistRowId: row.id,
                name: row.product?.name || 'منتج فاخر',
                price: Number(row.product?.price || 0),
                oldPrice: row.product?.original_price ? Number(row.product.original_price) : null,
                discountText: row.product?.original_price ? `وفر ${(Number(row.product.original_price) - Number(row.product.price)).toFixed(0)} ر.س` : null,
                category: row.product?.category?.name || 'أزياء',
                rating: row.product?.rating || 5,
                reviewsCount: row.product?.reviews_count || 120,
                inStock: row.product?.in_stock !== false,
                img: row.product?.image_url || '/images/coat_transparent.png'
            }));
            setWishlistItems(mapped);
        });

        return () => { isMounted = false; };
    }, [user]);

    // --- INSTANT ACTION HANDLERS (0ms Delay) ---

    // Toggle Wishlist
    const toggleWishlist = useCallback((productId, productData = {}) => {
        const idStr = String(productId);
        const exists = wishlistIds.has(idStr);

        if (exists) {
            // Remove immediately
            setWishlistItems(prev => prev.filter(item => String(item.id || item.productId) !== idStr));
            if (user) {
                wishlistApi.removeItem(productId).catch(err => {
                    console.error('Background wishlist remove failed:', err);
                });
            }
            return false;
        } else {
            // Add immediately
            const newItem = {
                id: productId,
                productId: productId,
                name: productData.name || 'منتج فاخر',
                price: Number(productData.price || 0),
                oldPrice: productData.oldPrice ? Number(productData.oldPrice) : null,
                discountText: (productData.oldPrice || productData.original_price) ? `وفر ${(Number(productData.oldPrice || productData.original_price) - Number(productData.price)).toFixed(0)} ر.س` : null,
                category: productData.category || 'أزياء',
                rating: productData.rating || 5,
                reviewsCount: productData.reviews || productData.reviewsCount || 120,
                img: productData.img || productData.image || (productData.imgs && productData.imgs[0]) || '/images/coat_transparent.png',
                inStock: productData.inStock !== false
            };
            setWishlistItems(prev => [newItem, ...prev.filter(i => String(i.id || i.productId) !== idStr)]);
            if (user) {
                wishlistApi.addItem(productId).catch(err => {
                    console.error('Background wishlist add failed:', err);
                });
            }
            return true;
        }
    }, [wishlistIds, user]);

    // Remove from Wishlist
    const removeFromWishlist = useCallback((productId) => {
        const idStr = String(productId);
        // Instant state update
        setWishlistItems(prev => prev.filter(item => String(item.id || item.productId) !== idStr));
        if (user) {
            wishlistApi.removeItem(productId).catch(err => {
                console.error('Background wishlist remove failed:', err);
            });
        }
    }, [user]);

    // Clear Wishlist
    const clearWishlist = useCallback(async () => {
        const snapshot = [...wishlistItems];
        setWishlistItems([]);
        if (user) {
            for (const item of snapshot) {
                const targetId = item.id || item.productId;
                if (targetId) wishlistApi.removeItem(targetId).catch(() => {});
            }
        }
    }, [wishlistItems, user]);

    // Is Wishlisted predicate
    const isWishlisted = useCallback((productId) => {
        return wishlistIds.has(String(productId));
    }, [wishlistIds]);

    // Add to Cart
    const addToCart = useCallback((item) => {
        const prodId = item.productId || item.id;
        const size = item.size || '';
        const color = item.color || '';
        const qtyToAdd = Number(item.qty) || 1;
        const uniqueCartRowId = item.cartItemId || (typeof item.id === 'string' && item.id.startsWith('cart-') ? item.id : `cart-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);

        // Compute max available stock
        let itemMaxStock = 99;
        if (item.maxStock !== undefined && item.maxStock !== null) {
            itemMaxStock = Number(item.maxStock);
        } else if (item.stockQty !== undefined && item.stockQty !== null) {
            itemMaxStock = Number(item.stockQty);
        } else if (item.product?.sizes && Array.isArray(item.product.sizes)) {
            const sz = item.product.sizes.find(s => s.size === size);
            if (sz?.stock_qty !== undefined && sz?.stock_qty !== null) {
                itemMaxStock = Number(sz.stock_qty);
            }
        }

        setCartItems(prev => {
            const existingIndex = prev.findIndex(i => 
                String(i.productId || i.id) === String(prodId) && 
                i.size === size && 
                i.color === color
            );

            if (existingIndex > -1) {
                const currentQty = Number(prev[existingIndex].qty) || 1;
                const effectiveMax = prev[existingIndex].maxStock !== undefined 
                    ? Number(prev[existingIndex].maxStock) 
                    : itemMaxStock;

                if (currentQty >= effectiveMax) {
                    return prev;
                }

                const updated = [...prev];
                const newQty = Math.min(currentQty + qtyToAdd, effectiveMax);
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    qty: newQty,
                    maxStock: effectiveMax
                };
                return updated;
            } else {
                const allowedQty = Math.min(qtyToAdd, itemMaxStock);
                const newCartItem = {
                    id: uniqueCartRowId,
                    productId: prodId,
                    name: item.name || 'منتج فاخر',
                    price: Number(item.price || 0),
                    oldPrice: item.oldPrice ? Number(item.oldPrice) : null,
                    qty: allowedQty,
                    maxStock: itemMaxStock,
                    size,
                    color,
                    img: item.img || item.image || (item.imgs && item.imgs[0]) || '/images/coat_transparent.png',
                    category: item.category || 'أزياء',
                    availableSizes: item.availableSizes || (item.sizes ? item.sizes.map(s => typeof s === 'string' ? s : s.size) : []),
                    availableColors: item.availableColors || (item.colors ? item.colors.map(c => typeof c === 'string' ? c : c.name) : []),
                    colorObjects: item.colorObjects || item.colors || [],
                    product: item.product || null
                };
                return [newCartItem, ...prev];
            }
        });

        // Background persistence
        if (user && prodId) {
            cartApi.addItem(prodId, color, size, qtyToAdd).then(({ data }) => {
                if (data?.id) {
                    // Update temp local id to real database id silently
                    setCartItems(prev => prev.map(ci => 
                        ci.id === uniqueCartRowId
                            ? { ...ci, id: data.id }
                            : ci
                    ));
                }
            }).catch(err => {
                console.error('Background cart add failed:', err);
            });
        }
    }, [user]);

    // Remove from Cart
    const removeFromCart = useCallback((itemId) => {
        setCartItems(prev => prev.filter(i => i.id !== itemId));
        if (user && typeof itemId === 'string' && itemId.includes('-') && !itemId.startsWith('cart-')) {
            cartApi.removeItem(itemId).catch(err => {
                console.error('Background cart remove failed:', err);
            });
        }
    }, [user]);

    // Update Cart Quantity
    const updateCartQty = useCallback((itemId, newQty) => {
        if (newQty <= 0) {
            removeFromCart(itemId);
            return;
        }

        let effectiveQty = newQty;
        setCartItems(prev => prev.map(i => {
            if (i.id === itemId) {
                const maxStock = i.maxStock !== undefined ? Number(i.maxStock) : 99;
                effectiveQty = Math.min(newQty, maxStock);
                return { ...i, qty: effectiveQty };
            }
            return i;
        }));

        if (user && typeof itemId === 'string' && itemId.includes('-') && !itemId.startsWith('cart-')) {
            cartApi.updateQuantity(itemId, effectiveQty).catch(err => {
                console.error('Background cart update failed:', err);
            });
        }
    }, [removeFromCart, user]);

    // Clear Cart
    const clearCart = useCallback(() => {
        setCartItems([]);
        if (user) {
            cartApi.clearCart().catch(err => {
                console.error('Background cart clear failed:', err);
            });
        }
    }, [user]);

    const value = useMemo(() => ({
        cartItems,
        wishlistItems,
        cartCount,
        wishlistCount,
        wishlistIds,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        isWishlisted,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        setCartItems,
        setWishlistItems,
        homeOffer,
        updateHomeOffer,
        resetHomeOffer,
        homeSections,
        updateHomeSection,
        resetHomeSection,
        resetAllHomeSections,
        autoBestSellers,
        fetchTopSellingProducts
    }), [
        cartItems,
        wishlistItems,
        cartCount,
        wishlistCount,
        wishlistIds,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        isWishlisted,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        homeOffer,
        updateHomeOffer,
        resetHomeOffer,
        homeSections,
        updateHomeSection,
        resetHomeSection,
        resetAllHomeSections,
        autoBestSellers,
        fetchTopSellingProducts
    ]);

    return (
        <ShopContext.Provider value={value}>
            {children}
        </ShopContext.Provider>
    );
}

export function useShop() {
    const context = useContext(ShopContext);
    if (!context) {
        throw new Error('useShop must be used within a ShopProvider');
    }
    return context;
}
