# MediFind - Medicine Availability Finder

The **Medicine Availability Finder System** is a comprehensive web-based platform designed to bridge the gap between patients and local pharmacies. Users can locate medicines available in real-time, reserve them, and easily collect them from participating pharmacies. Pharmacies can efficiently manage their inventory, track reservations, and analyze their sales through a dedicated dashboard.

## 🚀 Key Features

### For Customers
* **Real-time Search:** Search for medicines by brand or generic name.
* **Pharmacy Locator:** View nearby pharmacies with stock availability.
* **Secure Reservations:** Reserve medicines directly through the platform (with prescription upload support).
* **Token Verification:** Use a unique 6-digit token to securely collect reserved medicines.

### For Pharmacies
* **Inventory Management:** Add and manage medicine stock, batch numbers, and expiry dates (with bulk upload support).
* **Availability Toggle:** Easily switch pharmacy status between "Available" and "Offline" with a single click.
* **Order Fulfillment:** Approve or reject incoming customer reservations.
* **Analytics Dashboard:** Visualize sales, revenue, and order trends.

### For Administrators (Super Admin & Admins)
* **Approval Workflow:** Verify and approve new pharmacy registrations and document uploads.
* **User Management:** Monitor active customers, pharmacies, and manage platform access.
* **Audit Logs:** Track sensitive actions taken by administrators for complete transparency.

## 🛡️ Security Features
* **Secure Authentication:** JWT-based authentication using **HTTPOnly Cookies** to prevent Cross-Site Scripting (XSS) attacks.
* **Sanitized Inputs:** Integration of **DOMPurify** to sanitize dynamic HTML rendering and protect against XSS payloads.
* **Rate Limiting:** Login endpoints are protected against brute-force and dictionary attacks.
* **File Upload Security:** Strict validation on document and image uploads.

## 🛠️ Tech Stack
* **Frontend:** HTML5, Vanilla JavaScript, CSS3
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL (with Prisma ORM)
* **Authentication:** JWT, bcryptjs
* **Other Tools:** Nodemailer (Emails), Chart.js (Analytics), Multer (File Uploads)

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jatinthakur16/Medifind.git
   cd medifind-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add the following:
   ```env
   DATABASE_URL="your-postgresql-database-url"
   JWT_SECRET="your-secure-jwt-secret"
   GMAIL_USER="your-email@gmail.com"
   GMAIL_APP_PASSWORD="your-app-password"
   ```

4. **Initialize Database:**
   ```bash
   npx prisma db push
   node seed.js # (Optional) Seed the database with initial data
   ```

5. **Run the Application:**
   ```bash
   npm run dev
   ```
   *The server will start on port 5000 (or your configured port).*
