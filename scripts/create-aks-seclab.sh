#!/usr/bin/env bash
set -euo pipefail

RG=rg-seclab-aks
LOC=francecentral
CLUSTER=aks-seclab
CICD_PRINCIPAL=2da58309-91f7-418a-ac15-0af725f7114b   # principalId id-seclab-cicd
SUB=13df671f-a63d-4845-a227-e5ddf2035839

MI_KUBELET_ID=$(az identity show -g rg-seclab-identity -n id-seclab-dev --query id -o tsv)
CP_ID=$(az identity show -g rg-seclab-identity -n id-seclab-aks-cp --query id -o tsv)
SUBNET_ID=$(az network vnet subnet show -g rg-seclab-core --vnet-name vnet-seclab-core -n snet-app --query id -o tsv)

# NSG : autoriser les health probes du LB au-dessus du deny 4096 (idempotent)
az network nsg rule create -g rg-seclab-core --nsg-name nsg-seclab-app \
  -n AllowAzureLBProbes --priority 4000 --direction Inbound --access Allow \
  --source-address-prefixes AzureLoadBalancer --destination-address-prefixes '*' \
  --destination-port-ranges '*' --protocol '*' -o none || true

az group create -n $RG -l $LOC --tags projet=seclab env=lab ephemere=true -o none

# Premier rôle id-seclab-cicd — scopé RG, re-posé à chaque session (le rôle meurt avec le RG)
az role assignment create \
  --assignee-object-id "$CICD_PRINCIPAL" --assignee-principal-type ServicePrincipal \
  --role "Azure Kubernetes Service Cluster User Role" \
  --scope "/subscriptions/$SUB/resourceGroups/$RG" -o none

az aks create -g $RG -n $CLUSTER \
  --node-count 1 --node-vm-size Standard_D2als_v7 --tier free --node-osdisk-size 32 \
  --assign-identity "$CP_ID" \
  --assign-kubelet-identity "$MI_KUBELET_ID" \
  --enable-addons azure-keyvault-secrets-provider \
  --network-plugin azure --network-policy azure \
  --vnet-subnet-id "$SUBNET_ID" \
  --nodepool-tags projet=seclab \
  --generate-ssh-keys

az aks get-credentials -g $RG -n $CLUSTER
kubectl get nodes
