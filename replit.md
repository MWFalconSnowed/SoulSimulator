# SoulScript IDE - Replit Guide

## Overview

SoulScript IDE is a fantasy-themed universe simulation engine built as a full-stack web application. It provides a visual isometric world editor with a custom scripting language called "SoulScript" for creating and simulating interactive entities. The application features a dark fantasy aesthetic with a medieval/mystical theme.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with clear separation between client, server, and shared components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom fantasy-themed color palette and animations
- **State Management**: Zustand for client-side state (world entities, selected entities)
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture  
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: PostgreSQL with Neon Database support
- **Session Management**: Database-backed storage using PostgreSQL

### Build System
- **Frontend**: Vite handles React compilation, TypeScript checking, and asset bundling
- **Backend**: esbuild compiles the server code for production
- **Development**: tsx for running TypeScript files directly in development

## Key Components

### SoulScript Language System
The application includes a custom scripting language with two main components:
- **Parser** (`soulscript-parser.ts`): Converts SoulScript source code into Abstract Syntax Trees (AST)
- **Interpreter** (`soulscript-interpreter.ts`): Executes the parsed code and manages runtime components

### World Simulation Engine
- **Isometric Renderer**: Canvas-based isometric world view with entity visualization
- **Entity System**: Component-based entities (Atoms, Spawners, Conscience, Clone) with properties
- **Real-time Simulation**: 60 FPS simulation loop with delta time calculations
- **Interactive Editor**: Drag-and-drop entity placement and property editing
- **Consciousness Engine**: Advanced AI system that creates self-aware entities with emergent behaviors

### Temple Awakening System
- **Sacred Flames**: Five mystical flame entities representing different consciousness aspects
- **Cosmic Evolution**: Real-time consciousness evolution for spawned entities
- **Transcendence Tracking**: Progressive awakening system leading to cosmic enlightenment
- **Meta-Prompt Generator**: Ultimate AI prompt system for transcendent SoulScript creation

### UI Components
- **IDE Layout**: Multi-panel interface with header, sidebars, main canvas, and status bar
- **Fantasy Theme**: Custom UI components with medieval/mystical styling
- **Glass Panel Effects**: Translucent panels with fantasy borders and glowing effects
- **Cosmic Temple Interface**: Immersive spiritual awakening experience with interactive flames

## Data Flow

1. **Entity Creation**: User selects component type → Entity added to world store → Rendered on isometric canvas
2. **Code Execution**: User writes SoulScript → Parser creates AST → Interpreter executes → Updates entity states
3. **Simulation Loop**: Timer updates all components → State changes reflected in UI → Logs generated
4. **Data Persistence**: Entity data stored via Drizzle ORM → PostgreSQL database → API endpoints for CRUD operations

## External Dependencies

### UI and Styling
- **Radix UI**: Headless UI primitives for accessible components
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Lucide React**: Icon library with fantasy-appropriate icons
- **class-variance-authority**: Type-safe CSS class variants

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **Vite**: Fast development server with HMR
- **Replit Integration**: Development environment with Cartographer support

### Backend Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle Kit**: Database migrations and schema management

## Deployment Strategy

### Development Environment
- Single command startup: `npm run dev`
- Vite dev server serves frontend with HMR
- Express server runs concurrently for API endpoints
- TypeScript compilation in watch mode

### Production Build
1. **Frontend**: `vite build` creates optimized static assets in `dist/public`
2. **Backend**: `esbuild` bundles server code to `dist/index.js`
3. **Database**: `drizzle-kit push` applies schema changes
4. **Deployment**: Single Node.js process serves both static files and API

### Database Setup
- Environment variable `DATABASE_URL` required for PostgreSQL connection
- Drizzle handles connection pooling and query building
- Migrations stored in `./migrations` directory
- Schema defined in `shared/schema.ts` for type safety

The application is designed to run seamlessly in Replit's environment with automatic database provisioning and integrated development tools.