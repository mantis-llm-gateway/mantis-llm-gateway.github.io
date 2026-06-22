---
title: Existing Solutions
description: How Mantis compares with other LLM gateway options.
sidebar:
  order: 3
---


There are a number of LLM gateways available, each with its own strengths and weaknesses. Bifrost and LiteLLM are two options that both meet different needs. Bifrost can handle higher traffic levels than LiteLLM, according to self-reported benchmark testing conducted by both the LiteLLM and Bifrost teams.

Here is a summary of how Mantis compares to Bifrost and LiteLLM.

![](/assets/mantis-case-study/gateway_comparison.png)

Given that LiteLLM & Mantis are built in Python and subject to the Global Interpreter Lock, they are best suited to lower-traffic applications. Bifrost is built with the Go programming language and is known for handling high traffic levels.

Neither Bifrost nor LiteLLM can be self-hosted with a single command (which also sets up the gateway infrastructure). Mantis does support this easy, single-step deployment. Just running `mantis deploy` is enough to set up all of the AWS infrastructure, build the Docker container and deploy it.

