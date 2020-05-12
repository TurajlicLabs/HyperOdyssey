import HyperOdyssey from "@/HyperOdyssey";
import Representation from "@/Representation";
import MockHttpClient from "./utils/MockHttpClient";

describe( '@/HyperOdyssey', () => {
    it( 'Throws error when instance is created with no parameters', () => {
        // @ts-ignore
        expect( () => new HyperOdyssey() ).toThrow( 'No http client specified' );
    } );

    it( 'Creates new instance', function () {
        const hyperOdyssey = new HyperOdyssey( MockHttpClient );
        expect( hyperOdyssey ).toBeDefined();
    } );

    it( 'Creates new instance with base representations', function () {
        class testBaseRepresentation extends Representation {
        }

        class testApiRepresentation extends Representation {
        }

        const hyperOdysseyAllRepresentations = new HyperOdyssey( MockHttpClient, {
            baseRepresentation : testBaseRepresentation,
            apiRepresentation : testApiRepresentation
        } );

        expect( hyperOdysseyAllRepresentations.baseRepresentation ).toEqual( testBaseRepresentation );
        expect( hyperOdysseyAllRepresentations.apiRepresentation ).toEqual( testApiRepresentation );

        const hyperOdysseyOnlyApiRepresentation = new HyperOdyssey( MockHttpClient, {
            apiRepresentation : testApiRepresentation
        } );

        expect( hyperOdysseyOnlyApiRepresentation.baseRepresentation ).toEqual( Representation );
        expect( hyperOdysseyOnlyApiRepresentation.apiRepresentation ).toEqual( testApiRepresentation );

        const hyperOdysseyOnlyBaseRepresentation = new HyperOdyssey( MockHttpClient, {
            baseRepresentation : testBaseRepresentation
        } );

        expect( hyperOdysseyOnlyBaseRepresentation.baseRepresentation ).toEqual( testBaseRepresentation );
        expect( hyperOdysseyOnlyBaseRepresentation.apiRepresentation ).toEqual( testBaseRepresentation );
    } );
} );
