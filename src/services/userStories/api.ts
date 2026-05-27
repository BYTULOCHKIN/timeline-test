import { supabase } from '@/lib/supabase/client';
import { CreateUserStoryPayload, DeleteUserStoryPayload, UserStory, UserStoryRow } from './types';

const mapStoryRow = (row: UserStoryRow): UserStory => {
    return {
        id: row.id,
        year: row.year,
        authorName: row.author_name,
        authorRole: row.author_role,
        storyText: row.story_text,
        createdAt: row.created_at,
        images: (row.user_story_images ?? [])
            .map((image) => {
                return {
                    id: image.id,
                    storyId: image.story_id,
                    publicUrl: image.public_url,
                    storagePath: image.storage_path,
                    sortOrder: image.sort_order,
                    createdAt: image.created_at,
                };
            })
            .sort((a, b) => {
                return a.sortOrder - b.sortOrder;
            }),
    };
};

export const getUserStoriesByYear = async (year: string): Promise<UserStory[]> => {
    const { data, error } = await supabase
        .from('user_stories')
        .select(
            `
            id,
            year,
            author_name,
            author_role,
            story_text,
            created_at,
            user_story_images (
                id,
                story_id,
                public_url,
                storage_path,
                sort_order,
                created_at
            )
        `
        )
        .eq('year', year)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false });

    if (error) {
        throw error;
    }

    return (data as UserStoryRow[]).map(mapStoryRow);
};

export const createUserStory = async (payload: CreateUserStoryPayload): Promise<UserStory> => {
    const formData = new FormData();
    formData.append('year', payload.year);
    formData.append('authorName', payload.authorName);
    formData.append('authorRole', payload.authorRole ?? '');
    formData.append('storyText', payload.storyText);
    formData.append('turnstileToken', payload.turnstileToken);

    payload.images.forEach((image) => {
        formData.append('images', image);
    });

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user-story`, {
        method: 'POST',
        headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: formData,
    });

    const responseText = await response.text();
    let data: { story?: UserStory; message?: string } = {};

    try {
        data = responseText ? (JSON.parse(responseText) as { story?: UserStory; message?: string }) : {};
    } catch {
        data = {
            message: responseText,
        };
    }

    if (!response.ok || !data.story) {
        throw new Error(data.message || `Не вдалося зберегти історію. Код відповіді: ${response.status}`);
    }

    return data.story;
};

export const deleteUserStory = async (payload: DeleteUserStoryPayload): Promise<void> => {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user-story`, {
        method: 'POST',
        headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let data: { message?: string } = {};

    try {
        data = responseText ? (JSON.parse(responseText) as { message?: string }) : {};
    } catch {
        data = {
            message: responseText,
        };
    }

    if (!response.ok) {
        throw new Error(data.message || `Не вдалося видалити історію. Код відповіді: ${response.status}`);
    }
};
