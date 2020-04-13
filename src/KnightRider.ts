import { HttpClient } from "@/TypeDefinitions";

export default class KnightRider {
    constructor( httpClient: HttpClient  ) {
        if ( !httpClient ) {
            throw new TypeError( 'No http client specified' );
        }
    }
}