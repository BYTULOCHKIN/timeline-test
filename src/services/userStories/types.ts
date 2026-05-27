export type UserStoryImage = {
    id: string;
    storyId: string;
    publicUrl: string;
    storagePath: string;
    sortOrder: number;
    createdAt: string;
};

export type UserStory = {
    id: string;
    year: string;
    authorName: string;
    authorRole: string | null;
    storyText: string;
    createdAt: string;
    images: UserStoryImage[];
};

export type UserStoryRow = {
    id: string;
    year: string;
    author_name: string;
    author_role: string | null;
    story_text: string;
    created_at: string;
    user_story_images: UserStoryImageRow[] | null;
};

export type UserStoryImageRow = {
    id: string;
    story_id: string;
    public_url: string;
    storage_path: string;
    sort_order: number;
    created_at: string;
};

export type CreateUserStoryPayload = {
    year: string;
    authorName: string;
    authorRole?: string;
    storyText: string;
    turnstileToken: string;
    images: File[];
};

export type DeleteUserStoryPayload = {
    storyId: string;
    mode: 'admin';
};
