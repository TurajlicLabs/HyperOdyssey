import KnightRider from "@/KnightRider";
import MockHttpClient from "./utils/MockHttpClient";

describe('@/KnightRider', () => {
    it('Throws error when instance is created with no parameters', () => {
        // @ts-ignore
        expect( () => new KnightRider() ).toThrow( 'No http client specified' );
    });

    it('Creates new instance', function () {
        const knightRider = new KnightRider( MockHttpClient );
        expect( knightRider ).toBeDefined();
    });
});