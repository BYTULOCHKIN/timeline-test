import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = (request?: Request) => ({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
        request?.headers.get('Access-Control-Request-Headers') ?? 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
});

const BUCKET = 'timeline-stories';

const json = (body: Record<string, unknown>, status = 200, request?: Request) => {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            ...corsHeaders(request),
            'Content-Type': 'application/json',
        },
    });
};

const getSupabaseSecretKey = () => {
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (serviceRoleKey) {
        return serviceRoleKey;
    }

    const secretKeys = Deno.env.get('SUPABASE_SECRET_KEYS');

    if (!secretKeys) {
        return null;
    }

    return JSON.parse(secretKeys).default as string | undefined;
};

Deno.serve(async (request) => {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    try {
        if (request.method !== 'POST') {
            return json({ message: 'Метод не підтримується' }, 405, request);
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseSecretKey = getSupabaseSecretKey();

        if (!supabaseUrl || !supabaseSecretKey) {
            return json({ message: 'Supabase Edge Function не має потрібних секретів' }, 500, request);
        }

        const body = (await request.json().catch(() => {
            return {};
        })) as { storyId?: string; mode?: string };

        if (body.mode !== 'admin') {
            return json({ message: 'Недостатньо прав для видалення історії' }, 403, request);
        }

        if (!body.storyId) {
            return json({ message: 'Не передано ID історії' }, 400, request);
        }

        const supabase = createClient(supabaseUrl, supabaseSecretKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        });

        const { data: images, error: imagesError } = await supabase
            .from('user_story_images')
            .select('storage_path')
            .eq('story_id', body.storyId);

        if (imagesError) {
            return json({ message: imagesError.message }, 500, request);
        }

        const storagePaths = (images ?? [])
            .map((image) => {
                return image.storage_path as string | null;
            })
            .filter((path): path is string => {
                return Boolean(path);
            });

        const { error: deleteImagesError } = await supabase
            .from('user_story_images')
            .delete()
            .eq('story_id', body.storyId);

        if (deleteImagesError) {
            return json({ message: deleteImagesError.message }, 500, request);
        }

        const { error: deleteError } = await supabase.from('user_stories').delete().eq('id', body.storyId);

        if (deleteError) {
            return json({ message: deleteError.message }, 500, request);
        }

        if (storagePaths.length > 0) {
            const { error: storageError } = await supabase.storage.from(BUCKET).remove(storagePaths);

            if (storageError) {
                return json({ ok: true, warning: storageError.message }, 200, request);
            }
        }

        return json({ ok: true }, 200, request);
    } catch (error) {
        return json(
            {
                message: error instanceof Error ? error.message : 'Не вдалося видалити історію',
            },
            500,
            request
        );
    }
});
