# syntax=docker/dockerfile:1.4

# 1. For build React app
FROM node:lts AS builder

WORKDIR /app

# Copy package files first to leverage Docker cache for dependencies
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Set environment variables
ENV API=000000000
ENV PORT=3000

RUN npx update-browserslist-db@latest

# Build the app
RUN yarn build

# 2. For Nginx setup
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static assets from the builder stage
COPY --from=builder /app/dist .

# Containers run nginx with global directives and daemon off
CMD ["nginx", "-g", "daemon off;"]