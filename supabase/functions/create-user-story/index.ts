import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ALLOWED_YEARS = new Set(['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026']);
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE = 3 * 1024 * 1024;
const BUCKET = 'timeline-stories';

type CreatedImage = {
    id: string;
    storyId: string;
    publicUrl: string;
    storagePath: string;
    sortOrder: number;
    createdAt: string;
};

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

type TurnstileVerifyResult = {
    success?: boolean;
    hostname?: string;
    'error-codes'?: string[];
};

const verifyTurnstile = async (token: string) => {
    const secret = Deno.env.get('TURNSTILE_SECRET_KEY');

    if (!secret) {
        return {
            success: false,
            'error-codes': ['missing-secret'],
        };
    }

    const verifyForm = new FormData();
    verifyForm.append('secret', secret);
    verifyForm.append('response', token);

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: verifyForm,
    });

    return (await response.json()) as TurnstileVerifyResult;
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

    const formData = await request.formData();
    const year = String(formData.get('year') ?? '').trim();
    const authorName = String(formData.get('authorName') ?? '').trim();
    const authorRole = String(formData.get('authorRole') ?? '').trim();
    const storyText = String(formData.get('storyText') ?? '').trim();
    const turnstileToken = String(formData.get('turnstileToken') ?? '').trim();
    const images = formData.getAll('images').filter((item): item is File => {
        return item instanceof File && item.size > 0;
    });

    if (!ALLOWED_YEARS.has(year)) {
        return json({ message: 'Оберіть коректний рік' }, 400);
    }

    if (authorName.length < 2 || authorName.length > 80) {
        return json({ message: 'Імʼя має містити від 2 до 80 символів' }, 400);
    }

    if (authorRole.length > 120) {
        return json({ message: 'Посада має містити до 120 символів' }, 400);
    }

    if (storyText.length < 5 || storyText.length > 1500) {
        return json({ message: 'Історія має містити від 5 до 1500 символів' }, 400);
    }

    if (images.length === 0 || images.length > MAX_IMAGES) {
        return json({ message: `Додайте від 1 до ${MAX_IMAGES} фото` }, 400);
    }

    const invalidImage = images.find((image) => {
        return image.size > MAX_IMAGE_SIZE || !ALLOWED_TYPES.has(image.type);
    });

    if (invalidImage) {
        return json({ message: 'Фото мають бути JPG, PNG або WebP до 3 MB' }, 400);
    }

    const turnstileResult = await verifyTurnstile(turnstileToken);

    if (turnstileResult.success !== true) {
        const codes = turnstileResult['error-codes']?.join(', ') || 'unknown';

        return json(
            {
                message: `Перевірка Cloudflare Turnstile не пройдена. Код: ${codes}`,
                turnstile: {
                    errorCodes: turnstileResult['error-codes'] ?? [],
                    hostname: turnstileResult.hostname ?? null,
                },
            },
            403
        );
    }

    const supabase = createClient(supabaseUrl, supabaseSecretKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });

    const { data: story, error: storyError } = await supabase
        .from('user_stories')
        .insert({
            year,
            author_name: authorName,
            author_role: authorRole || null,
            story_text: storyText,
        })
        .select('id, year, author_name, author_role, story_text, created_at')
        .single();

    if (storyError || !story) {
        return json({ message: storyError?.message ?? 'Не вдалося створити історію' }, 500);
    }

    const uploadedImages: CreatedImage[] = [];

    for (const [index, image] of images.entries()) {
        const extension = image.type.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
        const path = `${year}/${story.id}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, image, {
            contentType: image.type,
            upsert: false,
        });

        if (uploadError) {
            return json({ message: uploadError.message }, 500);
        }

        const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
        const { data: imageRow, error: imageError } = await supabase
            .from('user_story_images')
            .insert({
                story_id: story.id,
                storage_bucket: BUCKET,
                storage_path: path,
                public_url: publicUrlData.publicUrl,
                sort_order: index,
            })
            .select('id, story_id, public_url, storage_path, sort_order, created_at')
            .single();

        if (imageError || !imageRow) {
            return json({ message: imageError?.message ?? 'Не вдалося зберегти фото' }, 500);
        }

        uploadedImages.push({
            id: imageRow.id,
            storyId: imageRow.story_id,
            publicUrl: imageRow.public_url,
            storagePath: imageRow.storage_path,
            sortOrder: imageRow.sort_order,
            createdAt: imageRow.created_at,
        });
    }

    return json({
        story: {
            id: story.id,
            year: story.year,
            authorName: story.author_name,
            authorRole: story.author_role,
            storyText: story.story_text,
            createdAt: story.created_at,
            images: uploadedImages,
        },
    });
});
