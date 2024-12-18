# Haras: Blockchain-Based Horse Management System

Haras is a comprehensive platform that revolutionizes horse management by leveraging hashgraph technology. Built on Hedera Hashgraph, it provides a secure, transparent, and efficient way to manage horse records, from medical history to lineage and competition achievements.

## Overview

Haras utilizes Hedera Hashgraph's powerful features to deliver:
- **Immutable Records**: Secure storage of medical records, competition history, and genealogical data
- **Dynamic NFTs**: Representing horses with updateable metadata
- **Lineage Tracking**: Verifiable pedigree information
- **Event Management**: Track and verify competition results and achievements

## Key Features

### Horse Management
- **Digital Profiles**: Comprehensive horse information management
- **Medical Records**: Secure storage of veterinary records and treatments
- **Competition History**: Track achievements and performance
- **Lineage Records**: Maintain accurate breeding and pedigree information

### Hashgraph Integration
- **NFT Creation**: Each horse is represented as a unique NFT
- **Dynamic Updates**: Real-time updates to horse information
- **Verifiable History**: All changes are tracked on the chain

## Technology Stack

### Frontend
- **Framework**: Next.js 15.0.0
- **UI Components**: Radix UI, Shadcn UI
- **Styling**: Tailwind CSS
- **Language**: TypeScript

### Backend
- **Framework**: NestJS
- **Language**: TypeScript

### Blockchain
- **Platform**: Hedera Hashgraph
- **Features**: NFT Service, File Service

### Infrastructure
- **Cloud**: Google Cloud Platform
- **Process Manager**: PM2
- **Environment**: dotenv

## Local Development Setup

1. **Prerequisites**

```bash
    Install Node.js (v18 or higher)
    Install PM2 globally
    npm install -g pm2
```

2. **Clone the Repository**

```bash
    git clone https://github.com/your-username/haras-project.git
    cd haras-project
```

3. **Environment Setup**

```bash
    Create .env files
    cp .env.example .env
    cp frontend/.env.example frontend/.env.local
    cp backend/.env.example backend/.env
```

4. **Install Dependencies**

```bash
    Install all dependencies (frontend and backend)
    npm install
```

5. **Development Mode**

```bash
    Run both frontend and backend in development mode
    npm run dev
    Or run separately
    npm run dev:frontend
    npm run dev:backend
```

6. **Production Build**

```bash
    Build both applications
    npm run build

    Start production services
    npm run production:start
```

