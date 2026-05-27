import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const BUCKET = 'timeline-stories';

const json = (body: Record<string, unknown>, status = 200) => {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            ...corsHeaders,
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
        return new Response('ok', { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
        return json({ message: 'Метод не підтримується' }, 405);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseSecretKey = getSupabaseSecretKey();

    if (!supabaseUrl || !supabaseSecretKey) {
        return json({ message: 'Supabase Edge Function не має потрібних секретів' }, 500);
    }

    const body = (await request.json().catch(() => {
        return {};
    })) as { storyId?: string; mode?: string };

    if (body.mode !== 'admin') {
        return json({ message: 'Недостатньо прав для видалення історії' }, 403);
    }

    if (!body.storyId) {
        return json({ message: 'Не передано ID історії' }, 400);
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
        return json({ message: imagesError.message }, 500);
    }

    const storagePaths = (images ?? [])
        .map((image) => {
            return image.storage_path as string | null;
        })
        .filter((path): path is string => {
            return Boolean(path);
        });

    if (storagePaths.length > 0) {
        const { error: storageError } = await supabase.storage.from(BUCKET).remove(storagePaths);

        if (storageError) {
            return json({ message: storageError.message }, 500);
        }
    }

    const { error: deleteError } = await supabase.from('user_stories').delete().eq('id', body.storyId);

    if (deleteError) {
        return json({ message: deleteError.message }, 500);
    }

    return json({ ok: true });
});
