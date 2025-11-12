# Kubernetes Manifests for E-Commerce Microservices

This directory contains all Kubernetes manifests needed to deploy the e-commerce microservices platform on Minikube.

## Directory Structure

```
k8s/
├── configmaps/          # Configuration files
│   ├── app-config.yaml
│   └── mongodb-config.yaml
├── secrets/             # Secrets (JWT, MongoDB credentials)
│   ├── jwt-secret.yaml
│   └── mongodb-secret.yaml
├── pvcs/                # PersistentVolumeClaims for databases
│   ├── user-db-pvc.yaml
│   ├── product-db-pvc.yaml
│   └── ... (10 PVCs total)
├── statefulsets/        # StatefulSets for MongoDB databases
│   ├── user-db.yaml
│   ├── product-db.yaml
│   └── ... (10 StatefulSets total)
├── deployments/         # Deployments for microservices
│   ├── user-service.yaml
│   ├── product-service.yaml
│   ├── api-gateway.yaml
│   ├── frontend.yaml
│   └── ... (12 Deployments total)
├── services/            # Services (ClusterIP)
│   ├── db/              # Database services
│   │   ├── user-db-service.yaml
│   │   └── ... (10 DB services)
│   └── app/             # Application services
│       ├── user-service.yaml
│       ├── api-gateway-service.yaml
│       └── ... (12 app services)
├── ingress/             # Ingress for external access
│   └── ingress.yaml
├── build-images.sh      # Script to build Docker images
├── deploy.sh            # Script to deploy everything
├── DEPLOYMENT_GUIDE.md  # Deployment guide
└── STEP_BY_STEP_COMMANDS.md  # Step-by-step commands
```

## What's Included

### 1. ConfigMaps
- **app-config.yaml**: Application configuration (ports, MongoDB URIs, service URLs)
- **mongodb-config.yaml**: MongoDB configuration

### 2. Secrets
- **jwt-secret.yaml**: JWT secret for authentication
- **mongodb-secret.yaml**: MongoDB credentials (username/password)

### 3. PersistentVolumeClaims (PVCs)
- 10 PVCs for MongoDB databases (2Gi each)
- Storage class: `standard` (Minikube default)

### 4. StatefulSets
- 10 StatefulSets for MongoDB databases
- Each with persistent storage and stable network identity
- Configures MongoDB with authentication where needed

### 5. Deployments
- 11 microservice deployments (user, product, inventory, order, payment, notification, review, search, shipping, analytics, api-gateway)
- 1 frontend deployment
- Each with 2 replicas for high availability
- Health checks (liveness and readiness probes)
- Resource limits and requests

### 6. Services
- **Database Services**: 10 ClusterIP services for MongoDB databases
- **Application Services**: 12 ClusterIP services for microservices and frontend
- All services use ClusterIP for internal communication

### 7. Ingress
- **ingress.yaml**: Ingress rules for external access
- Routes `/` to frontend
- Routes `/api` to API Gateway
- Uses Nginx ingress controller

## Quick Start

### 1. Start Minikube
```bash
minikube start
minikube addons enable ingress
```

### 2. Build Images
```bash
eval $(minikube docker-env)
./k8s/build-images.sh
```

### 3. Deploy
```bash
./k8s/deploy.sh
```

Or follow the step-by-step commands in `STEP_BY_STEP_COMMANDS.md`

## Resource Summary

- **Namespaces**: 1 (ecommerce)
- **ConfigMaps**: 2
- **Secrets**: 2
- **PVCs**: 10
- **StatefulSets**: 10 (MongoDB databases)
- **Deployments**: 12 (11 microservices + 1 frontend)
- **Services**: 22 (10 database + 12 application)
- **Ingress**: 1

## Access the Application

### Option 1: Using Ingress
```bash
# Get Minikube IP
minikube ip

# Add to /etc/hosts:
# <minikube-ip> ecommerce.local

# Access:
# http://ecommerce.local (Frontend)
# http://ecommerce.local/api (API Gateway)
```

### Option 2: Using Port Forwarding
```bash
# Frontend
kubectl port-forward -n ecommerce svc/frontend-service 8080:80

# API Gateway
kubectl port-forward -n ecommerce svc/api-gateway-service 3000:3000
```

### Option 3: Using Minikube Service
```bash
minikube service frontend-service -n ecommerce --url
minikube service api-gateway-service -n ecommerce --url
```

## Verification

```bash
# Check all resources
kubectl get all -n ecommerce

# Check pods
kubectl get pods -n ecommerce

# Check services
kubectl get svc -n ecommerce

# Check ingress
kubectl get ingress -n ecommerce

# Check logs
kubectl logs -n ecommerce -l app=user-service
```

## Troubleshooting

See `DEPLOYMENT_GUIDE.md` for troubleshooting steps.

## Notes

- All images are built locally using Minikube's Docker daemon
- Images use `imagePullPolicy: IfNotPresent` to use local images
- Database StatefulSets use volumeClaimTemplates for persistent storage
- All services use ClusterIP for internal communication
- Ingress provides external access to frontend and API Gateway
- Health checks are configured for all deployments
- Resource limits are set for all containers

## Next Steps

1. Build and deploy the application
2. Verify all pods are running
3. Access the application via Ingress or port forwarding
4. Test the application functionality
5. Take screenshots for your assignment

## Assignment Screenshots

Refer to `STEP_BY_STEP_COMMANDS.md` for the list of screenshots to take for your assignment.

