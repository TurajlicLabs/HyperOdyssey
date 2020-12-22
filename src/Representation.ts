import UriTemplate from 'uri-templates';
import HyperOdyssey from "@/HyperOdyssey";
import { Resource } from 'halfred';

const forbiddenProps = [ '_embedded', '_links' ];

export default class Representation {
    private readonly odyssey: HyperOdyssey;
    private readonly context: string;
    private resource: typeof Resource;
    private profiles: Map<string, Promise<{ default: typeof Representation}> | typeof Representation>;
    private relationNames: Map<string, Promise<{ default: typeof Representation}> | typeof Representation>;
    private relationMatchers: Map<RegExp, Promise<{ default: typeof Representation}> | typeof Representation>;

    constructor( link: string | undefined | null, resource: typeof Resource, odyssey: HyperOdyssey ) {
        this.resource = resource;
        this.odyssey = odyssey;
        this.context = link;

        this.profiles = new Map<string, Promise<{ default: typeof Representation}> | typeof Representation>();
        this.relationNames = new Map<string, Promise<{ default: typeof Representation}> | typeof Representation>();
        this.relationMatchers = new Map<RegExp, Promise<{ default: typeof Representation}> | typeof Representation>();
    }

    link( linkRel ) {
        return this.resource.link( linkRel );
    }

    embedded( embeddedRel ) {
        return this.resource.embeddedResource( embeddedRel );
    }

    prop( propName ) {
        if ( !forbiddenProps.includes( propName ) ) {
            return this.resource[ propName ] || undefined;
        }
    }

    addProfile( name: string, representationClass: Promise<{ default: typeof Representation}> | typeof Representation ) {
        this.profiles.set( name, representationClass );
    }

    addRelationName( name: string, representationClass: Promise<{ default: typeof Representation}> | typeof Representation ) {
        this.relationNames.set( name, representationClass );
    }

    addRelationMatcher( regExp: RegExp, representationClass: Promise<{ default: typeof Representation}> | typeof Representation ) {
        this.relationMatchers.set( regExp, representationClass );
    }

    private async evaluateRepresentation( resource, rel ) {
        let representationClass: Promise<{ default: typeof Representation}> | typeof Representation;
        if ( resource && resource.profile && this.profiles.has( resource.profile ) ) {
            representationClass = this.profiles.get( resource.profile );
        }
        else if ( this.relationNames.has( rel ) )  {
            representationClass = this.relationNames.get( rel );
        }
        else if ( this.relationMatchers.size ) {
            for ( let [ matcher, representation ] of this.relationMatchers.entries() ) {
                if ( matcher.test( rel ) ) {
                    representationClass = representation;
                    break;
                }
            }
        }
        else {
            representationClass = this.odyssey.baseRepresentation;
        }

        if ( 'then' in representationClass ) {
            return representationClass.then( ( module ) => module.default );
        }

        return representationClass;
    }

    private async followLink( rel: string, templateParams: {} ) {
        let links = this.resource.linkArray( rel ) || [];
        if ( links.length > 1 ) {
            return  new this.odyssey.baseRepresentation( links.href ?? links, this.odyssey.parse( links ), this.odyssey );
        }
        else if ( links.length === 0 ) {
            return Promise.reject( 'no link relation found under that name ' + rel );
        }

        let link = links[ 0 ];
        if ( link.templated ) {
            let template = new UriTemplate( link.href );
            link = template.fill( templateParams );
        }
        let representationClass = await this.evaluateRepresentation( link, rel );
        return this.odyssey.http( { url: link } ).then( async ( { data, headers } ) => {
            let contentType = headers && headers[ 'content-type' ];
            let resource = this.odyssey.parse( data );
            let resourceSelf = resource.link( 'self' );
            let currentProfile = link.profile;

            if ( resourceSelf && resourceSelf.profile ) {
                if ( resourceSelf.profile !== currentProfile ) {
                    representationClass = await this.evaluateRepresentation( resourceSelf, rel );
                }
            }
            else if ( contentType ) {
                let profile = Object.keys( this.profiles ).find( ( profileName ) => contentType.includes( profileName ) );
                if ( profile && profile !== currentProfile ) {
                    representationClass = await this.evaluateRepresentation( { profile }, rel )
                }
            }

            return new representationClass( link.href || link, resource, this.odyssey );
        } );
    }

    async getEmbedded( embeddedArray, rel ): Promise<Array<Representation> | Representation> {
        let representations = [];
        for ( const embedded of embeddedArray ) {
            let representationClass = await this.evaluateRepresentation( embedded, rel );
            let representation = new representationClass( this.context, embedded, this.odyssey );
            representations.push( representation );
        }

        if ( representations.length === 1 ) {
            return representations[ 0 ];
        }

        return representations;
    }

    private async evaluateFetchType( rel: string, templateParams: {} ): Promise<Representation | Array<Representation>> {
        if ( rel ) {
            let embeddedArray = this.resource.embeddedArray( rel ) || [];
            if ( !embeddedArray.length ) {
                return this.followLink( rel, templateParams );
            }
            else {
                return this.getEmbedded( embeddedArray, rel );
            }
        }
        else {
            let url = this.link( 'self' );
            if ( !url ) {
                url = this.context;
            }
            else {
                url = url.href
            }

            let response = await this.odyssey.http( { url } );
            this.resource = this.odyssey.parse( response.data );
            return this;
        }
    }

    fetch( rel: string, templateParams: {} ) {
        return new FetchPromise(
            ( rs, rj ) => this.evaluateFetchType( rel, templateParams )
                                                  .then( rs )
                                                  .catch( rj )
        );
    }
}

class FetchPromise<Representation> extends Promise<Representation> {
    fetch( rel: string, templateParams: {} ): Promise<Representation | {} > {
        return this.then( ( response ) => {
            if ( response instanceof Representation ) {
                return response.fetch( rel, templateParams );
            }

            return response;
        } );
    }
}