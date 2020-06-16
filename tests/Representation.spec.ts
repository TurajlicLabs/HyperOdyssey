import Representation from "@/Representation";
import { createSpyObj } from "./utils";
import { parse } from 'halfred';
import { HttpMethod } from "@/constant";

describe( '@/Representation', () => {
    let representation;
    let context;
    let halResponseMock;
    let hyperOdysseyMock;

    beforeEach( () => {
        context = 'http://api.domain.org/api';
        halResponseMock = {
            _links: {},
            _embedded: {}
        };
        hyperOdysseyMock = createSpyObj( 'HyperOdyssey', [ 'parse', 'http' ] );
        hyperOdysseyMock.parse.mockImplementation( ( hal ) => parse( hal ) );
        hyperOdysseyMock.baseRepresentation = Representation;

        representation = new Representation( context, parse( halResponseMock ), hyperOdysseyMock )
    } );

    it( 'should create instance of Representation', () => {
        expect( representation ).toBeDefined();
        expect( representation instanceof Representation ).toBeTruthy();
    } );

    it( 'should be possible to fetch a link', async () => {
        hyperOdysseyMock.http.mockReturnValue( Promise.resolve({
            data: {
                '_embedded': {
                    'the-actual:image': {
                        'test-craft': 'stuff'
                    }
                },
                'test-content': 'content'
            }
        } ) );
        representation.resource = parse( {
            '_links': {
                'self': {
                    'href': 'self link'
                },
                'item:image': {
                    'href': 'image link'
                }
            }
        } );

        let linkFetch = await representation.fetch( 'item:image' );
        expect( linkFetch instanceof Representation ).toBeTruthy();
        expect( linkFetch.context ).toEqual( 'image link' );
        expect( linkFetch.prop( 'test-content' ) ).toEqual( 'content' );

        let image = await linkFetch.fetch( 'the-actual:image' );
        expect( image.prop( 'test-craft' ) ).toEqual( 'stuff' );
        expect( image.context ).toEqual( 'image link' );
    } );

    it( 'should be possible to fetch templated url', async () => {
        const response = {
            data: {
                'name': 'Test Testerson',
                'age': 99
            }
        };
        hyperOdysseyMock.http.mockReturnValueOnce( Promise.resolve( response ) );

        representation.resource = parse( {
            '_links': {
                'self': {
                    'href': 'self link'
                },
                'item:templated': {
                    'href': '/{path}/{to}/{user}',
                    'templated': true
                }
            }
        } );

        await representation.fetch( 'item:templated', {
            path: 'api',
            to: 'user',
            user: 'testtestrson'
        } );

        expect( hyperOdysseyMock.http ).toHaveBeenCalledWith( { url: '/api/user/testtestrson' } );
    } );

    it( 'should fetch self if no rel is specified', async () => {
        hyperOdysseyMock.http.mockReturnValueOnce(  {
            data: {
                '_links': {
                    'self': {
                        'href': 'self link'
                    }
                },
                '_embedded': {
                    'prop:client': {
                        'image': '/path/to/image',
                        'username': 'test',
                        'fullname': 'Test Testerson',
                        'role': 'tester'
                    }
                }
            }
        } );

        representation.resource = parse( {
            '_links': {
                'self': {
                    'href': 'self link'
                }
            },
            '_embedded': {
                'prop:client': {
                    'image': '/path/to/image',
                    'username': 'test',
                    'fullname': 'Test Testerson'
                }
            }
        } );

        let client = representation.embedded( 'prop:client' );
        expect( client.role ).toBeUndefined();

        let newRepresentation = await representation.fetch();
        expect( hyperOdysseyMock.http ).toHaveBeenCalledWith( { url: 'self link' } );
        // makes sure the the return value is pointing to the same instance
        expect( newRepresentation === representation ).toBe( true );

        client = newRepresentation.embedded( 'prop:client' );
        expect( client.role ).toEqual( 'tester' );
    } );

    it( 'makes http request to specific links', function() {
        representation.followLink( {
            link: 'link',
            template: {
                stuff: 'cool'
            },
            method: HttpMethod.POST,
            httpParams: {
                headers: {
                    Accept: 'Stuff'
                }
            }
        } );
    } );
} );