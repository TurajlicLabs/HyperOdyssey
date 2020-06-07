import {
    CachingInterface,
    InitParams,
    HttpClient,
    HttpResponse,
    HttpMethodOptions
} from '@/interface';

import Representation from '@/Representation';
import { HttpMethod } from '@/constant';

// This is just here so we have a base caching class to refer to
class DefaultCaching<K, V> extends Map implements CachingInterface {
}

const DEFAULT_CACHING = new DefaultCaching<String, HttpResponse>();

function isHttpClient( httpClient: HttpClient | undefined ) {
    if ( !httpClient ) {
        return false;
    }
    // @TODO: see if there is a better way of doing this
    return ( HttpMethod.POST in httpClient && HttpMethod.GET in httpClient );
}

export default class HyperOdyssey {
    private readonly httpClient: HttpClient;
    private readonly _httpCache: CachingInterface | undefined;
    baseRepresentation: Representation;
    apiRepresentation: Representation;

    constructor( initParams: InitParams | HttpClient ) {
        if ( initParams && 'httpClient' in initParams ) {
            initParams = <InitParams>initParams;
            this.httpClient = <HttpClient>initParams.httpClient;

            if ( !isHttpClient( this.httpClient ) ) {
                throw new TypeError( 'Invalid http client specified' );
            }

            this.baseRepresentation = initParams?.baseRepresentation ?? Representation;
            this.apiRepresentation = initParams?.apiRepresentation ?? this.baseRepresentation;

            if ( !!initParams?.httpCaching ) {
                this._httpCache = initParams?.httpCachingMechanism ?? DEFAULT_CACHING;
            }
        }
        else if ( isHttpClient( initParams ) ) {
            this.httpClient = <HttpClient>initParams;
            this.baseRepresentation = Representation;
            this.apiRepresentation = this.baseRepresentation;
        }
        else {
            throw new Error( 'No valid arguments specified' );
        }
    }

    protected http( { url = '', method = HttpMethod.GET, httpMethodOptions = {}, force = false } ): Promise<HttpResponse> {
        if ( method in this.httpClient ) {
            let response: Promise<HttpResponse>;
            let httpMethod: ( httpMethodOptions: HttpMethodOptions ) => Promise<HttpResponse>;
            httpMethod = this.httpClient[ method ];
            httpMethodOptions = <HttpMethodOptions>httpMethodOptions;

            if ( url && !( 'url' in httpMethodOptions ) ) {
                httpMethodOptions[ 'url' ] = url;
            }

            if ( this._httpCache ) {
                let uId = url + JSON.stringify( httpMethodOptions );
                if ( !this._httpCache.has( uId ) || force ) {
                    response = httpMethod( httpMethodOptions );
                    this._httpCache.set( uId, response );
                    return response;
                }
                else {
                    response = this._httpCache.get( uId );
                }
            }
            else {
                response = httpMethod( httpMethodOptions );
            }

            return response;
        }

        throw new TypeError( `There is no method named ${ method } present in your httpClient` );
    }

    fetchRoot( ...args: any[] ): Promise<HttpResponse> {
        let last = args.pop();
        let params: Array<string|boolean|object> = [];
        let force = true;
        if ( typeof last === "boolean" ) {
            force = last;
            params = args;
        }
        else {
            params = [ ...args, last ]
        }

        let [ url, method, httpMethodOptions ] = params;
        // @ts-ignore
        // @TODO: figure out how to remove the ignore
        return this.http( { url, method, httpMethodOptions, force } );
    }

    get httpCache(): CachingInterface | undefined {
        return this._httpCache;
    }
}
