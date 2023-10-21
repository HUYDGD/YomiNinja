import { DictionaryDefinition } from "../dictionary_definition/dictionary_definition";
import { DictionaryTag } from "../dictionary_tag/dictionary_tag";


export type DictionaryHeadwordId = string;


export type DictionaryHeadwordConstructorProps = {
    id?: DictionaryHeadwordId;
    term: string;
    reading: string;
    definitions: DictionaryDefinition[];
    tags: DictionaryTag[];
}

export interface DictionaryHeadwordCreationInput extends Omit<
    DictionaryHeadwordConstructorProps,
    'id' | 'definitions' | 'tags'
> {
    definitions?: DictionaryDefinition[];
    tags?: DictionaryTag[];
};

// Entity represent the a dictionary Headword or Heading ( unique combination of a "term" and "reading" )
export class DictionaryHeadword {
    
    id: DictionaryHeadwordId;
    term: string;
    reading: string;
    definitions: DictionaryDefinition[];
    tags: DictionaryTag[];

    protected constructor( props: DictionaryHeadwordConstructorProps ) {

        if (!props) return;

        this.id = props?.id || DictionaryHeadword.generateId({
            term: props.term,
            reading: props.reading,
        });

        this.term = props.term,
        this.reading = props.reading;
        this.definitions = props?.definitions || [];
        this.tags = props?.tags || [];
    }

    static create( input: DictionaryHeadwordCreationInput ) {
        return new DictionaryHeadword({
            ...input,
            definitions: input.definitions || [],
            tags: input.tags || [],
        });
    }

    addDefinition( definition: DictionaryDefinition ) {

        // if ( definition.dictionary_headword_id !== this.id )
        //     return;

        this.definitions.push( definition );
    }

    getPopularityScore(): number {      

        return Math.max(
            ...this.definitions.map( definition => definition.popularity_score ),
            0
        );    
    }

    nullCheck() {
        this.definitions = this.definitions || [];
        this.tags = this.tags || [];
    }

    static generateId( input: { term: string, reading: string } ): DictionaryHeadwordId {
        return input.term + '/' + input.reading;
    }
}