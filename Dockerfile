# Use Node.js LTS as base image
FROM node:lts-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build TypeScript code
RUN npm run build

# Expose the port your app runs on
EXPOSE 8080

# Command to run your app
CMD ["npm", "start"]
