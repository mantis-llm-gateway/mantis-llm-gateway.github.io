---
title: Python SDK
description: Use the mantis-gw Python SDK to call the gateway from application code.
sidebar:
  order: 2
---

The Mantis SDK wraps the `/v1/chat/completions` endpoint for Python applications.

## Install

```sh
pip install mantis-gw
```

The package is imported as `mantis_gw`.

## Non-streaming

```python
import asyncio

from mantis_gw import gateway


async def main() -> None:
    client = gateway.Gateway(
        url="https://gateway.example.com",
        token="gw_token-id_token-secret",
    )

    response = await client.send(
        {
            "messages": [
                {"role": "user", "content": "Write a short project summary."},
            ],
            "stream": False,
            "temperature": 0.5,
            "max_tokens": 256,
            "system": "Answer clearly and concisely.",
        },
        metadata={"task-type": "summarization"},
    )

    print(response)


asyncio.run(main())
```

## Streaming

```python
import asyncio

from mantis_gw import gateway


async def main() -> None:
    client = gateway.Gateway(
        url="https://gateway.example.com",
        token="gw_token-id_token-secret",
    )

    chunks = await client.send(
        {
            "messages": [
                {"role": "user", "content": "Write a short project summary."},
            ],
            "stream": True,
            "temperature": 0.5,
            "max_tokens": 256,
        },
        metadata={"task-type": "summarization"},
    )

    async for chunk in chunks:
        print(chunk, end="")


asyncio.run(main())
```

## Errors

Gateway responses with 4xx or 5xx status codes raise `httpx.HTTPStatusError`.
