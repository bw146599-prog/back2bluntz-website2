# Overview

This is a full-stack web application built with React frontend and Express backend, featuring a cannabis-themed "coming soon" landing page called "ELEVATION." The application uses a modern tech stack with TypeScript, Tailwind CSS, shadcn/ui components, and PostgreSQL database with Drizzle ORM. The frontend showcases an interactive gaming experience with social media integration, while the backend provides a foundation for user management and API endpoints.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, modern UI components
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and API caching
- **Component Structure**: Modular component architecture with separate pages, UI components, and custom hooks

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Development**: Hot reload with tsx for development, esbuild for production builds
- **API Structure**: RESTful API design with centralized route registration
- **Storage Interface**: Abstracted storage layer with in-memory implementation (MemStorage) that can be easily swapped for database implementation
- **Error Handling**: Centralized error handling middleware with structured error responses

## Database & ORM
- **Database**: PostgreSQL configured for production use
- **ORM**: Drizzle ORM with Drizzle Kit for schema management and migrations
- **Schema**: User management schema with username/password authentication foundation
- **Configuration**: Environment-based database URL configuration with migration support

## Development & Build System
- **Build Tool**: Vite for frontend bundling with React plugin and runtime error overlay
- **TypeScript**: Strict TypeScript configuration with path mapping for clean imports
- **Development**: Integrated development server with HMR, request logging, and error handling
- **Path Aliases**: Configured aliases for components (@/), shared code (@shared/), and assets (@assets/)

## UI/UX Design
- **Design System**: Dark theme with cannabis-inspired color palette (purple primary, green secondary)
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Interactive Elements**: Custom game component with leaf collection mechanics and score tracking
- **Animations**: CSS animations for floating elements, glowing effects, and interactive feedback

# External Dependencies

## UI & Component Libraries
- **shadcn/ui**: Complete component library built on Radix UI primitives
- **Radix UI**: Headless UI components for accessibility and behavior
- **Lucide React**: Icon library for consistent iconography
- **React Icons**: Additional icon set including social media icons

## Database & Backend Services
- **Neon Database**: Serverless PostgreSQL database provider (@neondatabase/serverless)
- **PostgreSQL**: Primary database engine with UUID support
- **Session Storage**: Connect-pg-simple for PostgreSQL session storage

## Development Tools
- **Replit Integration**: Replit-specific plugins for development environment and error handling
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer
- **Date Utilities**: date-fns for date manipulation and formatting

## Form & Validation
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation with Drizzle integration for type-safe database operations
- **Hookform Resolvers**: Integration between React Hook Form and validation libraries

## Development Utilities
- **Class Variance Authority**: Utility for creating variant-based component APIs
- **clsx**: Conditional class name utility
- **cmdk**: Command palette component for enhanced UX
- **Embla Carousel**: Carousel/slider functionality for interactive components