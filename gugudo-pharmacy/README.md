# Gugudo Pharmacy: Order Management System

Full-stack pharmacy ordering app.

- **Frontend:** React 18 + Vite + Tailwind + React Router
- **Backend:** Node.js + Express + Prisma + PostgreSQL
- **AI:** Claude API (customer chat, admin product-fill, admin reply drafts)
- **Languages:** English, Afaan Oromoo, Amharic. **Themes:** light and dark. Both are saved per user.

## Roles

| Role | Can do |
|---|---|
| Customer | Browse, register/login, cart, checkout (login required), Google Map address, prescription upload, order history and tracking, saved addresses, support messages, AI chat |
| Admin | Dashboard, all orders (status and payment), reply to support messages (with AI draft), customers (suspend), finance, products (add/edit/delete/image upload, AI fill) |
| Super admin | Everything an admin can do, plus create/suspend/delete admins, reset admin passwords, audit log |

## Setup

Requirements: Node 18+ and PostgreSQL.

```bash
# 1. Backend
cd server
cp .env.example .env        # edit DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY
npm install
npx prisma db push          # creates the tables
npm run seed                # demo users, categories, products
npm run dev                 # http://localhost:4000

# 2. Frontend (new terminal)
cd client
cp .env.example .env        # add VITE_GOOGLE_MAPS_KEY
npm install
npm run dev                 # http://localhost:5173
```

### Demo logins (from the seed)

- Super admin: `super@gugudo.com` / `Super@123`
- Admin: `admin@gugudo.com` / `Admin@123`
- Customer: `customer@gugudo.com` / `Customer@123`

**Change these passwords before going live.**

### Google Maps
Create a key in Google Cloud Console and enable **Maps JavaScript API** and **Geocoding API**. Put it in `client/.env` as `VITE_GOOGLE_MAPS_KEY`. Restrict the key to your domain.

### AI chat
Put your key in `server/.env` as `ANTHROPIC_API_KEY`. Without a key the app still works and the chat replies that it is not configured.

## Project layout

```
server/
  prisma/schema.prisma, seed.js
  src/index.js
  src/routes/   auth, catalog, orders, me, admin, superadmin, ai
  src/middleware/auth.js   JWT + role guards
client/src/
  pages/    Home, Catalog, ProductDetail, Cart, Checkout, Orders, Addresses, Support, Auth
  admin/    Dashboard, Orders, Products, Messages, Customers, Finance, Admins, Audit
  components/  Navbar, MapPicker, ChatWidget, ProductCard, ui
  i18n.js   all three languages
  store.jsx cart, auth, language, theme
```

## Notes and next steps

- **Payments:** only Cash on Delivery is live. Add Chapa or Telebirr in `server/src/routes/orders.js` and set `paymentStatus` from their webhook.
- **File storage:** uploads go to `server/uploads`. Move to Cloudinary or S3 for production, since many hosts wipe local disks.
- **Delivery fee:** ETB 50, free over ETB 1,000. Change the constants in `orders.js` and `client/src/pages/Cart.jsx`.
- **Before launch:** add rate limiting (`express-rate-limit`), `helmet`, HTTPS, and a real email/SMS order notification.
- Prices are in ETB. The AI assistant never gives diagnoses or dosing advice.
