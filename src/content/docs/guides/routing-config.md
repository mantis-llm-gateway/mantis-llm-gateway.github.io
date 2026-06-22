---
title: Routing Config
description: Configure aliases, routing rules, fallbacks, timeouts, cooldowns, and prompt caching.
sidebar:
  order: 3
---

Routing behavior is driven by `gateway/src/gateway/config.json` locally and by AWS
Systems Manager Parameter Store in deployed environments.

## Aliases

Aliases give provider/model pairs stable names that routing rules can reference:

```json
{
  "aliases": {
    "Claude Haiku 4-5 Bedrock": {
      "provider": "bedrock",
      "model": "us.anthropic.claude-haiku-4-5-20251001-v1:0"
    }
  }
}
```

## Default Model

The gateway uses `default_model` when no routing rule matches the request metadata:

```json
{
  "default_model": "Claude Haiku 4-5 Bedrock"
}
```

## Routing Rules

Rules match on the JSON object passed in the `metadata` header. Targets are weighted:

```json
{
  "routing_rules": [
    {
      "id": "1",
      "name": "Code generation",
      "match": { "name": "task-type", "value": "code_generation" },
      "targets": [
        { "alias": "Claude Sonnet 4-5 Bedrock", "weight": 6 },
        { "alias": "Nova Pro Bedrock", "weight": 4 }
      ]
    }
  ]
}
```

If a client sends:

```http
metadata: {"task-type":"code_generation"}
```

the gateway chooses between the configured targets according to their weights.

## Retries and Fallbacks

`target_retries` controls retries for a selected target. `fallbacks` define aliases to try
after the rule/default target chain is exhausted:

```json
{
  "target_retries": 2,
  "fallbacks": ["Claude Haiku 4-5 Bedrock Fallback"]
}
```

## Timeouts and Cooldowns

`initial_response_timeout` caps time to first response. `stream_idle_timeout` caps idle
time between streamed chunks. `cooldown_ttl` temporarily removes a provider/model pair
from routing after rate-limit failures:

```json
{
  "initial_response_timeout": 30,
  "stream_idle_timeout": 5,
  "cooldown_ttl": 60
}
```

## Prompt Cache

Prompt cache settings control exact and semantic response caching:

```json
{
  "prompt_cache": {
    "ttl_seconds": 3600,
    "temperature_threshold": 0.3,
    "semantic": {
      "similarity_threshold": 0.8,
      "top_k": 3,
      "conversation_size_threshold": 3
    }
  }
}
```

Streaming requests bypass the cache. Non-streaming requests can use exact matching and,
when configured, semantic matching.
