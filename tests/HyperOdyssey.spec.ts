import HyperOdyssey from '@/HyperOdyssey';
import Representation from '@/Representation';
import MockHttpClient from './utils/MockHttpClient';
import { HttpResponse } from '@/interface';
import { HttpMethod } from '@/constant';

describe( '@/HyperOdyssey', () => {
    let httpClient = MockHttpClient;
    beforeEach( function() {
        Object.keys( MockHttpClient ).forEach( ( httpMethod ) => {
            // @ts-ignore
            httpClient[ httpMethod ] = MockHttpClient[ httpMethod ].mockReturnThis( Promise.resolve( { data: {} } ) );
        } );
    } );

    it( 'Throws error when instance is created with no parameters', () => {
        // @ts-ignore
        expect( () => new HyperOdyssey() ).toThrow( 'No valid arguments specified' );
    } );

    it( 'Creates new instance', function() {
        const hyperOdyssey = new HyperOdyssey( {
            httpClient
        } );

        expect( hyperOdyssey ).toBeDefined();

        const hyperOdysseySingleParam = new HyperOdyssey( httpClient );
        expect( hyperOdysseySingleParam ).toBeDefined();
    } );

    it( 'Creates new instance with base representations', function() {
        class testBaseRepresentation extends Representation {}
        class testApiRepresentation extends Representation {}

        const hyperOdysseyAllRepresentations = new HyperOdyssey( {
            httpClient,
            baseRepresentation: testBaseRepresentation,
            apiRepresentation: testApiRepresentation
        } );

        expect( hyperOdysseyAllRepresentations.baseRepresentation ).toEqual( testBaseRepresentation );
        expect( hyperOdysseyAllRepresentations.apiRepresentation ).toEqual( testApiRepresentation );

        const hyperOdysseyOnlyApiRepresentation = new HyperOdyssey( {
            httpClient,
            apiRepresentation: testApiRepresentation
        } );

        expect( hyperOdysseyOnlyApiRepresentation.baseRepresentation ).toEqual( Representation );
        expect( hyperOdysseyOnlyApiRepresentation.apiRepresentation ).toEqual( testApiRepresentation );

        const hyperOdysseyOnlyBaseRepresentation = new HyperOdyssey( {
            httpClient,
            baseRepresentation: testBaseRepresentation
        } );

        expect( hyperOdysseyOnlyBaseRepresentation.baseRepresentation ).toEqual( testBaseRepresentation );
        expect( hyperOdysseyOnlyBaseRepresentation.apiRepresentation ).toEqual( testBaseRepresentation );
    } );

    it( 'Create new instance with API caching enabled', function() {
        const hyperOdyssey = new HyperOdyssey( {
            httpClient,
            httpCaching: true
        } );

        expect( hyperOdyssey.httpCache ).toBeDefined();
    } );

    it( 'Create instance with API caching and custom caching httpCachingMechanism ', function() {
        const customCaching = new Map<String, Promise<HttpResponse>>();
        const hyperOdyssey = new HyperOdyssey( {
            httpClient,
            httpCaching: true,
            httpCachingMechanism: customCaching
        } );

        expect( hyperOdyssey.httpCache ).toBeDefined();
        expect( hyperOdyssey.httpCache ).toEqual( customCaching );
    } );

    describe( 'Fetch Root', () => {
        const mockApiUrl = 'http://domain.com/';
        let hyperOdyssey: HyperOdyssey;
        beforeEach( () => {
            hyperOdyssey = new HyperOdyssey( {
                httpClient,
                httpCaching: true
            } );
        } );

        it( 'Fetch root with no parameters', function() {
            hyperOdyssey.fetchRoot();
            expect( httpClient.get ).toHaveBeenCalledWith( {} );
            httpClient.get.mockClear();

            hyperOdyssey.fetchRoot( false );
            expect( httpClient.get ).not.toHaveBeenCalledWith( {} );
        } );

        it( 'Fetch root with api url', function() {
            hyperOdyssey.fetchRoot( mockApiUrl );
            expect( httpClient.get ).toHaveBeenCalledWith( { url: mockApiUrl } );
            httpClient.get.mockClear();

            hyperOdyssey.fetchRoot( mockApiUrl, false );
            expect( httpClient.get ).not.toHaveBeenCalledWith( { url: mockApiUrl } );
        } );

        it( 'Fetch root with api url and method', function() {
            hyperOdyssey.fetchRoot( mockApiUrl, HttpMethod.HEAD );
            expect( httpClient.head ).toHaveBeenCalledWith( { url: mockApiUrl } );
            httpClient.head.mockClear();

            hyperOdyssey.fetchRoot( mockApiUrl, HttpMethod.HEAD, false );
            expect( httpClient.head ).not.toHaveBeenCalledWith( { url: mockApiUrl } );
        } );

        it( 'Fetch root with api url, method and parameters', function() {
            let mockParameters = { headers: { 'Accept': 'application/hal+json' } };
            hyperOdyssey.fetchRoot( mockApiUrl, HttpMethod.POST, mockParameters );
            expect( httpClient.post ).toHaveBeenCalledWith( { url: mockApiUrl, ...mockParameters } );
            httpClient.post.mockClear();

            hyperOdyssey.fetchRoot( mockApiUrl, HttpMethod.POST, mockParameters, false );
            expect( httpClient.post ).not.toHaveBeenCalledWith( { url: mockApiUrl, ...mockParameters } );
        } );
    } );
} );
