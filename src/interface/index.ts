import Representation from '@/Representation';

export interface HttpResponse {
    data: object
}

export interface HttpClient {
    get( {} ): Promise<HttpResponse>
    put( {} ): Promise<HttpResponse>
    head( {} ): Promise<HttpResponse>
    post( {} ): Promise<HttpResponse>
    patch( {} ): Promise<HttpResponse>
    trace( {} ): Promise<HttpResponse>
    delete( {} ): Promise<HttpResponse>
    connect( {} ): Promise<HttpResponse>
    options( {} ): Promise<HttpResponse>
}

export interface CachingInterface {
    clear(): void;
    delete( key: String ): boolean;
    get( key: String ): Promise<HttpResponse> | undefined;
    has( key: String ): boolean;
    set( key: String, value: Promise<HttpResponse> ): this;
}

export interface HttpMethodOptions {
    url?: string,
    headers?: {}
}

export interface InitParams {
    httpClient: HttpClient,
    apiRepresentation?: Representation,
    baseRepresentation?: Representation,
    httpCaching?: boolean,
    httpCachingMechanism?: CachingInterface
}
