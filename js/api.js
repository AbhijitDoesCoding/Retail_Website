import { CONFIG } from './config.js';

// Initialize Supabase Client
const { createClient } = window.supabase;
export const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

export const api = {
    // Products
    async getProducts(brandId = null, category = null, searchQuery = '') {
        let query = supabase.from('products').select('*');
        
        if (brandId) {
            query = query.eq('brand_id', brandId);
        }
        
        if (category) {
            query = query.eq('category', category);
        }
        
        if (searchQuery) {
            query = query.ilike('name', `%${searchQuery}%`);
        }
        
        const { data, error } = await query.order('name');
        if (error) throw error;
        return data.map(p => this.normalizeProduct(p));
    },

    async getProductById(id) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('product_id', id)
            .single();
        if (error) throw error;
        return this.normalizeProduct(data);
    },

    normalizeProduct(product) {
        if (!product) return null;
        return {
            ...product,
            id: product.product_id // Fallback for components using .id
        };
    },

    // Brands
    async getBrands() {
        const { data, error } = await supabase
            .from('brands')
            .select('*')
            .order('name');
        if (error) throw error;
        return data;
    },

    // Auth
    async loginCustomer(email, password) {
        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (authError) throw authError;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not found after login');

        const { data, error } = await supabase
            .from('online_customer')
            .select('*')
            .eq('customer_id', user.id)
            .single();
            
        if (error || !data) throw new Error('Profile not found');
        return data;
    },

    async signupCustomer({ name, email, phone, password }) {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });
        
        if (error) {
            throw new Error(error.message);
        }
        
        const user = data.user;
        
        if (!user) {
            throw new Error("Please verify your email or try again.");
        }
        
        console.log("Auth User:", user);
        console.log("User ID:", user.id);

        const { data: existing } = await supabase
            .from("online_customer")
            .select("*")
            .eq("customer_id", user.id)
            .single();

        if (!existing) {
            const { error: insertError } = await supabase
                .from('online_customer')
                .insert([{
                    customer_id: user.id,
                    name: name,
                    email: email,
                    phone: phone
                }]);
                
            if (insertError) {
                console.error(insertError);
                throw new Error("Profile creation failed");
            }
        }
        
        // Return the newly created or existing profile
        const { data: profile } = await supabase
            .from('online_customer')
            .select('*')
            .eq('customer_id', user.id)
            .single();
            
        return profile;
    },

    async logoutCustomer() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // Orders
    async createOrder(orderData) {
        const { data, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select();
        if (error) throw error;
        return data[0];
    }
};
