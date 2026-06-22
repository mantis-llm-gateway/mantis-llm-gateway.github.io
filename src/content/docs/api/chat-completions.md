---
title: Chat Completions
description: Send non-streaming and streaming chat completion requests through Mantis.
sidebar:
  order: 1
---

The gateway exposes:

```http
POST /v1/chat/completions
```

All requests require:

```http
Authorization: Bearer gw_<token-id>_<random-secret>
```

## Request Body

```json
{
  "messages": [
    { "role": "user", "content": "Write a short project summary." }
  ],
  "stream": false,
  "temperature": 0.5,
  "max_tokens": 256,
  "system": "Answer clearly and concisely."
}
```

Validation rules:

- `messages` is required and must contain at least one message.
- Message `role` must be `user` or `assistant`.
- Message `content` must be a non-empty string.
- Extra top-level fields are rejected.
- `stream` defaults to `false`.
- `temperature` can be omitted, `null`, or a number from `0.0` to `2.0`.
- `max_tokens` can be omitted, `null`, or an integer greater than `0`.
- `system` can be omitted, `null`, or a non-empty string.

## Routing Metadata

Pass routing metadata in the `metadata` header as a JSON object with string keys and
string values:

```http
metadata: {"task-type":"summarization"}
```

The gateway uses this object to match routing rules.

## Non-streaming Example

```sh
curl https://gateway.example.com/v1/chat/completions \
  -H 'Authorization: Bearer gw_token-id_token-secret' \
  -H 'Content-Type: application/json' \
  -H 'metadata: {"task-type":"summarization"}' \
  -d '{
    "messages": [
      { "role": "user", "content": "Write a short project summary." }
    ],
    "stream": false,
    "temperature": 0.5,
    "max_tokens": 256
  }'
```

## Streaming Example

```json
{
  "messages": [
    { "role": "user", "content": "Write a short project summary." }
  ],
  "stream": true
}
```

When `stream` is `true`, Mantis returns text chunks as they are received from the model
provider.

## Health

The load balancer health endpoint is public:

```http
GET /health
```

It returns:

```json
{"status":"ok"}
```
