# Overview

This is a lead management and booking system for a moving service business. The application allows users to manage leads from various channels, generate price quotes, book appointments, and process payments. It features a modern React frontend with a Node.js/Express backend and uses PostgreSQL with Drizzle ORM for data persistence.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client uses a React-based SPA built with Vite and TypeScript. The architecture follows a component-based design with:
- **UI Framework**: Shadcn/ui components built on Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

The frontend is organized into pages (dashboard, leads, bookings, payments, calendar, settings) with reusable components for forms, layout, and UI elements.

## Backend Architecture
The server uses Express.js with TypeScript in ESM format. Key architectural decisions:
- **API Design**: RESTful endpoints under `/api` prefix for leads, bookings, payments, and metrics
- **Data Storage**: In-memory storage implementation with interface abstraction for easy database migration
- **Request Logging**: Custom middleware for API request logging and response capture
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes

## Data Storage Solutions
The application uses Drizzle ORM with PostgreSQL for production-ready data persistence:
- **Schema Design**: Well-structured tables for merchants, leads, bookings, payments, pricing rules, and activities
- **Database Provider**: Neon serverless PostgreSQL configured through environment variables
- **Migration Strategy**: Drizzle Kit for schema migrations stored in `./migrations` directory
- **Type Safety**: Automatic TypeScript type generation from database schema

## Authentication and Authorization
Currently uses a simplified merchant system with a default merchant ID. The architecture supports multi-tenant expansion with proper merchant isolation in the data layer.

## External Dependencies

### Database and ORM
- **Neon Database**: Serverless PostgreSQL hosting for production deployment
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect
- **Drizzle Kit**: Migration and introspection tools for database management

### Frontend Libraries
- **TanStack Query**: Server state management, caching, and synchronization
- **Radix UI**: Headless component primitives for accessibility and customization
- **Wouter**: Minimal routing library for single-page applications
- **React Hook Form**: Performant form library with validation integration
- **Zod**: TypeScript-first schema validation for forms and API data

### Development Tools
- **Vite**: Fast build tool and development server with HMR support
- **Integration**: Custom plugins for development environment and error handling
- **ESLint & TypeScript**: Code quality and type checking tools

### Styling and UI
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **CSS Variables**: Dynamic theming system for consistent design tokens
- **PostCSS**: CSS processing with Tailwind and Autoprefixer plugins

The system is designed for scalability with clear separation between frontend and backend, allowing for independent deployment and potential microservices architecture in the future.
