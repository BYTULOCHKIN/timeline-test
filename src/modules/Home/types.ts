export type Milestone = {
    id: string;
    year: string;
    title: string;
    description: string;
    metrics?: {
        [key: string]: string;
    };
    tags: string[];
    image: string;
};

export type TimelineFilter = 'Усі' | Milestone['tags'][number];
