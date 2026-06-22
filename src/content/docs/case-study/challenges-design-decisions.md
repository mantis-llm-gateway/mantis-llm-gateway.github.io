---
title: Challenges & Design Decisions
description: Key implementation tradeoffs around streaming, Bedrock, compute, and caching.
sidebar:
  order: 7
---


## A. Streaming implementation

![](/assets/mantis-case-study/streaming_chat_completions_flow.png)

Latency is a challenge when working with LLMs. Requests to LLMs can often take seconds, far longer than most standard API response times. To reduce the "perceived latency" of these responses, most (if not all) LLM providers can stream responses to their clients rather than waiting for the entire response to complete. Mantis was built with this in mind.

Doing this synchronously would quickly lead to performance and stability issues because the gateway’s event loop would be blocked as it waits for data to be streamed from the LLM provider. This would increase latency when the gateway is processing multiple requests and responses concurrently. So Mantis does this asynchronously.

To handle multiple concurrent streaming requests, Mantis must implement concurrency and remain performant at the traffic levels an early-stage product would receive.

### **Why we chose Python, FastAPI and Uvicorn**

#### Python

Python has a much wider ecosystem of AI libraries than other languages and is the standard for AI development. Although its Global Interpreter Lock (GIL) limits Python to a single thread, Python offers excellent asynchronous support via its ‘asyncio’ library, which enables concurrent execution and is well-suited to streaming. This is because when the event loop is waiting for a streamed “chunk” from the LLM provider, it can execute another asynchronous process (such as processing another “chunk” from another stream) and then return once the chunk has been received. This means that Python can execute multiple asynchronous operations (such as streams) concurrently.

#### FastAPI

Mantis is built using the FastAPI framework, which we chose over popular alternatives such as Django and Flask for its native support for asynchronous code execution.

#### Uvicorn

Although FastAPI works as a backend library, it still needs a server interface to run on. This interface defines how the server communicates with the Python application. For FastAPI to handle concurrent streams asynchronously, it needs to run on an Asynchronous Server Gateway Interface (ASGI). Uvicorn is the standard ASGI server for FastAPI and is recommended in the FastAPI docs. It’s easy to use with FastAPI and thus requires less manual integration than the alternatives.

### Challenges

#### Mid-Stream Failure

Provider failures that occur mid-stream need to be handled gracefully by the gateway so that gateway connections don’t “hang” and waste socket capacity. This is achieved by implementing two timeouts - a global request-level timeout that is triggered if the request doesn’t complete in time, and a per-chunk timeout that is triggered if a chunk hasn’t arrived from the provider in time. The global request-level timeout is implemented in the ASGI middleware. This removes the timeout from the gateway logic. The per-chunk timeout is implemented at the `Adaptor` level, whilst the `Orchestrator` converts the timeout error into an error message that is streamed to the client. If either timeout is triggered midstream, the stream ends after the error message is sent to the client.

#### Backpressure

Backpressure is another problem that can arise from streaming. If the client is receiving the stream at a slower rate than the gateway, the gateway may end up buffering more data in memory, at the expense of latency and potential memory exhaustion. The pull-based stream flow within the gateway prevents this. If the client is receiving chunks more slowly than the provider sends them, the gateway will stop “awaiting” the next stream event from the provider until the previous chunk has been sent to the client. This means that reads from the Bedrock HTTP stream slow down. The unread data from the provider is buffered below the gateway’s logic in HTTP or client-library Python object buffers, as well as the operating system’s socket buffers. Once those buffers are filled, TCP signals to Bedrock to slow its stream down via its window protocol. This means that Mantis won’t be buffering everything from Bedrock in its own memory. Backpressure is easier to handle because Mantis offloads that responsibility to the OS buffers and the TCP layer.

#### Streaming Format - SSE vs HTTP Chunks

Mantis streams chunks over an HTTP connection, without using Server-Sent Events (SSE). Mantis is designed to be a server-to-server middleware application, rather than an application that serves to browsers. SSE is useful because the client can use the `EventSource` interface, which automatically attempts to reconnect when the HTTP connection drops. But the `EventSource` interface is implemented by the browser, and server-to-server middleware doesn’t serve responses to browsers. Although this functionality can be implemented in the backend, it’s simpler to just stream the chunks over a bare HTTP connection.

## B. Bedrock

### **Bedrock as LLM API**

#### **Challenge and options**

Each LLM provider API uses its own request/response format. In addition, streaming behaviour, error handling and model parameters also vary across time and providers and developers need to manage credentials and/or subscriptions for all models manually. Options include integrating directly with LLM providers, which gives more control and faster access to provider-specific features, or using a unified compatibility layer, which reduces logic overhead at the cost of vendor lock-in and the loss of provider-specific features.

#### **Our Implementation**

Amazon Bedrock Converse provides a single, unified compatibility layer for many LLM providers in exchange for relying on AWS. It unlocks compatibility with many LLM providers while taking care of maintenance and API format and behaviour updates. It also suits the AWS-native nature of Mantis: we reuse the same cloud infrastructure that was deployed for permissions, logging and monitoring. Bedrock also does not require individual subscriptions or credentials for each LLM provider. This ease of integration comes at the cost of direct interaction with LLM provider APIs, so some vendor-specific parameters can be unavailable when using Mantis.

We also found that dependencies that route queries directly to LLM providers (such as `TokenJS` or `any-llm`) often appear to have few, if any, recent commits, or are badly documented. AWS’s APIs are well-maintained, widely used, and accompanied by thorough documentation. Relying on Bedrock’s LLM provision and AWS’s APIs simplifies development and ensures the reliability of Mantis’s LLM routing.

### **Bedrock As Guardrails Provider**

#### **Challenge and options**

To prevent unsafe use of the gateway, Mantis needs a safety layer. Each model already handles that, but the policies are specific to each provider and, in some cases, model. Streaming introduces additional complexity, since each chunk sent to the user should be verified even if the entire response has not yet been generated.

Guardrails are the standard solution to add a safety layer: they are rules that are checked both on the inbound prompt and on the LLM-generated response. They include rules such as anonymising Personally Identifiable Information (PII, e.g., credit card numbers) and preventing a prompt from being processed if it requests forbidden actions (e.g., building a bomb or faking official documents). Guardrail services offer a range of such rules, and the level of customisation varies. LLM providers have built-in guardrails, which are by design not fully public: the developer cannot be certain that a potential edge case their app would need handled will be handled by the LLM provider’

The solution space goes from implementing a custom guardrail layer, which offers more control at the cost of complexity and engineering work, to guardrail services like AWS Bedrock Guardrails. This includes relying on each model’s built-in guardrails, which provide more design simplicity with varying levels of uniformity, depending on each provider.

#### **Our Implementation**

Bedrock Guardrails provides a centralised safety layer that can be applied consistently across all models used by the gateway, while preserving the flexibility to swap or add models as needed. Its native integration with AWS services aligns well with Mantis’ AWS-native design, and it also supports streaming.

## C. Compute

![](/assets/mantis-case-study/compute_table.png)

Mantis needs to run on a server that can efficiently handle multiple concurrent streaming and non-streaming connections, requires minimal maintenance and is cost-efficient. This leaves us with a few options on AWS: Elastic Compute Cloud (EC2), Elastic Container Service (ECS) on EC2, ECS on Fargate and Lambda. ECS is the orchestration layer that runs containerised applications on the chosen compute resources, e.g., EC2 instances or Fargate tasks.

### EC2

EC2 is a bare-bones virtual machine, which means that the user has to configure and manage the server themselves. This includes the operating system, networking, patching and security configuration. Although this gives you full control, it also requires more work than is necessary to run Mantis when compared to the alternatives.

### ECS on EC2

ECS on EC2 means that ECS schedules (i.e. decides when, where, and with what resources the container should run) and then runs your containerised application on the EC2 instances that you manage. This means that less maintenance and management is required from the user.

### ECS on Fargate

ECS on Fargate is when ECS uses Fargate as the compute. Fargate is a "serverless", pay-as-you-go compute engine. "Serverless" means that the compute does not need to be provisioned, deployed or managed. This contrasts with EC2, which is not serverless. Using ECS on Fargate means you can run containers without managing EC2 instances.

### Lambda

AWS Lambda is another compute option. Lambda is serverless and is also pay-as-you-go. It scales up and down automatically in response to "events", e.g., when Mantis receives a request from a client. Fargate, however, is not event-based. This means Fargate remains running between requests.

It is important to note that all of the above options enable streaming, but Lambda invocations time out after 15 minutes - regardless of whether the LLM has started streaming its response. That shouldn’t, however, be a problem for text-based LLM responses, which almost always complete within 15 minutes.

### Fargate or Lambda?

Lambda is far less suited to Mantis for different reasons. Every Lambda invocation has to remain active whilst waiting for a response from the LLM provider. Although multiple Lambda invocations can execute concurrently, each invocation costs money whilst it waits for a response from the LLM provider. This is because the invocation is occupied for the duration of the request, i.e., it can't handle another request whilst it waits for a response from the LLM provider. If Mantis receives 10 requests, 10 Lambda instances will spin up - and they will all do nothing whilst they wait for responses from the LLM provider. This can result in wasted compute costs when compared to a Fargate task that can handle multiple concurrent requests.

A Fargate task running on ECS can handle multiple LLM requests and responses concurrently, and requires much less maintenance than either ECS on EC2 or bare EC2. With Fargate, AWS manages the server for you - all you have to do is “tell” it to “run this container”, and it will handle the rest. The fact that Fargate can auto-scale means Mantis can be easily configured to scale in response to increasing traffic.

## D. Response Caching

Incorporating LLMs into one’s application involves increased costs and latency, as discussed earlier.

Caching LLM responses is one way of alleviating those two issues. Instead of waiting for an LLM API to generate and return a response, a cached response can be retrieved and served in a tiny fraction of the time and cost.

### Implementation

Using *ElastiCache* gives us the speed of in-memory key-value access for our exact-match cache while also addressing our semantic caching requirements through its `valkey-search` module. The main alternative was *Amazon RDS* (with pgvector), but its disk-based storage would have undermined the latency benefits of caching.

In general, we key on model and provider so that a cached response’s quality and style match a user’s expectations. When the cache is full, entries are evicted according to the Least Frequently Used (LFU) policy, since some prompts are hit many times while most are likely to be used only once.

#### Exact-match

The exact-match keys are built using the following: the `prompt:exact:` prefix, the LLM model and provider, and a hash of the prompt text (a `messages` array, representing a full conversation, and an optional `system` prompt). The value for each key is the stored LLM response.

As mentioned earlier, this means a cache hit only occurs when an incoming request matches a cache entry on both:

1. Model/ provider combination

2. Full conversation and system prompt

The downside to this approach is that the exact cache becomes largely useless as the conversation grows, because the chance of an exact match gradually tends to zero, since every single character needs to match what the key was built on.

This trade-off was considered reasonable, since checking a cache is a cheap operation and will still be worthwhile on the off chance it saves an expensive LLM call.

#### Semantic-match

When there is a miss on the exact-match name, a semantic cache lookup occurs. This involves several moving parts outlined in the Architecture section above, and it adds significant latency due to the embedding model call required to generate a vector embedding of the user prompt.

**Conversation Length**

The signal of a semantic similarity score degrades as conversation size grows. Thus, to avoid a costly lookup that likely won’t result in a cache hit, we wanted to give users a way to control when a conversation is deemed long enough to skip the semantic cache. We defaulted this value to `3` as an opinionated “sensible default”.

**Similarity Threshold**

As a reminder, before a user prompt is compared against the semantic cache, it’s converted to a vector embedding and then compared against the embeddings of cached entries.

While exact matches are strict in matching a user prompt to a cached LLM response, semantic matches are looser and are controlled by the developer via a `similarity_threshold` dial.

From the `top_k` most similar entries found, `similarity_threshold` filters the shortlist, leaving only the best match that meets the similarity threshold. Turning that dial up means that only the closest prompts will pass, while turning it down means less-similar prompts may be returned.

**Search Algorithm**

We used the HNSW search algorithm to navigate the vector space and retrieve embeddings. Given our use case, the cache would probably not contain more than 50k vectors at a time, which might have justified the FLAT algorithm. However, we found its linearly scaling search speed undesirable compared to HNSW, which scales logarithmically.

Additionally, FLAT’s main advantage of providing exact accuracy is of little benefit to us in the semantic cache context, which exists to find similar prompts, not exact ones. Thus, we lose nothing by using approximate search and gain the ability for a cache’s dataset to grow without slowing vector search.

#### **Other Response Cache Decisions**

1. **Guardrailed responses are cached** just like any other response since the *Executor* treats the result as a normal success. We knew that whether we cache it or not, there is a staleness risk due to one of two scenarios:
    1. We cache guardrailed responses, then the policy changes to allow that content, and subsequent cache hits still serve the refusal response.
    2. We don’t cache guardrailed responses, the policy changes to block that content, and subsequent cache hits serve the response that should’ve been blocked.
    Since neither option eliminates the problem, we chose the consistent behaviour of caching everything on the assumption that TTL is far shorter than how frequently guardrail policies change. This is an area of interest for future work.

2. **Streaming-requests bypass the cache entirely**. On lookup, serving a complete cached response to a client expecting a stream of chunks would either violate that expectation or require faking a stream from the cached text, neither of which is preferable to just skipping the cache and making the LLM call. On writes, storing a streaming response would be too complex for not much gain.

