# Basic gRPC Service written in TypeScript

## Pre-requisites
- Node.js installed
- npm installed
- TypeScript installed
- buf.build CLI installed

## Limitations
- No support for reflection API (postman, grpcurl)

## Installation
- Clone the repository
- Install dependencies using npm `npm i`

## Running the service
1. Create local certs: `mkcert -install && mkcert -cert-file ./certs/local.crt -key-file ./certs/local.key localhost 127.0.0.1 0.0.0.0 ::1`
2. Start the service using npm `npm start || true`

## Building the service
- Build the service using npm `npm run build`

## Call server

```shell
# list services
~ buf curl --schema ./proto https://127.0.0.1:8443 --list-services

# list methods
~ buf curl --schema ./proto https://127.0.0.1:8443/basic.v1.BasicService --list-methods

# make a call to hello
~ buf curl --schema ./proto -d '{"message": "World"}' https://127.0.0.1:8443/basic.v1.BasicService/Hello

# make a call to talk
~ buf curl --schema ./proto -d '{"message": "Hello"}{"message": "How are you?"}{"message": "Bye"}' https://127.0.0.1:8443/basic.v1.BasicService/Talk

# make a call to background
~ buf curl --schema ./proto -d '{"processes": 5}' https://127.0.0.1:8443/basic.v1.BasicService/Background
```

## ToDo's
- [x] Implement basic gRPC service
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Add documentation
- [ ] Try to build service for reflection API as fastify plugin
