# Use Node.js LTS as base image
FROM node:lts-alpine

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./

# Install dependencies with yarn
RUN yarn install

# Copy the rest of the application
COPY . .

# Build TypeScript code
RUN yarn build

# Expose the port your app runs on
EXPOSE 8080

# Command to run your app
CMD ["yarn", "start"]