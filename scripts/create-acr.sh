#!/bin/bash

# Azure ACR 생성 스크립트
# 사용법: ./scripts/create-acr.sh <resource-group-name> <acr-name> <location>

set -e

if [ $# -lt 3 ]; then
    echo "Usage: $0 <resource-group-name> <acr-name> <location>"
    echo "Example: $0 krlangclass-rg krlangclassacr eastus"
    exit 1
fi

RESOURCE_GROUP=$1
ACR_NAME=$2
LOCATION=$3

echo "Creating resource group..."
az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

echo "Creating Azure Container Registry..."
az acr create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$ACR_NAME" \
  --sku Basic \
  --admin-enabled true

echo "Getting ACR credentials..."
ACR_LOGIN_SERVER=$(az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query loginServer --output tsv)
ACR_USERNAME=$(az acr credential show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query username --output tsv)
ACR_PASSWORD=$(az acr credential show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query passwords[0].value --output tsv)

echo ""
echo "✓ ACR created successfully!"
echo "  Name: $ACR_NAME"
echo "  Login Server: $ACR_LOGIN_SERVER"
echo "  Username: $ACR_USERNAME"
echo "  Password: $ACR_PASSWORD"
echo ""
echo "Next steps:"
echo "1. Add these as GitHub Secrets:"
echo "   ACR_LOGIN_SERVER=$ACR_LOGIN_SERVER"
echo "   ACR_USERNAME=$ACR_USERNAME"
echo "   ACR_PASSWORD=$ACR_PASSWORD"
echo ""
echo "2. Deploy image:"
echo "   ./scripts/deploy-to-acr.sh $ACR_LOGIN_SERVER $ACR_USERNAME $ACR_PASSWORD"
