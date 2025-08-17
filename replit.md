# Smart Money Tracker AI

## Overview

Smart Money Tracker AI is an AI-powered cryptocurrency analytics platform designed for traders and investors. The application provides real-time whale transaction monitoring, AI-driven market sentiment analysis, wallet risk scoring, and interactive market insights. Built for the OpenServ AI Hackathon, it features a cyberpunk-themed UI with comprehensive crypto intelligence capabilities including whale tracking, AI trend analysis, wallet insights, and an AI assistant for real-time market queries.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**August 17, 2025**
- Successfully integrated Avalanche Fuji C-Chain testnet support with Web3 wallet connectivity
- Implemented comprehensive Web3 integration using ethers.js for MetaMask and Core wallet support
- Added automatic network detection and switching to Avalanche Fuji (Chain ID: 43113)
- Created Web3Manager utility class for wallet connection management and network operations
- Enhanced header component with real-time wallet status, balance display, and network warnings
- Integrated seamless network switching with automatic RPC configuration and block explorer links
- Added proper error handling for wallet installation detection and connection failures
- Implemented user-friendly dialogs for wallet selection and network switching
- Replaced static wallet address input with dynamic Web3 wallet integration
- Added comprehensive wallet state management with automatic reconnection on page reload
- Successfully completed migration from Replit Agent to standard Replit environment
- Fixed React forwardRef issues with PredictionCard component for proper Framer Motion compatibility
- Added comprehensive error handling for async operations to prevent unhandled promise rejections
- Updated TypeScript configuration to support top-level await with es2022 target
- Enhanced AI Trends page stability with proper error boundaries and logging
- Implemented robust OpenAI quota limit handling with intelligent fallback responses
- Fixed all TypeScript errors and LSP diagnostics
- Application now runs smoothly on localhost with proper error handling for API limits
- Verified all components are properly imported and functional

**August 16, 2025**
- Successfully migrated project from Replit Agent to standard Replit environment
- Transformed static Whale Tracker into dynamic, interactive experience with:
  - Live transaction feed with new entries every 5-10 seconds
  - Smooth animations and transitions throughout the interface
  - Interactive filter buttons with press animations and loading states
  - Animated risk score bars that fill from left to right for new transactions
  - Enhanced action buttons with hover/click feedback effects
  - Real-time transaction generation with varied data (addresses, amounts, assets)
  - Professional loading overlays and spinner animations
  - Entrance animations for new transactions sliding from top
  - Responsive design maintaining cyberpunk aesthetic
  - Complete client-server separation following security best practices

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Styling**: Tailwind CSS with cyberpunk/dark theme design system
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Charts**: Chart.js for real-time data visualization
- **Type Safety**: Full TypeScript implementation with strict configuration

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with local strategy and bcrypt for password hashing
- **Session Management**: Express sessions with memory store
- **API Design**: RESTful API with structured error handling and Zod validation
- **Deployment**: Vercel serverless functions with hybrid static/dynamic rendering

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database serverless connection
- **ORM**: Drizzle ORM with migrations support
- **Schema**: Comprehensive schema for users, wallets, transactions, AI insights, and alerts
- **Session Storage**: In-memory session store for development, configurable for production
- **Fallback Storage**: In-memory storage implementation for development/testing scenarios

### Authentication and Authorization
- **Strategy**: Passport.js local authentication with username/password
- **Security**: Bcrypt password hashing with salt rounds
- **Session Management**: Secure HTTP-only cookies with configurable expiry
- **CORS Configuration**: Flexible CORS setup for cross-origin requests
- **Input Validation**: Zod schemas for request validation and type safety

### AI Integration Architecture
- **Primary AI Service**: OpenAI API integration for natural language processing
- **Fallback System**: Custom agent implementation when OpenAI API is unavailable
- **Capabilities**: Sentiment analysis, risk scoring, market trend prediction
- **Agent Framework**: Extensible agent system with capability-based architecture
- **Real-time Processing**: AI insights generation for whale transactions and market data

## External Dependencies

### AI and Machine Learning Services
- **OpenAI API**: Primary AI service for natural language processing, sentiment analysis, and market insights
- **OpenServ SDK**: Alternative AI service integration for enhanced capabilities

### Blockchain Data Providers
- **Etherscan API**: Ethereum blockchain data and transaction monitoring
- **Moralis API**: Multi-chain blockchain data aggregation for whale tracking
- **Avalanche Fuji C-Chain**: Testnet integration for Web3 wallet connectivity and smart contract interactions

### Web3 Wallet Integration
- **MetaMask**: Browser extension wallet for Ethereum and EVM-compatible networks
- **Core Wallet**: Official Avalanche wallet with native AVAX support
- **Ethers.js**: Web3 library for blockchain interactions and wallet management

### Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL database hosting
- **Vercel**: Deployment platform for serverless functions and static hosting

### Development and Build Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across the entire application
- **Drizzle Kit**: Database migration and schema management
- **ESBuild**: Backend bundling for production deployment

### UI and Styling Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Chart.js**: Data visualization and real-time charts
- **Lucide React**: Icon library for consistent iconography

### Authentication and Security
- **Passport.js**: Authentication middleware and strategies
- **bcrypt**: Password hashing and security
- **Express Session**: Session management and storage
- **CORS**: Cross-origin resource sharing configuration