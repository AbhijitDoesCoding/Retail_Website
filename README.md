# LUXE | Premium Retail Web Experience

LUXE is a beautifully crafted, responsive customer-facing web application for a luxury retail brand. It provides a premium shopping experience featuring an Art Deco design aesthetic, dynamic category filtering, and a secure Supabase-powered authentication flow.

## 🌟 Features

- **Premium UI/UX**: Art Deco geometric hero pattern, deep maroon tones, and high-end typography (Playfair Display & Inter).
- **Dynamic Filtering**: Horizontally scrollable, text-based category filters that automatically update based on the selected brand.
- **Secure Authentication**: Fully integrated with Supabase Auth, ensuring passwords are not manually stored. Profile data securely linked to `online_customer` via Auth UUIDs.
- **Client-Side Routing**: A lightweight Vanilla JS SPA router for seamless navigation between Home, Shop, and Product Details without full page reloads.
- **Cart Management**: Intuitive sidebar cart with real-time total calculations and local storage persistence.

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES6 Modules), Vanilla CSS
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Authentication)
- **Fonts**: Google Fonts (Playfair Display, Inter)

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   ```

2. **Configure Supabase:**
   - Create a `js/config.js` file if it doesn't exist yet.
   - Add your Supabase project URL and anon key:
     ```javascript
     export const CONFIG = {
         SUPABASE_URL: "YOUR_SUPABASE_URL",
         SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY"
     };
     ```

3. **Run Locally:**
   Since this app uses ES6 Modules (`<script type="module">`), you need to serve it over a local web server (opening the file directly via `file://` will cause module loading errors).

   Using Python:
   ```bash
   python3 -m http.server 8000
   ```
   
   Using Node (if you have `npx` installed):
   ```bash
   npx serve .
   ```
   
   Then open `http://localhost:8000` or the provided local URL in your browser.

## 🗄️ Database Schema Context

This app interacts directly with the following key tables in your Supabase project:
- `products`: Product catalog containing items linked by `product_id`.
- `brands`: Brand information and categorization.
- `online_customer`: Stores customer profile details (`name`, `email`, `phone`) mapped cleanly to the Supabase `auth.users.id` via `customer_id`.
- `orders`: Tracks user orders mapped to their respective `customer_id`.
