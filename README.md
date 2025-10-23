# TS Node React Mongo Boilerplate

This is a full-stack boilerplate project using TypeScript, Node.js, React, and MongoDB. It includes a client-side application, a server-side rendered application, and an API, all configured to work together in a monorepo structure.

## Features

-   **Full-stack TypeScript:** A consistent language across the entire stack (frontend, backend, and shared code).
-   **Monorepo Architecture:** Manages multiple projects (`api`, `client`, `ssr`, `lib`) in a single repository.
-   **Three-Tier Application Structure:**
    -   `client`: A modern React single-page application (built with Vite) for a rich, dynamic user experience and the admin panel.
    -   `api`: A robust Node.js backend (with Express) serving the business logic and data.
    -   `ssr`: A Next.js application for server-side rendering, ideal for SEO-friendly public pages.
-   **Authentication Flow:**
    -   Secure JWT (JSON Web Token) based authentication.
    -   Uses `accessToken` for API requests and a secure `refreshToken` (stored in an HTTP-only cookie) to refresh sessions.
    -   Includes sign-in, sign-up, and logout functionalities.
-   **Admin Panel:**
    -   A feature-rich admin interface built with Ant Design.
    -   Provides a layout with a collapsible side menu for navigation.
    -   Ready for managing users and viewing statistics.
-   **Database:**
    -   Integrated with MongoDB for a flexible, scalable NoSQL database solution.
-   **State Management:**
    -   Uses Redux Toolkit on the client-side for efficient and predictable state management.
-   **Code Quality & Development Experience:**
    -   Pre-configured with Prettier for consistent code formatting.
    -   `nodemon` for automatic server restarts during development.
    -   Vite for a fast and modern frontend development experience.
-   **Shared Code:**
    -   A dedicated `lib` directory allows sharing of TypeScript interfaces, types, and utility functions across the `api`, `client`, and `ssr` applications, ensuring consistency and reducing code duplication.
-   **Production Ready:**
    -   `pm2` configuration (`ecosystem.config.json`) for process management in production.
    -   An example `nginx.conf` for setting up a reverse proxy.
    -   A `vps-setup.sh` script to streamline server provisioning and deployment.

## Structure

-   `api`: The Node.js backend API.
-   `client`: The React client-side application (Admin Panel).
-   `ssr`: The Next.js server-side rendered application.
-   `lib`: Shared libraries, interfaces, and utilities.

## Installation

To create a new project using this boilerplate, run the following command:

```bash
npx i -g ts-node-react-mongo-boilerplate
npx ts-node-react-mongo-boilerplate your-project-name
```

## Development

To run the applications in development mode, navigate to the respective directories (first in project root, `api`, `client`, `ssr`) and run:

```bash
npm i
npm run dev
```

## Production

The `vps-setup.sh` script provides instructions for setting up a VPS for production. It includes steps for installing dependencies, configuring Nginx, and setting up SSL with Certbot. The `ecosystem.config.json` file is used by PM2 to manage the applications in a production environment.

**See detailed documentation with Deepwiki:**
https://deepwiki.com/AndLD/ts-node-react-mongo-boilerplate
