# Use an official Node.js LTS image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy rest of the source
COPY . .

# Switch to non-root user
USER node

# Discord bots don't need exposed ports, but harmless if present
# EXPOSE 3000

# Start the bot
CMD ["npm", "start"]
