# Linkly

Linkly is a full-stack URL shortener and analytics platform built with **Remix (React Router v7)**, **React**, **TypeScript**, and **PostgreSQL**. It supports QR code generation, phishing detection, and provides a clean dashboard to monitor link performance.

---

## Features

- **URL Shortening**: Generate short URLs for any original URL.  
- **Click Analytics**:
  - Track traffic sources (direct, mail, social, referral, etc.)
  - Device type breakdown
  - Click activity over the last 7 days
  - Click activity by hour
- **QR Code Generation**: Generate QR codes for any short link.  
- **Phishing Detection**: Safely redirect or block malicious links.  
- **Responsive UI**: Built with React, Tailwind CSS, and Shadcn UI components.  

---

## Tech Stack

- **Frontend**: React, Remix (React Router v7), Tailwind CSS, Shadcn UI, TypeScript  
- **Backend**: Node.js, Remix, Drizzle ORM, PostgreSQL  
- **Session & Token Management**: Redis
- **Utilities**: Zod (validation), ioredis, QRCode generation  
- **Formatting & Linting**: ESLint, Prettier  

---

## Getting Started

### Prerequisites

- Node.js >= 20  
- PostgreSQL  
- Redis  

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/novanish/linkly
    cd linkly
    ```

2. Install dependencies:
    ```bash
    pnpm install
    ```

3. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Copy the contents from `.env.example` and fill in your database and Redis credentials.

4. Set up the database:
   - Ensure PostgreSQL is running.
   - Run the migrations:
   ```bash
   pnpm drizzle:push
   ```
   
5. Start the development server:
    ```bash
    pnpm dev
    ```

