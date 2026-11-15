import { supabase } from '../lib/supabase';
import { uploadProductImageDirect } from './imageUploader';

// In-memory query cache & deduplication to eliminate latency and redundant DB roundtrips
const productsQueryCache = new Map();
const inFlightProductRequests = new Map();

export const clearProductsCache = () => {
    productsQueryCache.clear();
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem('thyiaab_cache_products_men');
            localStorage.removeItem('thyiaab_cache_products_women');
            localStorage.removeItem('thyiaab_cache_products_unisex');
            localStorage.removeItem('thyiaab_cache_products_all');
        }
    } catch {}
};

// ============================================
// PRODUCTS API
// ============================================
export const productsApi = {
    // Get all products with colors and sizes (optimized with in-memory caching & in-flight deduplication)
    async getAll(filters = {}, options = { skipCache: false }) {
        const cacheKey = JSON.stringify(filters);
        const now = Date.now();

        if (!options.skipCache && productsQueryCache.has(cacheKey)) {
            const entry = productsQueryCache.get(cacheKey);
            if (now - entry.timestamp < 60000) { // 60 seconds memory TTL
                return { data: entry.data, error: null };
            }
        }

        if (inFlightProductRequests.has(cacheKey)) {
            return inFlightProductRequests.get(cacheKey);
        }

        const requestPromise = (async () => {
            try {
                let query = supabase
                    .from('products')
                    .select(`
                        *,
                        category:categories(id, name, slug),
                        colors:product_colors(id, name, hex, image_url),
                        sizes:product_sizes(id, size, in_stock, stock_qty)
                    `)
                    .order('created_at', { ascending: false });

                if (filters.category_id) {
                    query = query.eq('category_id', filters.category_id);
                }
                if (filters.gender) {
                    query = query.eq('gender', filters.gender);
                }
                if (filters.in_stock !== undefined) {
                    query = query.eq('in_stock', filters.in_stock);
                }
                if (filters.is_new) {
                    query = query.eq('is_new', true);
                }
                if (filters.is_featured) {
                    query = query.eq('is_featured', true);
                }
                if (filters.search) {
                    query = query.ilike('name', `%${filters.search}%`);
                }
                if (filters.minPrice) {
                    query = query.gte('price', filters.minPrice);
                }
                if (filters.maxPrice) {
                    query = query.lte('price', filters.maxPrice);
                }
                if (filters.categoryName) {
                    query = query.eq('category.name', filters.categoryName);
                }

                const { data, error } = await query;
                if (!error && data) {
                    productsQueryCache.set(cacheKey, { data, timestamp: Date.now() });
                }
                return { data, error };
            } finally {
                inFlightProductRequests.delete(cacheKey);
            }
        })();

        inFlightProductRequests.set(cacheKey, requestPromise);
        return requestPromise;
    },

    // Get single product by ID
    async getById(id) {
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                category:categories(id, name, slug),
                colors:product_colors(id, name, hex, image_url),
                sizes:product_sizes(id, size, in_stock, stock_qty)
            `)
            .eq('id', id)
            .single();
        return { data, error };
    },

    // Get products by category name
    async getByCategory(categoryName) {
        const { data: category } = await supabase
            .from('categories')
            .select('id')
            .eq('name', categoryName)
            .single();

        if (!category) return { data: [], error: null };

        return this.getAll({ category_id: category.id });
    },

    // Get sale products
    async getSaleProducts() {
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                category:categories(id, name, slug),
                colors:product_colors(id, name, hex, image_url),
                sizes:product_sizes(id, size, in_stock, stock_qty)
            `)
            .not('original_price', 'is', null)
            .order('created_at', { ascending: false });
        return { data, error };
    },

    // Admin: Create product
    async create(product) {
        const { colors, sizes, ...productData } = product;

        if (productData.stock !== undefined && productData.stock_qty === undefined) {
            productData.stock_qty = Number(productData.stock);
        }

        // Insert product
        const { data: newProduct, error: productError } = await supabase
            .from('products')
            .insert(productData)
            .select()
            .single();

        if (productError) return { data: null, error: productError };

        // Insert colors
        if (colors && colors.length > 0) {
            const colorRows = colors.map(c => ({
                product_id: newProduct.id,
                name: c.name,
                hex: c.hex,
                image_url: c.image || c.image_url || null
            }));
            await supabase.from('product_colors').insert(colorRows);
        }

        // Insert sizes
        if (sizes && sizes.length > 0) {
            const sizeRows = sizes.map(s => ({
                product_id: newProduct.id,
                size: s.size || s,
                in_stock: s.in_stock !== undefined ? s.in_stock : true,
                stock_qty: s.stock_qty || 0
            }));
            await supabase.from('product_sizes').insert(sizeRows);
        }

        clearProductsCache();
        return this.getById(newProduct.id);
    },

    // Admin: Update product
    async update(id, product) {
        const { colors, sizes, category, ...productData } = product;

        // Allowed columns in public.products table
        const allowedFields = [
            'name', 'description', 'price', 'original_price', 'category_id',
            'image_url', 'images', 'in_stock', 'is_new', 'is_featured',
            'rating', 'reviews_count', 'tags', 'gender', 'stock_qty'
        ];
        const updatePayload = {};
        for (const key of allowedFields) {
            if (productData[key] !== undefined) {
                updatePayload[key] = productData[key];
            }
        }
        if (productData.stock !== undefined && updatePayload.stock_qty === undefined) {
            updatePayload.stock_qty = Number(productData.stock);
        }
        if (productData.stockQty !== undefined && updatePayload.stock_qty === undefined) {
            updatePayload.stock_qty = Number(productData.stockQty);
        }
        if (productData.categoryId && !updatePayload.category_id) {
            updatePayload.category_id = productData.categoryId;
        }
        if (productData.originalPrice !== undefined && updatePayload.original_price === undefined) {
            updatePayload.original_price = productData.originalPrice;
        }
        if (productData.imageUrl && !updatePayload.image_url) {
            updatePayload.image_url = productData.imageUrl;
        }
        if (productData.image && !updatePayload.image_url) {
            updatePayload.image_url = productData.image;
        }
        if (productData.inStock !== undefined && updatePayload.in_stock === undefined) {
            updatePayload.in_stock = productData.inStock;
        }
        if (productData.isNew !== undefined && updatePayload.is_new === undefined) {
            updatePayload.is_new = productData.isNew;
        }

        let updateError = null;
        if (Object.keys(updatePayload).length > 0) {
            const res = await supabase
                .from('products')
                .update(updatePayload)
                .eq('id', id);
            updateError = res.error;
        }

        if (updateError) return { data: null, error: updateError };

        // Replace colors if provided
        if (colors) {
            await supabase.from('product_colors').delete().eq('product_id', id);
            if (colors.length > 0) {
                const colorRows = colors.map(c => ({
                    product_id: id,
                    name: c.name,
                    hex: c.hex,
                    image_url: c.image || c.image_url || null
                }));
                await supabase.from('product_colors').insert(colorRows);
            }
        }

        // Replace sizes if provided
        if (sizes) {
            await supabase.from('product_sizes').delete().eq('product_id', id);
            if (sizes.length > 0) {
                const sizeRows = sizes.map(s => ({
                    product_id: id,
                    size: s.size || s,
                    in_stock: s.in_stock !== undefined ? s.in_stock : ((s.stock_qty !== undefined ? s.stock_qty > 0 : true)),
                    stock_qty: s.stock_qty !== undefined ? Number(s.stock_qty) : 0
                }));
                await supabase.from('product_sizes').insert(sizeRows);
            }
        } else if (updatePayload.stock_qty !== undefined) {
            // Keep product_sizes in sync with the new total stock
            const { data: existingSizes } = await supabase
                .from('product_sizes')
                .select('id, size, stock_qty')
                .eq('product_id', id);

            if (existingSizes && existingSizes.length > 0) {
                const count = existingSizes.length;
                const totalStock = Number(updatePayload.stock_qty);
                const perSize = Math.floor(totalStock / count);
                const remainder = totalStock % count;

                for (let i = 0; i < count; i++) {
                    const allocated = perSize + (i === 0 ? remainder : 0);
                    await supabase
                        .from('product_sizes')
                        .update({
                            stock_qty: allocated,
                            in_stock: allocated > 0
                        })
                        .eq('id', existingSizes[i].id);
                }
            }
        }

        clearProductsCache();
        return this.getById(id);
    },

    // Admin: Delete product
    async delete(id) {
        clearProductsCache();
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        return { error };
    },

    // Direct client-side compressed upload to Supabase Storage
    async uploadImage(file, callbacks = {}) {
        try {
            const result = await uploadProductImageDirect(file, callbacks);
            return { url: result.url, fileName: result.fileName, error: null };
        } catch (error) {
            return { url: null, error };
        }
    }
};

// ============================================
// CATEGORIES API
// ============================================
export const categoriesApi = {
    async getAll() {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('sort_order', { ascending: true });
        return { data, error };
    },

    async create(category) {
        const { data, error } = await supabase
            .from('categories')
            .insert(category)
            .select()
            .single();
        return { data, error };
    }
};

// ============================================
// CART API
// ============================================
export const cartApi = {
    async getItems() {
        const { data, error } = await supabase
            .from('cart_items')
            .select(`
                *,
                product:products(
                    id, name, price, original_price, image_url, in_stock,
                    category:categories(id, name, slug),
                    colors:product_colors(id, name, hex, image_url),
                    sizes:product_sizes(id, size, in_stock, stock_qty)
                )
            `)
            .order('created_at', { ascending: false });
        return { data, error };
    },

    async addItem(productId, color = '', size = '', quantity = 1) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: { message: 'يجب تسجيل الدخول أولاً' } };

        // Check if item already exists with same color/size
        const { data: existing } = await supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .eq('color', color)
            .eq('size', size)
            .single();

        if (existing) {
            // Update quantity
            const { data, error } = await supabase
                .from('cart_items')
                .update({ quantity: existing.quantity + quantity })
                .eq('id', existing.id)
                .select(`*, product:products(id, name, price, original_price, image_url, in_stock)`)
                .single();
            return { data, error };
        }

        const { data, error } = await supabase
            .from('cart_items')
            .insert({
                user_id: user.id,
                product_id: productId,
                color,
                size,
                quantity
            })
            .select(`*, product:products(id, name, price, original_price, image_url, in_stock)`)
            .single();
        return { data, error };
    },

    async updateQuantity(cartItemId, quantity) {
        if (quantity <= 0) return this.removeItem(cartItemId);

        const { data, error } = await supabase
            .from('cart_items')
            .update({ quantity })
            .eq('id', cartItemId)
            .select(`*, product:products(id, name, price, original_price, image_url, in_stock)`)
            .single();
        return { data, error };
    },

    async removeItem(cartItemId) {
        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', cartItemId);
        return { error };
    },

    async clearCart() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: { message: 'Not authenticated' } };

        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id);
        return { error };
    },

    async getCount() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { count: 0 };

        const { count, error } = await supabase
            .from('cart_items')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
        return { count: count || 0, error };
    }
};

// ============================================
// WISHLIST API
// ============================================
export const wishlistApi = {
    async getItems() {
        const { data, error } = await supabase
            .from('wishlist')
            .select(`
                *,
                product:products(
                    *,
                    category:categories(id, name),
                    colors:product_colors(id, name, hex, image_url),
                    sizes:product_sizes(id, size, in_stock)
                )
            `)
            .order('created_at', { ascending: false });
        return { data, error };
    },

    async addItem(productId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: { message: 'يجب تسجيل الدخول أولاً' } };

        const { data, error } = await supabase
            .from('wishlist')
            .insert({ user_id: user.id, product_id: productId })
            .select()
            .single();
        return { data, error };
    },

    async removeItem(productId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: { message: 'Not authenticated' } };

        const { error } = await supabase
            .from('wishlist')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', productId);
        return { error };
    },

    async isInWishlist(productId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data } = await supabase
            .from('wishlist')
            .select('id')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .single();
        return !!data;
    }
};

// ============================================
// ADDRESSES API
// ============================================
export const addressesApi = {
    async getAll() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: [], error: null };

        const { data, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false });
        return { data, error };
    },

    async create(address) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: { message: 'Not authenticated' } };

        // If this is default, unset others
        if (address.is_default) {
            await supabase
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', user.id);
        }

        const insertPayload = {
            ...address,
            user_id: user.id,
            full_name: address.full_name || user.user_metadata?.full_name || 'العميل'
        };

        const { data, error } = await supabase
            .from('addresses')
            .insert(insertPayload)
            .select()
            .single();
        return { data, error };
    },

    async update(id, updates) {
        const { data: { user } } = await supabase.auth.getUser();
        if (updates.is_default && user) {
            await supabase
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', user.id);
        }

        const { data, error } = await supabase
            .from('addresses')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        return { data, error };
    },

    async delete(id) {
        const { error } = await supabase
            .from('addresses')
            .delete()
            .eq('id', id);
        return { error };
    }
};

// ============================================
// SAVED CARDS API
// ============================================
export const savedCardsApi = {
    async getAll() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: [], error: null };

        const { data, error } = await supabase
            .from('saved_cards')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false });
        return { data, error };
    },

    async create(card) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: { message: 'Not authenticated' } };

        if (card.is_default) {
            await supabase
                .from('saved_cards')
                .update({ is_default: false })
                .eq('user_id', user.id);
        }

        const { data, error } = await supabase
            .from('saved_cards')
            .insert({ ...card, user_id: user.id })
            .select()
            .single();
        return { data, error };
    },

    async delete(id) {
        const { error } = await supabase
            .from('saved_cards')
            .delete()
            .eq('id', id);
        return { error };
    }
};

// ============================================
// ORDERS API
// ============================================
export const ordersApi = {
    async getMyOrders(userId = null) {
        let uid = userId;
        if (!uid) {
            const { data: { user } } = await supabase.auth.getUser();
            uid = user?.id;
        }
        if (!uid) return { data: [], error: null };

        // Query orders with items
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                items:order_items(*)
            `)
            .eq('user_id', uid)
            .order('created_at', { ascending: false });

        if (!error && data) {
            return { data, error: null };
        }

        // Resilient fallback to basic orders if nested select encounters any constraint
        const { data: fallbackData, error: fallbackError } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', uid)
            .order('created_at', { ascending: false });

        return { data: fallbackData || [], error: fallbackError };
    },

    async getById(orderId) {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                items:order_items(
                    *,
                    product:products(id, name, image_url)
                )
            `)
            .eq('id', orderId)
            .single();
        return { data, error };
    },

    async getByOrderNumber(orderNumber) {
        if (!orderNumber) return { data: null, error: null };
        const cleanNum = String(orderNumber).trim();
        const withPrefix = cleanNum.startsWith('ORD-') ? cleanNum : `ORD-${cleanNum}`;
        const withoutPrefix = cleanNum.replace(/^ORD-/, '');

        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                items:order_items(
                    *,
                    product:products(id, name, image_url)
                )
            `)
            .or(`order_number.eq.${cleanNum},order_number.eq.${withPrefix},order_number.eq.${withoutPrefix}`)
            .limit(1)
            .maybeSingle();

        return { data, error };
    },

    async create(orderData, items) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: { message: 'يجب تسجيل الدخول أولاً' } };

        const generatedNum = orderData.order_number || `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
        const validStatuses = ['new', 'processing', 'shipping', 'delivered', 'cancelled'];
        const safeStatus = validStatuses.includes(orderData.status) ? orderData.status : 'new';

        // Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                ...orderData,
                status: safeStatus,
                user_id: user.id,
                order_number: generatedNum
            })
            .select()
            .single();

        if (orderError) return { data: null, error: orderError };

        // Create order items
        const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_image: item.product_image || '',
            price: item.price,
            quantity: item.quantity,
            color: item.color || '',
            size: item.size || ''
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) return { data: order, error: itemsError };

        // Automatically decrement product stock in Supabase for each purchased item
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        for (const item of items) {
            const prodId = item.product_id || item.productId || item.id;
            if (prodId && uuidRegex.test(prodId)) {
                try {
                    const qty = Math.max(1, Number(item.quantity || item.qty) || 1);
                    const { data: decRes, error: decErr } = await supabase.rpc('decrement_product_stock', {
                        p_product_id: prodId,
                        p_size: item.size || '',
                        p_quantity: qty
                    });
                    if (decErr) {
                        console.error(`Failed to decrement stock for item ${prodId}:`, decErr);
                    } else {
                        console.log(`Stock successfully decremented for item ${prodId}:`, decRes);
                    }
                } catch (stockErr) {
                    console.error('Failed to decrement stock for item:', prodId, stockErr);
                }
            }
        }

        // Notify client app about real-time stock reduction
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('thyiaab_stock_updated'));
        }

        // Clear cart after successful order
        await cartApi.clearCart();

        return { data: order, error: null };
    },

    // Admin: Get all orders
    async getAllOrders(statusFilter = null) {
        let query = supabase
            .from('orders')
            .select(`
                *,
                user:profiles!fk_orders_profiles(id, full_name, phone),
                items:order_items(
                    *,
                    product:products(id, name, image_url)
                )
            `)
            .order('created_at', { ascending: false });

        if (statusFilter && statusFilter !== 'all') {
            query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;
        return { data, error };
    },

    // Admin: Update order status
    async updateStatus(orderId, status) {
        const updates = { status };
        if (status === 'delivered') {
            updates.delivered_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('orders')
            .update(updates)
            .eq('id', orderId)
            .select()
            .single();
        return { data, error };
    },

    // Admin: Get dashboard stats
    async getDashboardStats() {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        // Today's stats
        const { data: todayOrders } = await supabase
            .from('orders')
            .select('total, status')
            .gte('created_at', todayStart)
            .neq('status', 'cancelled');

        // This month's stats
        const { data: monthOrders } = await supabase
            .from('orders')
            .select('total, status')
            .gte('created_at', monthStart)
            .neq('status', 'cancelled');

        // Total products count
        const { count: totalProducts } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });

        // Total customers
        const { count: totalCustomers } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'customer');

        const todayRevenue = todayOrders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
        const monthRevenue = monthOrders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;

        return {
            today: {
                revenue: todayRevenue,
                ordersCount: todayOrders?.length || 0,
                aov: todayOrders?.length ? Math.round(todayRevenue / todayOrders.length) : 0,
            },
            month: {
                revenue: monthRevenue,
                ordersCount: monthOrders?.length || 0,
                aov: monthOrders?.length ? Math.round(monthRevenue / monthOrders.length) : 0,
            },
            totalProducts: totalProducts || 0,
            totalCustomers: totalCustomers || 0,
        };
    }
};

// ============================================
// REVIEWS API
// ============================================
export const reviewsApi = {
    async getByProduct(productId) {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
            return { data: data || [], error };
        }

        const userIds = [...new Set(data.map(r => r.user_id).filter(Boolean))];
        if (userIds.length > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .in('id', userIds);

            const profileMap = (profiles || []).reduce((acc, p) => {
                acc[p.id] = p;
                return acc;
            }, {});

            const enriched = data.map(r => ({
                ...r,
                user: profileMap[r.user_id] || { id: r.user_id, full_name: 'عميل موثق', avatar_url: '' }
            }));
            return { data: enriched, error: null };
        }

        return { data, error: null };
    },

    async create(review) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: { message: 'يجب تسجيل الدخول أولاً' } };

        const { data, error } = await supabase
            .from('reviews')
            .insert({ ...review, user_id: user.id })
            .select('*')
            .single();

        if (error) return { data: null, error };

        const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', user.id)
            .single();

        return {
            data: {
                ...data,
                user: profile || { id: user.id, full_name: user.user_metadata?.full_name || 'عميل موثق', avatar_url: '' }
            },
            error: null
        };
    },

    async delete(reviewId) {
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', reviewId);
        return { error };
    }
};

// ============================================
// STORE SETTINGS API (Home offers, hero showcase, home sections)
// ============================================
export const settingsApi = {
    async get(key) {
        const { data, error } = await supabase
            .from('store_settings')
            .select('value')
            .eq('key', key)
            .maybeSingle();
        return { data: data?.value ?? null, error };
    },

    async set(key, value) {
        const { data, error } = await supabase
            .from('store_settings')
            .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
            .select()
            .single();
        return { data: data?.value ?? data, error };
    },

    async getAll() {
        const { data, error } = await supabase
            .from('store_settings')
            .select('*');
        if (error || !data) return { data: {}, error };
        const map = {};
        data.forEach(row => {
            map[row.key] = row.value;
        });
        return { data: map, error: null };
    }
};
