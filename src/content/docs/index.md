---
title: Mantis
description: Open-source, self-hosted LLM gateway documentation.
template: splash
hero:
  title: Mantis
  tagline: A self-hosted LLM gateway for routing, caching, guardrails, and observability across model providers.
  image:
    html: '<img src="/assets/mantis-case-study/mantis_logo_32.svg" alt="Mantis logo" width="96" height="96" />'
  actions:
    - text: Get Started
      link: /guides/quick-start/
      icon: right-arrow
    - text: Case Study
      link: /case-study/introduction/
      icon: document
      variant: secondary
---

<div class="metric-strip">
  <div>
    <strong>One API</strong>
    <span>Stable chat completions endpoint in front of multiple model targets.</span>
  </div>
  <div>
    <strong>AWS-native</strong>
    <span>Deployable with Terraform, ECS, ElastiCache, Bedrock, and CloudWatch.</span>
  </div>
  <div>
    <strong>Policy driven</strong>
    <span>Routing, retry, fallback, timeout, cooldown, and cache behavior live in config.</span>
  </div>
</div>

## What Mantis Provides

<div class="feature-grid">
  <a href="/guides/routing-config/">
    <h3>Configurable Routing</h3>
    <p>Route requests by metadata, model aliases, weighted targets, and fallback chains.</p>
  </a>
  <a href="/case-study/architecture/">
    <h3>Gateway Orchestration</h3>
    <p>Coordinate validation, cache checks, cooldowns, provider calls, retries, and terminal responses.</p>
  </a>
  <a href="/api/chat-completions/">
    <h3>OpenAI-style API Surface</h3>
    <p>Send chat completion requests through a single gateway endpoint with optional routing metadata.</p>
  </a>
  <a href="/api/sdk/">
    <h3>Python SDK</h3>
    <p>Call Mantis from application code without manually constructing every HTTP request.</p>
  </a>
</div>

## Next Steps

Start with the [quick start](/guides/quick-start/) to run or deploy the gateway, then read
the [case study](/case-study/introduction/) for the project background and design decisions.
