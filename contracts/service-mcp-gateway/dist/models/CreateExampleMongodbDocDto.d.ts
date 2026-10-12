import type { ExampleMongodbDocObjectDto } from './ExampleMongodbDocObjectDto';
export type CreateExampleMongodbDocDto = {
    name: string;
    type: 'SOME_ENUM' | 'SOME_OTHER_ENUM';
    description?: string;
    archived?: boolean;
    exampleMongodbDocObject?: ExampleMongodbDocObjectDto;
    lastUpdated?: string;
};
