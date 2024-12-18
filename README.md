# Haras: Blockchain-Based Horse Management System

Haras revolutionizes horse management by leveraging Hedera Hashgraph. It provides a secure, transparent, and efficient platform to manage horse records, including medical history, lineage, and competition achievements.

---

## 🚀 Overview

Haras harnesses the power of Hedera Hashgraph to deliver:
- **Immutable Records**: Secure storage for medical, competition, and genealogical data.
- **Dynamic NFTs**: Horses represented as NFTs with updateable metadata.
- **Lineage Tracking**: Verifiable and accurate pedigree information.
- **Event Management**: Reliable tracking of competition results.

---

## 🔑 Key Features

### Horse Management
- **Digital Profiles**: Centralized horse information management.
- **Medical Records**: Immutable storage for veterinary data and treatments.
- **Competition History**: Track achievements and performance.
- **Lineage Records**: Maintain accurate breeding and pedigree details.

### Hashgraph Integration
- **NFT Representation**: Each horse assigned a unique, dynamic NFT.
- **Real-Time Updates**: Instantly update horse information on the chain.
- **Verifiable Data**: Immutable history of all record changes.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js (v15.0.0)
- **UI Libraries**: Radix UI, Shadcn UI
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
- **Environment Management**: dotenv

---

## 🖥️ Local Development Setup

### 1. Prerequisites
- Install Node.js (v18 or higher).
- Install PM2 globally:
  ```bash
  npm install -g pm2
  ```

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/haras-project.git
cd haras-project
```

### 3. Environment Setup
Create `.env` files for configuration:
```bash
cp .env.example .env
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

### 4. Install Dependencies
Install all project dependencies:
```bash
npm install
```

### 5. Run in Development Mode
Run both frontend and backend:
```bash
npm run dev
```
Or run them separately:
```bash
npm run dev:frontend
npm run dev:backend
```

### 6. Build for Production
Build and start production services:
```bash
npm run build
npm run production:start
```

---
