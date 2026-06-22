---
title: Quick Start
description: Get Mantis running locally or deploy it with the CLI.
sidebar:
  order: 1
---

Mantis Gateway is a configurable LLM routing service. Applications send chat completion
requests to one gateway endpoint, optionally include routing metadata, and Mantis chooses
the configured provider/model target.

## Prerequisites

- Python 3.12
- `uv`
- Node.js and npm
- Docker
- AWS CLI configured with a `gw` profile
- Terraform 1.15 or newer for infrastructure deployments

## Run the Gateway Locally

Install backend dependencies:

```sh
cd llm-gateway/gateway
uv sync
```

Copy the local environment file and configure gateway settings:

```sh
cp .env.example .env
```

Start a Redis-compatible cache. Use Redis Stack if semantic caching is enabled:

```sh
docker run --rm --name mantis-gateway-cache -p 6379:6379 redis/redis-stack-server:latest
```

Configure AWS credentials and run the service:

```sh
export AWS_PROFILE=gw
uv run uvicorn gateway.main:app --reload --app-dir src
```

Verify health:

```sh
curl http://localhost:8000/health
```

## Deploy With the CLI

From the root of the Mantis gateway repo, install the CLI:

```sh
uv tool install ./cli
```

Then run:

```sh
mantis deploy
```

The CLI checks for the `gw` AWS profile, bootstraps Terraform state, writes
`infra/terraform.tfvars`, creates or rotates authentication parameters, applies
Terraform, deploys the dashboard and gateway image, and prints Terraform outputs.

Store the printed API token immediately. It is shown once.
