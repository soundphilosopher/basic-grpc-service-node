# Basic gRPC Service written in TypeScript

## Pre-requisites
- node installed
- npm installed
- buf.build CLI installed
- grpcurl installed (optional)

## Installation
- Clone the repository
- Install dependencies using npm `npm i`

## Running the service
1. Create local certs: `npm run cert:generate`
2. (Optional) Refresh generated code: `npm run buf:generate`
3. Start the service using npm `npm start || true`

## Building the service
- Build the service using npm `npm run build`

## Call server

```shell
# list services
~ buf curl --schema ./proto https://127.0.0.1:8443 --list-services
~ grpcurl 127.0.0.1:8443 list

# list methods
~ buf curl --schema ./proto https://127.0.0.1:8443/basic.v1.BasicService --list-methods
~ grpcurl 127.0.0.1:8443 list basic.v1.BasicService

# make a call to hello
~ buf curl --schema ./proto -d '{"message": "World"}' https://127.0.0.1:8443/basic.v1.BasicService/Hello
~ grpcurl 127.0.0.1:8443 basic.v1.BasicService/Hello -d '{"message": "World"}'

# make a call to talk
~ buf curl --schema ./proto -d '{"message": "Hello"}{"message": "How are you?"}{"message": "Bye"}' https://127.0.0.1:8443/basic.v1.BasicService/Talk
~ cat <<EOM | grpcurl 127.0.0.1:8443 basic.v1.BasicService/Talk
{"message": "Hello"}
{"message": "How are you?"}
{"message": "Bye"}
EOM

# make a call to background
~ buf curl --schema ./proto -d '{"processes": 5}' https://127.0.0.1:8443/basic.v1.BasicService/Background
~ grpcurl 127.0.0.1:8443 basic.v1.BasicService/Background -d '{"processes": 5}'
```

## ToDo's
- [x] Implement basic gRPC service
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Add documentation
- [x] Try to build service for reflection API as fastify plugin
