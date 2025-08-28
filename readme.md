# 🚀 Basic gRPC Service: The TypeScript Edition

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat&logo=node.js)](https://nodejs.org/)
[![TypeScript Version](https://img.shields.io/badge/typescript-%5E5.9.2-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Fastify Version](https://img.shields.io/badge/fastify-%5E5.4.0-black?style=flat&logo=fastify)](https://www.fastify.io/)
[![gRPC](https://img.shields.io/badge/gRPC-4285F4?style=for-the-badge&logo=grpc&logoColor=white)](https://grpc.io/)
[![Buf](https://img.shields.io/badge/Buf-235BDB?style=flat&logo=buf&logoColor=white)](https://buf.build/)
[![ConnectRPC](https://img.shields.io/badge/ConnectRPC-654FF0?style=flat&logo=connect&logoColor=white)](https://connectrpc.com/)
[![CloudEvents](https://img.shields.io/badge/CloudEvents-Compliant-blue?style=flat&logo=cloudfoundry)](https://cloudevents.io/)

> *"Why write boring microservices when you can build something that actually talks back?"*


Welcome to the most entertaining basic gRPC service you'll ever encounter! This isn't just another "Hello World" - it's a fully-featured gRPC service that includes an ELIZA-style therapist, background processing simulation, and all the modern TypeScript/Node.js goodness you crave.

## ✨ What Makes This Special?

🎭 **Three Distinct Personalities in One Service:**
- **Hello**: Your friendly neighborhood greeter with CloudEvent superpowers
- **Talk**: A streaming ELIZA therapist bot (because who doesn't need therapy while debugging?)
- **Background**: A process simulator that pretends to spin up services across different protocols

🔒 **Security First**: Local TLS certificates with `mkcert` (because even localhost deserves encryption)

⚡ **Modern Stack**: ConnectRPC + Fastify + TypeScript + Buf CLI (the cool kids' table)

🌊 **Streaming Ready**: Both client and server streaming, because sometimes one message just isn't enough

## 🛠️ Prerequisites

Before we dive into this TypeScript wonderland, make sure you have:

- **Node.js** (because obviously)
- **npm** (comes free with Node.js, like ketchup with fries)
- **[Buf CLI](https://buf.build)** (the protobuf Swiss Army knife)
- **mkcert** (for those sweet, sweet local certificates)
- **grpcurl** *(optional, but highly recommended for showing off)*

### Quick Setup for the Impatient

```bash
# Install buf (if you haven't already)
npm install -g @bufbuild/buf

# Install mkcert (macOS)
brew install mkcert

# Install mkcert (Linux)
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-v*-linux-amd64
sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
```

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone <your-repo>
cd basic-grpc-service-node
npm install
```

### 2. Generate Your Certificates (Trust Issues Much?)
```bash
npm run cert:generate
```
*This creates local certificates that your browser will actually trust. Magic!*

### 3. Generate Proto Code (Optional, but Fun)
```bash
npm run buf:generate
```
*Watch as Buf transforms your `.proto` files into beautiful TypeScript. It's like a protobuf makeover show!*

### 4. Start the Show
```bash
npm start
```

🎉 **Boom!** Your gRPC service is now running on `https://127.0.0.1:8443` with all the bells, whistles, and TLS goodness.

## 🎪 Meet Your Service Methods

### 👋 `Hello` - The Friendly Greeter
**What it does:** Takes your message and wraps it in a CloudEvent like a present

```bash
# Using buf curl (the modern way)
buf curl --schema ./proto -d '{"message": "Universe"}' \
  https://127.0.0.1:8443/basic.v1.BasicService/Hello

# Using grpcurl (the classic way)
grpcurl 127.0.0.1:8443 basic.v1.BasicService/Hello -d '{"message": "Universe"}'
```

**Response:** A CloudEvent containing a greeting that would make your grandmother proud.

### 💬 `Talk` - Your Personal Streaming Therapist
**What it does:** Engages you in meaningful conversation using ELIZA-style responses. It's like having a therapist, but one that runs on your localhost.

```bash
# Stream some deep thoughts
cat <<EOM | grpcurl 127.0.0.1:8443 basic.v1.BasicService/Talk
{"message": "Hello doctor"}
{"message": "I feel anxious about my code"}
{"message": "Why do my tests always fail?"}
{"message": "goodbye"}
EOM
```

**Pro tip:** The therapist recognizes "bye", "exit", "goodbye", and "quit" as session-ending cues. It's very respectful of boundaries.

### ⚙️ `Background` - The Process Whisperer
**What it does:** Simulates spinning up multiple background services across different protocols (REST, gRPC, GraphQL, WebSockets, you name it). Streams progress updates every 2 seconds.

```bash
# Start 5 imaginary services
buf curl --schema ./proto -d '{"processes": 5}' \
  https://127.0.0.1:8443/basic.v1.BasicService/Background
```

**What you'll see:** Real-time updates as "services" start up across random protocols. It's like `docker-compose up` but with more imagination and less disk space usage.

## 🕵️ Service Discovery & Introspection

### List All Services
```bash
# Modern way
buf curl --schema ./proto https://127.0.0.1:8443 --list-services

# Classic way
grpcurl 127.0.0.1:8443 list
```

### Explore Methods
```bash
# See what BasicService can do
buf curl --schema ./proto https://127.0.0.1:8443/basic.v1.BasicService --list-methods

# Or the grpcurl way
grpcurl 127.0.0.1:8443 list basic.v1.BasicService
```

## 🏗️ Architecture Highlights

### The Stack
- **Fastify**: Because Express is so 2019
- **ConnectRPC**: gRPC for the web-first world
- **TypeScript**: Because `any` is not a type (fight me)
- **Buf**: Protobuf management that doesn't make you cry
- **HTTP/2 + TLS**: Because we're not animals

### The Magic Sauce
- **CloudEvents**: Every response is wrapped in a CloudEvent because standards matter
- **Graceful Shutdown**: SIGINT/SIGTERM handling that would make a Unix admin proud
- **Health Checks**: Built-in health endpoint (because monitoring is love)
- **Reflection API**: Your gRPC client can discover services dynamically
- **Structured Logging**: Pino-powered logs that actually help debug

## 🎯 What's Next?

- [ ] **Unit Tests** (because future you will thank present you)
- [ ] **Integration Tests** (trust, but verify)
- [ ] **Docker Support** (containerize all the things!)
- [ ] **Kubernetes Manifests** (because why not?)
- [ ] **More Streaming Methods** (the streams must flow)
- [ ] **Authentication** (not all requests are created equal)

## 🤔 Why This Exists

This service started as a simple "Hello World" gRPC example but evolved into something more interesting. It demonstrates:

- Modern TypeScript gRPC development with ConnectRPC
- Proper TLS setup for local development
- Streaming patterns (both client and server-side)
- CloudEvents integration
- Service reflection and health checks
- Graceful shutdown patterns

Plus, who doesn't need a therapist that speaks Protocol Buffers?

## 🎭 Fun Facts

- The `Talk` service implements ELIZA, one of the first chatbot programs from the 1960s
- Background processes are randomly assigned protocols from a list of 10 different types
- Every response includes CloudEvents metadata because we believe in standards
- The service supports both HTTP/1.1 and HTTP/2 because we're inclusive like that

---

*Built with ❤️, ☕, and a healthy dose of TypeScript strictness*

**Questions? Issues? Existential Crises?** Open an issue and let's talk! (Or use the Talk method - it's a good listener.)
