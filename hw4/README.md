## Maintenance

- I recommend Infra.app for tracking kubernetes (`brew install --cask infra`)

## Deployment

- Enable necessary apis

```shell
gcloud services enable containerregistry.googleapis.com container.googleapis.com
```

- Generate Docker files

```shell
docker build -t hw4-api . -f Dockerfile.api --platform=linux/amd64
docker build -t hw4-app . -f Dockerfile.app --platform=linux/amd64
```

- Create local tags for docker images

```shell
docker tag hw4-api:latest anonrig/cloud-computing-api
docker tag hw4-app:latest anonrig/cloud-computing-app
```

- Push images to docker hub

```shell
docker push anonrig/cloud-computing-api
docker push anonrig/cloud-computing-app
```

- Create a kubernetes cluster

```shell
gcloud container clusters create fordham-cluster --zone=us-central1-a
```

- Deploy API and APP

```shell
kubectl apply -f ./k8s/api.yml
kubectl apply -f ./k8s/app.yml
```

- Get load balancer ip under `Load Balancer Ingress`

```shell
kubectl describe services app
```

- Delete kubernetes cluster

```shell
gcloud container clusters delete fordham-cluster --zone=us-central1-a
```