---
title: Deploy to AWS
description: Provision the Mantis gateway infrastructure and deploy the service.
sidebar:
  order: 2
---

Mantis is designed to run in your own AWS account. Terraform provisions the application
infrastructure, and the deployment script builds the dashboard and gateway container.

## Bootstrap Remote State

Terraform state contains sensitive values, including the ElastiCache auth token. Create
the encrypted remote state bucket first:

```sh
./scripts/bootstrap_state_bucket.sh <namespace>
```

Run the `terraform init` command printed by the script from the repository root.

## Configure Terraform

Generate an ElastiCache auth token:

```sh
openssl rand -hex 32
```

Create `infra/terraform.tfvars`:

```hcl
owner            = "<your-name>"
namespace        = "<environment-name>"
cache_auth_token = "your-generated-token"
```

Before applying, create the gateway authentication parameters:

```sh
./scripts/setup_auth.sh <namespace> --token-id <client-name>
```

## Apply Infrastructure

```sh
terraform -chdir=infra plan
terraform -chdir=infra apply
```

The initial ECS desired count defaults to `0`, so infrastructure can be created before
the gateway image exists.

## Deploy the Service

```sh
./scripts/deploy.sh
```

The deploy script builds dashboard assets, uploads them to S3, builds and pushes the
gateway image to ECR, and scales the ECS service to one task.

## Configure HTTPS

HTTPS is opt-in. Request an ACM certificate in the same AWS region as the load balancer,
complete DNS validation, then add these values to `infra/terraform.tfvars`:

```hcl
enable_https        = true
acm_certificate_arn = "arn:aws:acm:<region>:<account-id>:certificate/<certificate-id>"
gateway_domain_name = "gateway.example.com"
```

After applying, point your DNS record at the ALB DNS name from Terraform output.

## Verify

```sh
terraform -chdir=infra output
curl -i https://<gateway-domain-name>/health
```

A healthy deployment returns:

```json
{"status":"ok"}
```
