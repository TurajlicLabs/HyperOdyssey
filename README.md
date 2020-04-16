# KnightRider for Node.js and the Browser
This is a light weight library for representing HAL objects. [What is HAL?](http://stateless.co/hal_specification.html)  
## Dependencies
There is only one production dependence for this library. 
- [Halfred](https://github.com/traverson/halfred/tree/v1.1.1#readme)
 
Halfred was chosen because its a HAL object parsing library (no point in reinventing the wheel here) and, because 
Halfred was written by [Traverson](https://github.com/traverson/traverson#readme) who have inspired the creation of KnightRider.  

## Why does this exist? 
For years developers have had to figure out a good and reliable way of representing HAL object on the client side. 
There are lots of ways of doing this but they all are kind of clunky, ether you have to manually fish the values out
for each request or you have to setup a server in between such as GraphQL or similar to build custom objects and then relay them
to your application. 

KnightRider makes this whole process simpler, by providing an interface for all your HAL representations while also using
promises to handle the async requests. KnightRider has an interesting way of drilling down through requests. KnightRider can actually follow
request through multiple resources.

## Why choose KnightRider
KnightRider tries to stay as unopinionated as possible because even though we would all like to follow the spec to 100%
some times that is not possible and with KnightRider you can extend and rewrite every representation even the base one.  

KnightRider does not have any HTTP client in the project and it is not dependent on a specific one. 
When you initiate KnightRider you pass an HTTP client as a parameter. There are two requirements on this HTTP client
1. It must be promise based
1. It needs to follow this interface.
```typescript
export interface HttpResponse {
    data: object
}

export interface HttpClient {
    get(): Promise<HttpResponse>
    put(): Promise<HttpResponse>
    head(): Promise<HttpResponse>
    post(): Promise<HttpResponse>
    patch(): Promise<HttpResponse>
    trace?(): Promise<HttpResponse>
    delete(): Promise<HttpResponse>
    connect?(): Promise<HttpResponse>
    options(): Promise<HttpResponse>
}
```
In the future we will probably provide adapters for all the most popular HTTP clients, 
but for now you will have to implement your own adapter or use [Axios](https://github.com/axios/axios#readme) which already
follows this interface.
