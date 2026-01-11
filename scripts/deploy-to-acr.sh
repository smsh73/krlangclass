#!/bin/bash

# Azure ACR 배포 스크립트
# 사용법: ./scripts/deploy-to-acr.sh <ACR_LOGIN_SERVER> <ACR_USERNAME> <ACR_PASSWORD>

set -e

if [ $# -lt 3 ]; then
    echo "Usage: $0 <ACR_LOGIN_SERVER> <ACR_USERNAME> <ACR_PASSWORD>"
    echo "Example: $0 myregistry.azurecr.io myusername mypassword"
    exit 1
fi

ACR_LOGIN_SERVER=$1
ACR_USERNAME=$2
ACR_PASSWORD=$3
IMAGE_NAME="krlangclass"
COMMIT_SHA=$(git rev-parse --short HEAD)

echo "Logging in to Azure ACR..."
echo "$ACR_PASSWORD" | docker login "$ACR_LOGIN_SERVER" -u "$ACR_USERNAME" --password-stdin

echo "Building Docker image..."
docker build -t "$ACR_LOGIN_SERVER/$IMAGE_NAME:$COMMIT_SHA" .
docker build -t "$ACR_LOGIN_SERVER/$IMAGE_NAME:latest" .

echo "Pushing images to ACR..."
docker push "$ACR_LOGIN_SERVER/$IMAGE_NAME:$COMMIT_SHA"
docker push "$ACR_LOGIN_SERVER/$IMAGE_NAME:latest"

echo "✓ Successfully deployed to Azure ACR!"
echo "  Image: $ACR_LOGIN_SERVER/$IMAGE_NAME:$COMMIT_SHA"
echo "  Image: $ACR_LOGIN_SERVER/$IMAGE_NAME:latest"
