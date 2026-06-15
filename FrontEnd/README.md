# DokuMind FrontEnd Web Application

The **FrontEnd** application is a premium, modern, responsive Single Page Application (SPA) designed to serve as the user interface for DokuMind. It is tailored for high-quality user experience (UX) with dark-mode styling, glassmorphism, smooth interactive transitions, and responsive multi-dashboard layouts.

---

## 🛠️ Technology Stack

* **Core Framework**: `React 19` & `TypeScript`
* **Build Tool**: `Vite 8` (with HMR support)
* **Styling**: `Tailwind CSS 3/4` (via `@tailwindcss/vite` configuration)
* **Animations**: `Framer Motion` (for micro-animations and transition states)
* **Iconography**: `Lucide React`
* **Components**: Custom styled foundations built using Radix UI primitives & `shadcn`
* **Routing**: `React Router Dom v7`
* **API Client**: `Axios` (with preconfigured interceptors for automatic JWT silent token refresh)

---

## 📂 Project Structure & Pages

The application utilizes role-based authorization to render dedicated workspace layouts:

```text
src/
├── App.tsx             # Main entry point with route definitions
├── main.tsx            # React DOM mounting
├── index.css           # Global CSS variables and Tailwind imports
├── components/         # Reusable UI parts (buttons, modals, input elements, etc.)
├── pages/              # Specific views and layouts:
│   ├── auth/           # Login & Sign-up forms
│   ├── admin/          # Admin Layout & User Administration
│   ├── rh/             # HR Layout & Employee Management
│   ├── worker/         # Chat-only dashboard for basic workers
│   ├── assistant/      # Assistant Layout with document management & chat
│   ├── chat/           # Global chat module with SSE text streaming
│   ├── DocumentManagement.tsx # Shared file upload, listing, and deletion interface
│   └── RoleMock.tsx    # Mock interface to easily swap roles during testing
├── services/           # apiClient instance definitions
└── context/            # Global context providers (e.g. Theme, Authentication)
```

### 👤 Role-Based Portals

Depending on the role assigned to the authenticated user, the router serves a tailored layout:
* **Admin Dashboard (`/admin`)**:
  - Full permissions to manage enterprise documents.
  - CRUD operations over user profiles.
  - Interactive knowledge-grounded chat interface.
* **HR Manager Dashboard (`/rh`)**:
  - Add, update, and manage employee accounts inside the company.
  - Complete document upload and document database management capabilities.
  - Grounded chat.
* **Assistant Portal (`/assistant`)**:
  - Ingest new PDF documents.
  - Query knowledge via the chat panel.
* **Worker Portal (`/worker`)**:
  - Simple, streamlined, chat-only client. Allowed to query the company database but cannot edit or view document lists.

---

## 🚀 Getting Started

### 1. Installation
Navigate to the `FrontEnd` directory and install the project dependencies:
```bash
cd FrontEnd
npm install
```

### 2. Configure Environment Variables
Create or edit `.env` in the `FrontEnd` root:
```env
VITE_API_URL=http://localhost:8080
```

### 3. Start Development Server
Run the local Vite development server:
```bash
npm run dev
```
The application will launch on `http://localhost:5173`.
