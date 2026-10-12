import type { ExampleMongodbDocObjectDto } from './ExampleMongodbDocObjectDto';
export type ExampleMongodbDocDto = {
    _id: string;
    name: string;
    type: 'SOME_ENUM' | 'SOME_OTHER_ENUM';
    version: number;
    description: string;
    lastUpdated: string;
    archived: boolean;
    exampleMongodbDocObject?: ExampleMongodbDocObjectDto;
    __v: number;
};
