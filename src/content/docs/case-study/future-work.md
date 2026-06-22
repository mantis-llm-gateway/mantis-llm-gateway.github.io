---
title: Future Work
description: Further directions for the Mantis gateway.
sidebar:
  order: 8
---


As we built Mantis, we discovered several further directions worth pursuing. These are the ones we’d tackle next:

1. **A/B testing:** For each request sent, we only know how the chosen model performed. An A/B testing feature could allow a comparison where, for a set proportion of requests, the gateway also sends the prompt to other models. A judge LLM can rate how relevant those response are to the request with its rating then used to update the routing distributions. This feature would be decoupled from the user-facing request/response flow meaning it would not return an LLM response to the user.

2. **WAF in front of ALB for rate-limiting:** Implementing rate limiting with a Web Application Firewall in front of the ALB would protect more expensive compute resources behind it.

3. **Guardrail-aware cache invalidation:** Rather than relying on TTL to expire stale cache entries after a policy change, cache keys can include the active guardrail policy ID and version. This would allow for invalidating old cache entries immediately when a policy updates.

4. **Streaming-response caching:** Reconstructing a cacheable response from a stream, and replaying it to the client as a stream on a cache hit, would extend caching’s benefits to streaming clients as well.

