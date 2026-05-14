/**
 * Kashume - Luxury E-commerce Project Structure
 * 
 * src/
 * ├── assets/              # Static assets (logo, cinematic video placeholders)
 * ├── components/
 * │   ├── admin/           # Admin Dashboard specific components
 * │   │   ├── Sidebar.jsx
 * │   │   ├── OrderStats.jsx
 * │   │   └── ProductManager.jsx
 * │   ├── layout/          # Page wrappers
 * │   │   ├── Navbar.jsx (Glassmorphism)
 * │   │   ├── Footer.jsx
 * │   │   └── AdminLayout.jsx
 * │   ├── ui/              # Atomized UI components (Editorial style)
 * │   │   ├── Shimmer.jsx
 * │   │   ├── LiquidCursor.jsx
 * │   │   ├── SplitScrollHero.jsx
 * │   │   └── StaggeredGrid.jsx
 * │   └── shop/            # E-commerce specific
 * │       ├── ProductCard.jsx
 * │       ├── CartDrawer.jsx
 * │       └── BundleSelector.jsx
 * ├── context/             # Global State
 * │   ├── CartContext.jsx (Bundle logic included)
 * │   └── AuthContext.jsx
 * ├── hooks/
 * │   ├── useScentAnimation.js (Custom motion hook)
 * │   └── useSupabase.js
 * ├── lib/
 * │   └── supabaseClient.js
 * ├── pages/
 * │   ├── Home.jsx         # Hero + New Arrivals
 * │   ├── Vision.jsx       # Horizontal scroll story
 * │   ├── ProductDetail.jsx
 * │   └── admin/
 * │       ├── Dashboard.jsx
 * │       └── Orders.jsx
 * ├── styles/
 * │   ├── globals.css      # Tailwind directives + Serif fonts
 * │   └── animations.css   # Custom liquid transitions
 * └── types/               # TypeScript definitions (if applicable)
 * 
 * supabase/
 * └── migrations/          # Version-controlled DB schema
 */
