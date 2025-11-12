#!/bin/bash

# Deployment script for Kubernetes
# This script applies all Kubernetes manifests in the correct order

set -e

NAMESPACE="ecommerce"

echo "🚀 Starting Kubernetes deployment..."

# Step 1: Create namespace
echo "📝 Step 1: Creating namespace..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Step 2: Apply ConfigMaps
echo "📝 Step 2: Applying ConfigMaps..."
kubectl apply -f k8s/configmaps/

# Step 3: Apply Secrets
echo "📝 Step 3: Applying Secrets..."
kubectl apply -f k8s/secrets/

# Step 4: Apply PVCs
echo "📝 Step 4: Applying PersistentVolumeClaims..."
kubectl apply -f k8s/pvcs/

# Wait for PVCs to be bound
echo "⏳ Waiting for PVCs to be bound..."
kubectl wait --for=condition=Bound pvc --all -n $NAMESPACE --timeout=120s

# Step 5: Apply StatefulSets for databases
echo "📝 Step 5: Applying StatefulSets for databases..."
kubectl apply -f k8s/statefulsets/

# Wait for databases to be ready
echo "⏳ Waiting for databases to be ready..."
kubectl wait --for=condition=ready pod -l app=user-db -n $NAMESPACE --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=product-db -n $NAMESPACE --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=inventory-db -n $NAMESPACE --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=order-db -n $NAMESPACE --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=payment-db -n $NAMESPACE --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=notification-db -n $NAMESPACE --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=review-db -n $NAMESPACE --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=search-db -n $NAMESPACE --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=shipping-db -n $NAMESPACE --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=analytics-db -n $NAMESPACE --timeout=300s || true

# Step 6: Apply database services
echo "📝 Step 6: Applying database services..."
kubectl apply -f k8s/services/db/

# Step 7: Apply microservice deployments
echo "📝 Step 7: Applying microservice deployments..."
kubectl apply -f k8s/deployments/

# Step 8: Apply microservice services
echo "📝 Step 8: Applying microservice services..."
kubectl apply -f k8s/services/app/

# Step 9: Apply Ingress
echo "📝 Step 9: Applying Ingress..."
kubectl apply -f k8s/ingress/

echo "✅ Deployment completed!"
echo ""
echo "📊 Checking deployment status..."
kubectl get pods -n $NAMESPACE
echo ""
echo "🔍 To check logs, use: kubectl logs -n $NAMESPACE <pod-name>"
echo "🌐 To access the application:"
echo "   - Get Minikube IP: minikube ip"
echo "   - Get Ingress URL: kubectl get ingress -n $NAMESPACE"
echo "   - Or use: minikube service frontend-service -n $NAMESPACE --url"

