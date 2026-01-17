# Server Dashboard

A web-based dashboard for managing server infrastructure and microservice allocation.

## Features

- **Server Management**: Track servers with IP, hostname, account, environment, tags, and status
- **Service Segregation**: Drag-and-drop interface for allocating microservices across app servers with priority-based heap configuration
- **Multi-Environment Support**: Manage configurations across development, staging, and production environments
- **Role-Based Access**: Admin and viewer roles with JWT authentication
- **Export/Import**: Backup and restore server configurations as JSON

## Tech Stack

- **Frontend**: React, Vite, @dnd-kit
- **Backend**: Express.js, Node.js
- **Deployment**: Docker

## Quick Start

```bash
# Install dependencies
npm install

# Development
npm run dev

# Production build
npm run build
npm start
```

## Docker

```bash
docker build -t server-dashboard .
docker run -d -p 3001:3001 -v ./server/data:/app/server/data server-dashboard
```

## License

Private
