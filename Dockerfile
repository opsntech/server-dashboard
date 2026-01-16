# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source files
COPY . .

# Build the frontend
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy server files
COPY server ./server

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./dist

# Create data directory
RUN mkdir -p /app/server/data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Run the server
CMD ["node", "server/index.js"]
