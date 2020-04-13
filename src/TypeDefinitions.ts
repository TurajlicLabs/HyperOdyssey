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