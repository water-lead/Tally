# Tally - Home Inventory Management App

## Overview

Tally is a home inventory management mobile application built as a progressive web app using React, TypeScript, and modern web technologies. The application allows users to track, manage, and organize their home inventory through multiple input methods including photo scanning, barcode scanning, QR codes, voice input, and manual entry.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom styling
- **Theme**: Custom theme provider with light/dark mode support

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with conventional HTTP methods
- **Middleware**: Session-based authentication with Replit Auth
- **File Uploads**: Multer for handling image uploads
- **Error Handling**: Centralized error handling middleware

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (Neon serverless)
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Authentication System
- **Provider**: Replit Auth with OpenID Connect
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **Security**: HTTP-only cookies with secure configuration
- **User Management**: Automatic user creation and profile management

### Data Models
- **Users**: Profile information with Replit integration
- **Categories**: Hierarchical organization with icons and colors
- **Items**: Comprehensive inventory items with metadata
- **Sessions**: Secure session storage (required for Replit Auth)

### File Management
- **Storage**: Local file system with configurable upload directory
- **Validation**: Image-only uploads with 5MB size limit
- **Processing**: Placeholder for future AI-powered image recognition

### UI/UX Design
- **Mobile-First**: Responsive design optimized for mobile devices
- **Component System**: Consistent design system with shadcn/ui
- **Navigation**: Bottom navigation for mobile app experience
- **Theming**: CSS variables for consistent color management

## Data Flow

### Item Creation Flow
1. User selects input method (photo, barcode, QR, voice, manual)
2. Frontend captures input and processes data
3. Form validation with Zod schemas
4. API request with optional file upload
5. Database persistence through Drizzle ORM
6. Real-time UI updates via TanStack Query

### Authentication Flow
1. User initiates login through Replit Auth
2. OpenID Connect authentication with Replit
3. Session creation in PostgreSQL
4. User profile creation/update
5. Secure cookie-based session management

### Data Synchronization
- **Real-time Updates**: TanStack Query for optimistic updates
- **Cache Management**: Automatic invalidation and refetching
- **Error Recovery**: Retry logic and error boundaries

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework

### Development Dependencies
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and developer experience
- **ESBuild**: Fast JavaScript bundling

### Authentication Dependencies
- **openid-client**: OpenID Connect implementation
- **passport**: Authentication middleware
- **express-session**: Session management

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: ESBuild bundles server code to `dist`
3. **Asset Optimization**: Automatic asset optimization and chunking

### Environment Configuration
- **Development**: Local development with Vite dev server
- **Production**: Express serves built static files
- **Database**: Environment-based database URL configuration

### Replit Integration
- **Development Tools**: Replit-specific development enhancements
- **Authentication**: Seamless Replit user authentication
- **Deployment**: Optimized for Replit hosting environment

### Database Management
- **Schema Updates**: Drizzle Kit for migration management
- **Connection Pooling**: Efficient database connection handling
- **Environment Variables**: Secure configuration management

## Changelog

```
Changelog:
- July 01, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```