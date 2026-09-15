# Project Declaration

**Project Name:** MediFind - Real-Time Medicine Availability Network
**Company:** JSL WORKS Private Limited (GSTIN: 09AAHCJ4226F1ZM)
**Program:** 45-Day Internship Journey at JSL WORKS Pvt Ltd / Summer Internship - 2026
**Duration:** June 10, 2026 – July 24, 2026

**Declaration:**
This project was developed by Team CodeBlooded (Group 5) as part of the Summer Internship 2026 program at JSL WORKS Pvt Ltd. All intellectual property, including logos, technical frameworks, and documentation, are the exclusive property of JSL WORKS Pvt Ltd, as per the Letter of Authorization provided by the company founder, Partho Ghosh.

---

# Project Overview

MediFind is a real-time, location-based medicine discovery and reservation platform. It bridges the gap between patients and local pharmacies by allowing users to instantly check live inventory, compare prices, and reserve stock before leaving their homes. The platform is built with a robust role-based architecture, providing dedicated portals for Customers, Pharmacy Owners, Pharmacists, and Administrators.

---

# Features

*   **Real-Time Medicine Search:** Users can search for medicines by brand or generic name and instantly see nearby pharmacies with available stock on an interactive map.
*   **Live Inventory & Pricing:** Customers view exact quantities and pricing, eliminating the uncertainty of calling or visiting multiple stores.
*   **Smart Reservation System:** Customers can hold stock for 30 minutes, ensuring the medicine is waiting for them upon arrival.
*   **Prescription Verification:** A secure upload flow for restricted medicines, requiring pharmacist approval before the reservation is finalized.
*   **Pharmacy Dashboard:** Allows pharmacy owners to manage their stock easily, including bulk uploading inventory via Excel/CSV files, viewing live analytics, and processing incoming orders.
*   **Pharmacist Desk:** A streamlined interface for pharmacists to review prescription uploads, verify collections, and access medicine information.
*   **Admin Console:** A centralized dashboard for platform administrators to verify new pharmacies, monitor user activity, and oversee platform health.

---

# Technologies Used

**Frontend**
*   HTML5 / Semantic UI Structure
*   Vanilla CSS (Custom Design System, CSS Variables)
*   JavaScript (ES6+, DOM Manipulation, Fetch API)
*   Chart.js (Analytics Dashboards)
*   Leaflet.js (Interactive Mapping)

**Backend**
*   Node.js & Express.js
*   PostgreSQL (Database)
*   Prisma ORM (Database schema and queries)
*   JSON Web Tokens (JWT) & bcrypt (Authentication and Security)
*   Multer (File Upload Handling)
*   XLSX (Parsing Excel/CSV inventory uploads)

---

# Folder Structure

```text
first_project/
├── medifind-backend/          # Node.js Backend Server
│   ├── prisma/                # PostgreSQL Schema & Migrations
│   ├── src/                   # Backend Source Code (Controllers, Routes, Models)
│   ├── uploads/               # Stored Prescription Files
│   ├── package.json           # Backend Dependencies
│   └── server.js              # Express Application Entry Point
├── index.html                 # Customer Portal & Landing Page
├── pharmacy-dashboard.html    # Pharmacy Owner Dashboard
├── pharmacist-desk.html       # Pharmacist Verification Desk
├── admin-console.html         # Administrator Console
├── login.html                 # User Authentication (Login)
├── signup.html                # User Authentication (Signup)
├── app.js                     # Core Frontend Logic & API Integration
├── data.js                    # Mock Data & Configurations
├── auth-guard.js              # Role-Based Route Protection
├── styles.css                 # Global Design System
└── README.md                  # Project Documentation
```

---

# Installation

1.  **Clone the repository:**
    Ensure you have pulled the latest code from the GitHub repository to your local machine.

2.  **Database Setup:**
    Ensure you have PostgreSQL installed and running. Create a new database for MediFind.

3.  **Backend Dependencies:**
    Navigate to the backend directory and install the required Node modules.
    ```bash
    cd medifind-backend
    npm install
    ```

4.  **Environment Variables:**
    Create a `.env` file inside the `medifind-backend` directory and add the following keys:
    ```env
    PORT=5000
    DATABASE_URL="postgresql://user:password@localhost:5432/medifind?schema=public"
    JWT_SECRET="your_secure_jwt_secret"
    ```

5.  **Prisma Migrations:**
    Push the database schema to your PostgreSQL instance.
    ```bash
    npx prisma db push
    ```

---

# Running the Project

1.  **Start the Backend Server:**
    Open a terminal, navigate to the backend folder, and start the development server.
    ```bash
    cd medifind-backend
    npm run dev
    ```
    The API will now be running on `http://localhost:5000`.

2.  **Start the Frontend:**
    You can run the frontend by serving the root directory using a local development server (e.g., VS Code Live Server, or Python's HTTP server).
    *Using Live Server:* Right-click `index.html` and select "Open with Live Server".
    The application will open in your browser, typically at `http://127.0.0.1:5500`.

---

# License

**Proprietary**
This project and all associated intellectual property, branding, and technical frameworks are the exclusive property of **JSL WORKS Pvt Ltd**. Unauthorized reproduction, dissemination, or use outside the scope of the 45-Day Internship Journey is strictly prohibited.
