import {
    CachingInterface,
    InitParams,
    HttpClient,
    HttpResponse,
    HttpMethodOptions
} from '@/interface';
import Representation from '@/Representation';
import { HttpMethod } from '@/constant';
import DefaultCachingMechanism from "@/CachingMechanism";

import { parse } from 'halfred';

const DEFAULT_CACHING = new DefaultCachingMechanism<string, HttpResponse>();

function isHttpClient( httpClient: HttpClient | InitParams | undefined ) {
    if ( !httpClient ) {
        return false;
    }
    // @TODO: see if there is a better way of doing this
    return ( HttpMethod.POST in httpClient && HttpMethod.GET in httpClient );
}

export default class HyperOdyssey {
    private readonly httpClient: HttpClient;
    private readonly _httpCache: CachingInterface | undefined;
    private _baseRepresentation: typeof Representation;
    private _apiRepresentation: typeof Representation;

    constructor( initParams: InitParams | HttpClient ) {
        if ( initParams && 'httpClient' in initParams ) {
            initParams = <InitParams>initParams;
            this.httpClient = <HttpClient>initParams.httpClient;

            if ( !isHttpClient( this.httpClient ) ) {
                throw new TypeError( 'Invalid http client specified' );
            }

            this._baseRepresentation = initParams.baseRepresentation ?? Representation;
            this._apiRepresentation = initParams.apiRepresentation ?? this._baseRepresentation;

            let httpCaching = initParams.httpCaching;
            if ( httpCaching ) {
                if (  typeof httpCaching !== "boolean" ) {
                    this._httpCache = httpCaching.httpCachingMechanism ?? DEFAULT_CACHING;
                    this._httpCache.httpCachingMethods = httpCaching.httpCachingMethods ?? [ HttpMethod.GET ];
                }
                else {
                    this._httpCache = DEFAULT_CACHING;
                    this._httpCache.httpCachingMethods = [ HttpMethod.GET ];
                }
            }
        }
        else if ( isHttpClient( initParams ) ) {
            this.httpClient = <HttpClient>initParams;
            this._baseRepresentation = Representation;
            this._apiRepresentation = this._baseRepresentation;
        }
        else {
            throw new Error( 'No valid arguments specified' );
        }
    }

    http( { url = '', method = HttpMethod.GET, httpMethodOptions = {}, force = false } ): Promise<HttpResponse> {
        if ( method in this.httpClient ) {
            let response: Promise<HttpResponse>;
            let httpMethod: ( httpMethodOptions: HttpMethodOptions ) => Promise<HttpResponse>;
            httpMethod = this.httpClient[ method ];
            httpMethodOptions = <HttpMethodOptions>httpMethodOptions;

            if ( url && !( 'url' in httpMethodOptions ) ) {
                httpMethodOptions[ 'url' ] = url;
            }

            if ( this._httpCache && this._httpCache.httpCachingMethods.includes( method ) ) {
                let uId = method.toUpperCase() + url + JSON.stringify( httpMethodOptions );
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

    parse( halObject ) {
        return parse( halObject );
    }

    async fetchRoot( ...args: any[] ): Promise<Representation> {
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
        const resource = this.parse( await this.http( { url, method, httpMethodOptions, force } ) );
        // @ts-ignore
        return new this._apiRepresentation( url, resource, this )
    }

    get httpCache(): CachingInterface | undefined {
        return this._httpCache;
    }

    get baseRepresentation(): typeof Representation {
        return this._baseRepresentation;
    }

    get apiRepresentation(): typeof Representation {
        return this._apiRepresentation;
    }
}
