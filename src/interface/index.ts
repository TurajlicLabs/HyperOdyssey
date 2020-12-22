import Representation from '@/Representation';

export interface HttpResponse {
    data: object,
    headers: object
}

export interface HttpClient {
    get( {}: HttpMethodOptions ): Promise<HttpResponse>
    put( {}: HttpMethodOptions ): Promise<HttpResponse>
    head( {}: HttpMethodOptions ): Promise<HttpResponse>
    post( {}: HttpMethodOptions ): Promise<HttpResponse>
    patch( {}: HttpMethodOptions ): Promise<HttpResponse>
    trace( {}: HttpMethodOptions ): Promise<HttpResponse>
    delete( {}: HttpMethodOptions ): Promise<HttpResponse>
    connect( {}: HttpMethodOptions ): Promise<HttpResponse>
    options( {}: HttpMethodOptions ): Promise<HttpResponse>
}

export interface CachingInterface {
    httpCachingMethods: Array<string>
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
    apiRepresentation?: typeof Representation,
    baseRepresentation?: typeof Representation,
    httpCaching?: {
        httpCachingMechanism?: CachingInterface,
        httpCachingMethods?: Array<string>
    } | boolean,
}

