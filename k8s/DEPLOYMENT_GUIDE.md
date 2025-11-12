# Kubernetes Deployment Guide - Step by Step

## Prerequisites
- Minikube installed
- kubectl installed
- Docker installed

## Step-by-Step Deployment

### Step 1: Start Minikube
```bash
# Start Minikube cluster
minikube start

# Verify Minikube is running
minikube status

# Enable ingress addon (for Ingress controller)
minikube addons enable ingress

# Verify kubectl is connected
kubectl cluster-info
```

### Step 2: Create Namespace
```bash
# Create namespace for e-commerce application
kubectl create namespace ecommerce

# Set namespace as default (optional)
kubectl config set-context --current --namespace=ecommerce
```

### Step 3: Create ConfigMaps and Secrets
```bash
# Apply ConfigMaps
kubectl apply -f k8s/configmaps/

# Apply Secrets
kubectl apply -f k8s/secrets/

# Verify
kubectl get configmaps -n ecommerce
kubectl get secrets -n ecommerce
```

### Step 4: Create PersistentVolumeClaims
```bash
# Apply PVCs for databases
kubectl apply -f k8s/pvcs/

# Verify PVCs
kubectl get pvc -n ecommerce
```

### Step 5: Create StatefulSets for Databases
```bash
# Apply StatefulSets for MongoDB databases
kubectl apply -f k8s/statefulsets/

# Watch database pods starting
kubectl get pods -n ecommerce -w

# Verify databases are running (wait for all to be Ready)
kubectl get statefulsets -n ecommerce
```

### Step 6: Create Deployments for Microservices
```bash
# Apply all microservice deployments
kubectl apply -f k8s/deployments/

# Watch pods starting
kubectl get pods -n ecommerce -w

# Verify deployments
kubectl get deployments -n ecommerce
```

### Step 7: Create Services (ClusterIP)
```bash
# Apply ClusterIP services for internal communication
kubectl apply -f k8s/services/

# Verify services
kubectl get services -n ecommerce
```

### Step 8: Create Ingress
```bash
# Apply Ingress rules
kubectl apply -f k8s/ingress/

# Verify Ingress
kubectl get ingress -n ecommerce

# Get Minikube IP
minikube ip

# Get Ingress controller IP (may take a minute)
kubectl get ingress -n ecommerce
```

### Step 9: Verify Everything is Running
```bash
# Check all pods
kubectl get pods -n ecommerce

# Check all services
kubectl get svc -n ecommerce

# Check all StatefulSets
kubectl get statefulsets -n ecommerce

# Check all deployments
kubectl get deployments -n ecommerce

# Check Ingress
kubectl get ingress -n ecommerce

# View logs (example for user-service)
kubectl logs -n ecommerce -l app=user-service --tail=50
```

### Step 10: Access the Application
```bash
# Get Minikube IP
minikube ip

# Get Ingress URL
kubectl get ingress -n ecommerce

# Access frontend (via Ingress)
# Add to /etc/hosts or use Ingress IP:
# <minikube-ip> ecommerce.local
# Then access: http://ecommerce.local

# Or use NodePort (if configured)
minikube service frontend-service -n ecommerce --url
minikube service api-gateway-service -n ecommerce --url
```

## Troubleshooting

### Check Pod Logs
```bash
# View logs for a specific pod
kubectl logs <pod-name> -n ecommerce

# View logs for all pods of a deployment
kubectl logs -n ecommerce -l app=user-service
```

### Check Pod Status
```bash
# Describe a pod to see events
kubectl describe pod <pod-name> -n ecommerce

# Check pod events
kubectl get events -n ecommerce --sort-by='.lastTimestamp'
```

### Restart a Deployment
```bash
# Restart a deployment
kubectl rollout restart deployment <deployment-name> -n ecommerce
```

### Delete Everything
```bash
# Delete all resources
kubectl delete namespace ecommerce

# Or delete individually
kubectl delete -f k8s/ingress/
kubectl delete -f k8s/services/
kubectl delete -f k8s/deployments/
kubectl delete -f k8s/statefulsets/
kubectl delete -f k8s/pvcs/
kubectl delete -f k8s/secrets/
kubectl delete -f k8s/configmaps/
```

## Screenshots to Take

1. **Minikube Status**: `minikube status`
2. **Namespace Created**: `kubectl get namespaces`
3. **ConfigMaps**: `kubectl get configmaps -n ecommerce`
4. **Secrets**: `kubectl get secrets -n ecommerce` (masked)
5. **PVCs**: `kubectl get pvc -n ecommerce`
6. **StatefulSets**: `kubectl get statefulsets -n ecommerce`
7. **Deployments**: `kubectl get deployments -n ecommerce`
8. **Services**: `kubectl get svc -n ecommerce`
9. **Pods Running**: `kubectl get pods -n ecommerce`
10. **Ingress**: `kubectl get ingress -n ecommerce`
11. **Application Access**: Browser screenshot of the application

## Notes

- Wait for all database pods to be Ready before deploying services
- Services need databases to be running first
- Ingress may take a few minutes to get an external IP
- Use `kubectl get pods -n ecommerce -w` to watch pods starting
- Check logs if pods are not starting: `kubectl logs <pod-name> -n ecommerce`

