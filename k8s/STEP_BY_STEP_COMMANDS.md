# Step-by-Step Kubernetes Deployment Commands

## Prerequisites
- Minikube installed
- kubectl installed
- Docker installed

---

## Step 1: Start Minikube

```bash
# Start Minikube cluster
minikube start

# Verify Minikube is running
minikube status

# Enable ingress addon (required for Ingress)
minikube addons enable ingress

# Verify ingress is enabled
minikube addons list | grep ingress
```

**📸 Screenshot 1: Take screenshot of `minikube status`**

---

## Step 2: Configure Minikube Docker Environment

```bash
# Configure Docker to use Minikube's Docker daemon
eval $(minikube docker-env)

# Verify Docker is using Minikube
docker ps
```

**📸 Screenshot 2: Take screenshot of `docker ps` showing Minikube containers**

---

## Step 3: Build Docker Images

```bash
# Make build script executable
chmod +x k8s/build-images.sh

# Build all images (this will take several minutes)
./k8s/build-images.sh
```

**Alternative: Build images manually**
```bash
# Set Docker environment
eval $(minikube docker-env)

# Build each service
docker build -t user-service:latest ./services/user-service
docker build -t product-service:latest ./services/product-service
docker build -t inventory-service:latest ./services/inventory-service
docker build -t order-service:latest ./services/order-service
docker build -t payment-service:latest ./services/payment-service
docker build -t notification-service:latest ./services/notification-service
docker build -t review-service:latest ./services/review-service
docker build -t search-service:latest ./services/search-service
docker build -t shipping-service:latest ./services/shipping-service
docker build -t analytics-service:latest ./services/analytics-service
docker build -t api-gateway:latest ./services/api-gateway
docker build -t frontend:latest ./frontend
```

**📸 Screenshot 3: Take screenshot of built images: `docker images | grep -E "(user-service|product-service|api-gateway|frontend)"`**

---

## Step 4: Create Namespace

```bash
# Create namespace
kubectl create namespace ecommerce

# Verify namespace
kubectl get namespaces
```

**📸 Screenshot 4: Take screenshot of `kubectl get namespaces`**

---

## Step 5: Apply ConfigMaps

```bash
# Apply ConfigMaps
kubectl apply -f k8s/configmaps/

# Verify ConfigMaps
kubectl get configmaps -n ecommerce
```

**📸 Screenshot 5: Take screenshot of `kubectl get configmaps -n ecommerce`**

---

## Step 6: Apply Secrets

```bash
# Apply Secrets
kubectl apply -f k8s/secrets/

# Verify Secrets (values will be hidden)
kubectl get secrets -n ecommerce
```

**📸 Screenshot 6: Take screenshot of `kubectl get secrets -n ecommerce`**

---

## Step 7: Apply PersistentVolumeClaims

```bash
# Apply PVCs
kubectl apply -f k8s/pvcs/

# Verify PVCs
kubectl get pvc -n ecommerce

# Wait for PVCs to be bound
kubectl wait --for=condition=Bound pvc --all -n ecommerce --timeout=120s
```

**📸 Screenshot 7: Take screenshot of `kubectl get pvc -n ecommerce`**

---

## Step 8: Apply StatefulSets for Databases

```bash
# Apply StatefulSets
kubectl apply -f k8s/statefulsets/

# Verify StatefulSets
kubectl get statefulsets -n ecommerce

# Watch pods starting
kubectl get pods -n ecommerce -w
```

**Wait for all database pods to be Ready (this may take 1-2 minutes)**

```bash
# Check pod status
kubectl get pods -n ecommerce

# Check specific database
kubectl get pods -n ecommerce -l app=user-db
```

**📸 Screenshot 8: Take screenshot of `kubectl get statefulsets -n ecommerce`**
**📸 Screenshot 9: Take screenshot of `kubectl get pods -n ecommerce` showing database pods running**

---

## Step 9: Apply Database Services

```bash
# Apply database services
kubectl apply -f k8s/services/db/

# Verify database services
kubectl get svc -n ecommerce | grep db
```

**📸 Screenshot 10: Take screenshot of `kubectl get svc -n ecommerce | grep db`**

---

## Step 10: Apply Microservice Deployments

```bash
# Apply deployments
kubectl apply -f k8s/deployments/

# Verify deployments
kubectl get deployments -n ecommerce

# Watch pods starting
kubectl get pods -n ecommerce -w
```

**Wait for all microservice pods to be Ready (this may take 2-3 minutes)**

```bash
# Check pod status
kubectl get pods -n ecommerce

# Check if all pods are running
kubectl get pods -n ecommerce | grep Running
```

**📸 Screenshot 11: Take screenshot of `kubectl get deployments -n ecommerce`**
**📸 Screenshot 12: Take screenshot of `kubectl get pods -n ecommerce` showing all pods running**

---

## Step 11: Apply Microservice Services

```bash
# Apply services
kubectl apply -f k8s/services/app/

# Verify services
kubectl get svc -n ecommerce
```

**📸 Screenshot 13: Take screenshot of `kubectl get svc -n ecommerce`**

---

## Step 12: Apply Ingress

```bash
# Apply Ingress
kubectl apply -f k8s/ingress/

# Verify Ingress
kubectl get ingress -n ecommerce

# Get Minikube IP
minikube ip

# Get Ingress details
kubectl describe ingress ecommerce-ingress -n ecommerce
```

**📸 Screenshot 14: Take screenshot of `kubectl get ingress -n ecommerce`**
**📸 Screenshot 15: Take screenshot of `minikube ip`**

---

## Step 13: Verify Deployment

```bash
# Check all resources
kubectl get all -n ecommerce

# Check pod logs (example)
kubectl logs -n ecommerce -l app=user-service --tail=50

# Check service endpoints
kubectl get endpoints -n ecommerce
```

**📸 Screenshot 16: Take screenshot of `kubectl get all -n ecommerce`**

---

## Step 14: Access the Application

### Option 1: Using Ingress

```bash
# Get Minikube IP
MINIKUBE_IP=$(minikube ip)
echo "Minikube IP: $MINIKUBE_IP"

# Add to /etc/hosts (Linux/Mac) or C:\Windows\System32\drivers\etc\hosts (Windows)
# Add this line:
# $MINIKUBE_IP ecommerce.local

# Then access:
# http://ecommerce.local (Frontend)
# http://ecommerce.local/api (API Gateway)
```

### Option 2: Using NodePort (if configured)

```bash
# Get service URL
minikube service frontend-service -n ecommerce --url
minikube service api-gateway-service -n ecommerce --url
```

### Option 3: Port Forwarding

```bash
# Port forward to frontend
kubectl port-forward -n ecommerce svc/frontend-service 8080:80

# Port forward to API gateway
kubectl port-forward -n ecommerce svc/api-gateway-service 3000:3000

# Then access:
# http://localhost:8080 (Frontend)
# http://localhost:3000/api (API Gateway)
```

**📸 Screenshot 17: Take screenshot of the application running in browser**

---

## Step 15: Quick Deployment Script (Alternative)

If you want to deploy everything at once:

```bash
# Make deploy script executable
chmod +x k8s/deploy.sh

# Run deployment script
./k8s/deploy.sh
```

---

## Troubleshooting

### Check Pod Logs
```bash
# View logs for a specific pod
kubectl logs -n ecommerce <pod-name>

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

---

## Summary of Screenshots to Take

1. `minikube status`
2. `docker ps` (showing Minikube containers)
3. `docker images` (showing built images)
4. `kubectl get namespaces`
5. `kubectl get configmaps -n ecommerce`
6. `kubectl get secrets -n ecommerce`
7. `kubectl get pvc -n ecommerce`
8. `kubectl get statefulsets -n ecommerce`
9. `kubectl get pods -n ecommerce` (databases running)
10. `kubectl get svc -n ecommerce | grep db`
11. `kubectl get deployments -n ecommerce`
12. `kubectl get pods -n ecommerce` (all pods running)
13. `kubectl get svc -n ecommerce`
14. `kubectl get ingress -n ecommerce`
15. `minikube ip`
16. `kubectl get all -n ecommerce`
17. Browser screenshot of the application

---

## Notes

- Wait for all database pods to be Ready before deploying services
- Services need databases to be running first
- Ingress may take a few minutes to get an external IP
- Use `kubectl get pods -n ecommerce -w` to watch pods starting
- Check logs if pods are not starting: `kubectl logs <pod-name> -n ecommerce`

