# Auth System with Cloudflare R2 Media Upload

A complete authentication and user management system with role-based access control and Cloudflare R2 media upload capabilities.

## Features

- **Authentication System**
  - User registration with email verification
  - Login with JWT authentication
  - Password reset functionality
  - Email verification

- **User Management**
  - User profiles with update capabilities
  - Admin user management interface
  - Role-based access control

- **Role & Permission System**
  - Granular permission management
  - Role assignment to users
  - Permission assignment to roles

- **Media Upload System**
  - Direct-to-R2 uploads using presigned URLs
  - Support for multiple file types
  - Drag-and-drop interface
  - Progress tracking
  - File preview capabilities
  - CORS-compatible with fallback mechanism

- **Modern UI**
  - Responsive design
  - Dark/light theme support
  - Tailwind CSS styling

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM
- PostgreSQL database
- JWT authentication
- Cloudflare R2 for media storage (AWS S3 compatible)

### Frontend
- Vue.js 3 with Composition API
- Vite build tool
- TypeScript
- Tailwind CSS
- Pinia for state management
- Vue Router

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL database
- Cloudflare R2 bucket

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/aliahadmd/templates-ai.git
   cd auth-system
   ```

2. Install dependencies:
   ```bash
   npm install
   cd frontend
   npm install
   cd ..
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/auth_system"

   # JWT
   JWT_SECRET="your-jwt-secret"
   JWT_EXPIRES_IN="1d"
   JWT_REFRESH_SECRET="your-refresh-token-secret"
   JWT_REFRESH_EXPIRES_IN="7d"

   # Email
   EMAIL_HOST="smtp.example.com"
   EMAIL_PORT=587
   EMAIL_USER="your-email@example.com"
   EMAIL_PASSWORD="your-email-password"
   EMAIL_FROM="noreply@example.com"

   # Cloudflare R2
   CLOUDFLARE_R2_ACCESS_KEY_ID="your-access-key"
   CLOUDFLARE_R2_SECRET_ACCESS_KEY="your-secret-key"
   CLOUDFLARE_R2_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
   CLOUDFLARE_R2_BUCKET="your-bucket-name"
   CLOUDFLARE_R2_PUBLIC_URL="https://your-public-url.example.com"

   # Server
   PORT=3000
   NODE_ENV="development"
   ```

4. Create a `.env` file in the `frontend` directory:
   ```
   VITE_API_URL="http://localhost:3000"
   ```

5. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

6. Seed the database with initial data:
   ```bash
   npm run seed
   ```

### Running the Application

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. In a separate terminal, start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Access the application at `http://localhost:5173`

## Project Structure

```
├── prisma/                  # Database schema and migrations
├── src/                     # Backend source code
│   ├── config/              # Configuration files
│   ├── controllers/         # API controllers
│   ├── middlewares/         # Express middlewares
│   ├── routes/              # API routes
│   ├── services/            # Business logic services
│   ├── utils/               # Utility functions
│   └── index.ts             # Entry point
├── frontend/                # Frontend source code
│   ├── public/              # Static assets
│   ├── src/                 # Vue application
│   │   ├── assets/          # Frontend assets
│   │   ├── components/      # Vue components
│   │   ├── router/          # Vue Router configuration
│   │   ├── stores/          # Pinia stores
│   │   ├── utils/           # Utility functions
│   │   ├── views/           # Vue views/pages
│   │   ├── App.vue          # Root component
│   │   └── main.ts          # Entry point
│   ├── index.html           # HTML template
│   └── vite.config.ts       # Vite configuration
└── package.json             # Project dependencies and scripts
```

## Media Upload System

The media upload system uses Cloudflare R2 (S3-compatible storage) with a direct-to-R2 upload approach using presigned URLs. This approach offers several benefits:

1. **Reduced server load**: Files are uploaded directly from the client to R2
2. **Better performance**: No need to proxy large files through the server
3. **Scalability**: Can handle many concurrent uploads

### How It Works

1. The client requests a presigned URL from the server
2. The server generates a presigned URL with the AWS SDK
3. The client uploads the file directly to R2 using the presigned URL
4. If direct upload fails due to CORS, a fallback mechanism uploads through the server

### CORS Configuration

The system automatically configures CORS for the R2 bucket on server startup to allow direct uploads from the frontend.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 