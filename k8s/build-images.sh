#!/bin/bash

# Build script for Docker images in Minikube
# This script builds all Docker images using Minikube's Docker daemon

set -e

echo "🔧 Setting up Minikube Docker environment..."

# Use Minikube's Docker daemon
eval $(minikube docker-env)

echo "📦 Building Docker images..."

# Build user-service
echo "Building user-service..."
docker build -t user-service:latest ./services/user-service

# Build product-service
echo "Building product-service..."
docker build -t product-service:latest ./services/product-service

# Build inventory-service
echo "Building inventory-service..."
docker build -t inventory-service:latest ./services/inventory-service

# Build order-service
echo "Building order-service..."
docker build -t order-service:latest ./services/order-service

# Build payment-service
echo "Building payment-service..."
docker build -t payment-service:latest ./services/payment-service

# Build notification-service
echo "Building notification-service..."
docker build -t notification-service:latest ./services/notification-service

# Build review-service
echo "Building review-service..."
docker build -t review-service:latest ./services/review-service

# Build search-service
echo "Building search-service..."
docker build -t search-service:latest ./services/search-service

# Build shipping-service
echo "Building shipping-service..."
docker build -t shipping-service:latest ./services/shipping-service

# Build analytics-service
echo "Building analytics-service..."
docker build -t analytics-service:latest ./services/analytics-service

# Build api-gateway
echo "Building api-gateway..."
docker build -t api-gateway:latest ./services/api-gateway

# Build frontend
echo "Building frontend..."
docker build -t frontend:latest ./frontend

echo "✅ All images built successfully!"
echo "📋 Listing built images:"
docker images | grep -E "(user-service|product-service|inventory-service|order-service|payment-service|notification-service|review-service|search-service|shipping-service|analytics-service|api-gateway|frontend)"

