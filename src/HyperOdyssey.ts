import { HttpClient } from "@/TypeDefinitions";
import Representation from "@/Representation";

interface Representations {
    apiRepresentation? : Representation,
    baseRepresentation? : Representation
}

export default class HyperOdyssey {
    readonly baseRepresentation : Representation;
    readonly apiRepresentation : Representation;
    private httpClient : HttpClient;

    constructor( httpClient : HttpClient, representations? : Representations ) {
        if ( !httpClient ) {
            throw new TypeError( 'No http client specified' );
        }

        this.httpClient = httpClient;

        this.baseRepresentation = representations?.baseRepresentation ?? Representation;
        this.apiRepresentation = representations?.apiRepresentation ?? this.baseRepresentation;
    }
}