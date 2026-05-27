import React from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import {
    createUserStoryMutationOptions,
    deleteUserStoryMutationOptions,
    userStoriesByYearQueryOptions,
} from '@/services/userStories/queries';
import { userStoriesKeys } from '@/services/userStories/queryKeys';
import { Button } from '@/components/Button/Button';
import s from '../../style.module.css';

import 'react-photo-view/dist/react-photo-view.css';

type StoriesModalProps = {
    year: string | null;
    isOpen: boolean;
    onClose: () => void;
};

type StoryFormValues = {
    authorName: string;
    authorRole: string;
    storyText: string;
};

type TurnstileApi = {
    render: (
        _container: HTMLElement,
        _options: {
            sitekey: string;
            callback: (_token: string) => void;
            'expired-callback': () => void;
            'error-callback': () => void;
        }
    ) => string;
    reset: (_widgetId?: string) => void;
    remove: (_widgetId: string) => void;
};

declare global {
    interface Window {
        turnstile?: TurnstileApi;
    }
}

const MAX_FILES = 3;
const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

let turnstileScriptPromise: Promise<void> | null = null;

const loadTurnstileScript = () => {
    if (window.turnstile) {
        return Promise.resolve();
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[data-turnstile-script]');

    if (existingScript) {
        return (
            turnstileScriptPromise ??
            new Promise<void>((resolve, reject) => {
                existingScript.addEventListener(
                    'load',
                    () => {
                        resolve();
                    },
                    { once: true }
                );
                existingScript.addEventListener(
                    'error',
                    () => {
                        reject(new Error('Turnstile script failed to load'));
                    },
                    { once: true }
                );
            })
        );
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.turnstileScript = 'true';

    turnstileScriptPromise = new Promise<void>((resolve, reject) => {
        script.addEventListener(
            'load',
            () => {
                resolve();
            },
            { once: true }
        );
        script.addEventListener(
            'error',
            () => {
                reject(new Error('Turnstile script failed to load'));
            },
            { once: true }
        );
    });

    document.head.append(script);

    return turnstileScriptPromise;
};

const getFirstErrorMessage = (errors: Partial<Record<keyof StoryFormValues, { message?: string }>>) => {
    return errors.authorName?.message ?? errors.storyText?.message ?? errors.authorRole?.message ?? '';
};

const restoreDocumentScroll = () => {
    const html = document.documentElement;
    const body = document.body;
    const hasScrollLock =
        html.hasAttribute('data-base-ui-scroll-locked') ||
        html.style.overflowY === 'hidden' ||
        html.style.overflowX === 'hidden' ||
        body.style.overflow === 'hidden' ||
        body.style.overflowY === 'hidden' ||
        body.style.overflowX === 'hidden';

    if (!hasScrollLock || document.querySelector('[role="dialog"][data-open]')) {
        return;
    }

    html.removeAttribute('data-base-ui-scroll-locked');
    html.style.overflowY = '';
    html.style.overflowX = '';
    html.style.scrollbarGutter = '';
    html.style.scrollBehavior = '';

    body.style.position = '';
    body.style.height = '';
    body.style.width = '';
    body.style.boxSizing = '';
    body.style.overflow = '';
    body.style.overflowY = '';
    body.style.overflowX = '';
    body.style.scrollBehavior = '';
};

const StoriesModal: React.FC<StoriesModalProps> = ({ year, isOpen, onClose }) => {
    const queryClient = useQueryClient();
    const turnstileRef = React.useRef<HTMLDivElement | null>(null);
    const widgetIdRef = React.useRef<string | null>(null);
    const formErrorRef = React.useRef<HTMLParagraphElement | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);
    const isPhotoViewerOpenRef = React.useRef(false);
    const [images, setImages] = React.useState<File[]>([]);
    const [turnstileToken, setTurnstileToken] = React.useState('');
    const [formError, setFormError] = React.useState('');
    const [deleteError, setDeleteError] = React.useState('');
    const [deletingStoryId, setDeletingStoryId] = React.useState<string | null>(null);
    const [confirmingStoryId, setConfirmingStoryId] = React.useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const isAdminMode = React.useMemo(() => {
        return new URLSearchParams(window.location.search).get('mode') === 'admin';
    }, []);

    const {
        formState: { errors },
        handleSubmit,
        register,
        reset,
    } = useForm<StoryFormValues>({
        defaultValues: {
            authorName: '',
            authorRole: '',
            storyText: '',
        },
        mode: 'onSubmit',
    });

    const storiesQuery = useQuery(userStoriesByYearQueryOptions(year ?? ''));
    const { isPending, mutateAsync } = useMutation(createUserStoryMutationOptions());
    const { mutateAsync: deleteUserStoryAsync } = useMutation(deleteUserStoryMutationOptions());
    const visibleFormError = formError || getFirstErrorMessage(errors);

    React.useEffect(() => {
        if (!isOpen || !isFormOpen || widgetIdRef.current) {
            return;
        }

        let isMounted = true;

        const renderWidget = async () => {
            const sitekey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

            if (!sitekey) {
                setFormError('Не налаштовано ключ Cloudflare Turnstile.');
                return;
            }

            try {
                await loadTurnstileScript();
            } catch {
                if (isMounted) {
                    setFormError(
                        'Не вдалося завантажити Cloudflare Turnstile. Перевірте зʼєднання та спробуйте ще раз.'
                    );
                }

                return;
            }

            if (!isMounted || !window.turnstile || !turnstileRef.current || widgetIdRef.current) {
                return;
            }

            turnstileRef.current.innerHTML = '';
            widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
                sitekey,
                callback(token) {
                    setTurnstileToken(token);
                    setFormError('');
                },
                'expired-callback'() {
                    setTurnstileToken('');
                },
                'error-callback'() {
                    setTurnstileToken('');
                    setFormError('Не вдалося пройти перевірку Turnstile. Спробуйте ще раз.');
                },
            });
        };

        void renderWidget();

        return () => {
            isMounted = false;

            if (widgetIdRef.current && window.turnstile) {
                window.turnstile.remove(widgetIdRef.current);
            }

            widgetIdRef.current = null;
        };
    }, [isFormOpen, isOpen]);

    const showFormError = React.useCallback((message: string) => {
        setFormError(message);
        window.requestAnimationFrame(() => {
            formErrorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }, []);

    const resetForm = React.useCallback(() => {
        reset();
        setImages([]);
        setTurnstileToken('');
        setFormError('');

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        if (widgetIdRef.current && window.turnstile) {
            window.turnstile.reset(widgetIdRef.current);
        }
    }, [reset]);

    const onFormOpenChange = React.useCallback(
        (nextOpen: boolean) => {
            setIsFormOpen(nextOpen);

            if (!nextOpen) {
                resetForm();
            }
        },
        [resetForm]
    );

    React.useEffect(() => {
        if (!isOpen) {
            onFormOpenChange(false);
        }
    }, [isOpen, onFormOpenChange]);

    React.useEffect(() => {
        if (isOpen || isFormOpen) {
            return undefined;
        }

        const timeoutId = window.setTimeout(restoreDocumentScroll, 400);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [isFormOpen, isOpen]);

    const onFilesChange = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFiles = Array.from(event.target.files ?? []);
            const invalidFile = selectedFiles.find((file) => {
                return file.size > MAX_FILE_SIZE || !ALLOWED_FILE_TYPES.includes(file.type);
            });

            if (selectedFiles.length > MAX_FILES) {
                showFormError(`Можна додати максимум ${MAX_FILES} фото.`);
                event.target.value = '';
                return;
            }

            if (invalidFile) {
                showFormError('Фото мають бути JPG, PNG або WebP до 3 MB.');
                event.target.value = '';
                return;
            }

            setFormError('');
            setImages(selectedFiles);
        },
        [showFormError]
    );

    const onSubmit: SubmitHandler<StoryFormValues> = React.useCallback(
        async (values) => {
            if (!year) {
                return;
            }

            if (images.length === 0) {
                showFormError('Додайте хоча б одне фото.');
                return;
            }

            if (!turnstileToken) {
                showFormError('Підтвердьте, що ви не робот. Якщо віджет ще не зʼявився, зачекайте кілька секунд.');
                return;
            }

            try {
                setFormError('');
                await mutateAsync({
                    year,
                    authorName: values.authorName.trim(),
                    authorRole: values.authorRole.trim(),
                    storyText: values.storyText.trim(),
                    turnstileToken,
                    images,
                });
                await queryClient.invalidateQueries({ queryKey: userStoriesKeys.byYear(year) });
                resetForm();
                setIsFormOpen(false);
            } catch (error) {
                showFormError(error instanceof Error ? error.message : 'Не вдалося зберегти історію.');

                if (widgetIdRef.current && window.turnstile) {
                    window.turnstile.reset(widgetIdRef.current);
                    setTurnstileToken('');
                }
            }
        },
        [images, mutateAsync, queryClient, resetForm, showFormError, turnstileToken, year]
    );

    const onInvalidSubmit: SubmitErrorHandler<StoryFormValues> = React.useCallback(
        (nextErrors) => {
            showFormError(getFirstErrorMessage(nextErrors) || 'Перевірте заповнення форми.');
        },
        [showFormError]
    );

    const submitForm = React.useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            void handleSubmit(onSubmit, onInvalidSubmit)(event);
        },
        [handleSubmit, onInvalidSubmit, onSubmit]
    );

    const onDeleteStory = React.useCallback(
        async (storyId: string) => {
            if (!year) {
                return;
            }

            if (confirmingStoryId !== storyId) {
                setConfirmingStoryId(storyId);
                return;
            }

            try {
                setDeleteError('');
                setDeletingStoryId(storyId);
                await deleteUserStoryAsync({
                    storyId,
                    mode: 'admin',
                });
                await queryClient.invalidateQueries({ queryKey: userStoriesKeys.byYear(year) });
                setConfirmingStoryId(null);
            } catch (error) {
                setDeleteError(error instanceof Error ? error.message : 'Не вдалося видалити історію.');
            } finally {
                setDeletingStoryId(null);
            }
        },
        [confirmingStoryId, deleteUserStoryAsync, queryClient, year]
    );

    const closeModal = React.useCallback(() => {
        onFormOpenChange(false);
        onClose();
    }, [onClose, onFormOpenChange]);

    const onModalOpenChange = React.useCallback<NonNullable<React.ComponentProps<typeof Dialog.Root>['onOpenChange']>>(
        (nextOpen, eventDetails) => {
            if (!nextOpen && eventDetails.reason === 'escape-key' && isPhotoViewerOpenRef.current) {
                eventDetails.allowPropagation();
                eventDetails.cancel();
                return;
            }

            if (!nextOpen) {
                closeModal();
            }
        },
        [closeModal]
    );

    const onPhotoViewerVisibleChange = React.useCallback((visible: boolean) => {
        isPhotoViewerOpenRef.current = visible;
    }, []);

    return (
        <Dialog.Root open={isOpen && Boolean(year)} onOpenChange={onModalOpenChange}>
            <Dialog.Portal>
                <Dialog.Backdrop className={s.modalOverlay} />
                <Dialog.Viewport className={s.modalViewport}>
                    <Dialog.Popup className={s.storiesModal}>
                        <header className={s.modalHeader}>
                            <div>
                                <span className={s.sectionKicker}>{year}</span>
                                <Dialog.Title id="stories-modal-title" className={s.modalTitle}>
                                    Історії команди HomeNet
                                </Dialog.Title>
                            </div>
                            <Dialog.Close className={s.modalClose}>Закрити</Dialog.Close>
                        </header>

                        <Dialog.Root open={isFormOpen} modal="trap-focus" onOpenChange={onFormOpenChange}>
                            <Dialog.Trigger className={s.formDialogTrigger}>Додати історію</Dialog.Trigger>

                            <div className={s.modalGrid}>
                                <section className={s.storiesList} aria-label={`Історії за ${year} рік`}>
                                    <div className={s.storiesListInner}>
                                        {storiesQuery.isLoading ? (
                                            <p className={s.emptyStories}>Завантажуємо історії...</p>
                                        ) : null}
                                        {storiesQuery.isError ? (
                                            <p className={s.formError}>
                                                Не вдалося завантажити історії. Спробуйте пізніше.
                                            </p>
                                        ) : null}
                                        {deleteError ? (
                                            <p className={s.formError} aria-live="polite">
                                                {deleteError}
                                            </p>
                                        ) : null}
                                        {storiesQuery.data?.length === 0 ? (
                                            <p className={s.emptyStories}>
                                                Ще немає історій за цей рік. Додайте перший спогад команди.
                                            </p>
                                        ) : null}

                                        <PhotoProvider onVisibleChange={onPhotoViewerVisibleChange}>
                                            {storiesQuery.data?.map((story) => {
                                                let deleteButtonLabel = 'Видалити';

                                                if (deletingStoryId === story.id) {
                                                    deleteButtonLabel = 'Видаляємо...';
                                                } else if (confirmingStoryId === story.id) {
                                                    deleteButtonLabel = 'Підтвердити';
                                                }

                                                return (
                                                    <article key={story.id} className={s.storyCard}>
                                                        <div className={s.storyMetaRow}>
                                                            <div className={s.storyAuthor}>
                                                                <strong>{story.authorName}</strong>
                                                                {story.authorRole ? (
                                                                    <span>{story.authorRole}</span>
                                                                ) : null}
                                                            </div>

                                                            {isAdminMode ? (
                                                                <div className={s.storyActions}>
                                                                    <Button
                                                                        className={s.deleteStoryButton}
                                                                        variant="ghost"
                                                                        size="small"
                                                                        disabled={deletingStoryId === story.id}
                                                                        onClick={() => {
                                                                            void onDeleteStory(story.id);
                                                                        }}
                                                                    >
                                                                        {deleteButtonLabel}
                                                                    </Button>

                                                                    {confirmingStoryId === story.id ? (
                                                                        <button
                                                                            className={s.cancelDeleteButton}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setConfirmingStoryId(null);
                                                                            }}
                                                                        >
                                                                            Скасувати
                                                                        </button>
                                                                    ) : null}
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                        <p>{story.storyText}</p>

                                                        {story.images.length > 0 ? (
                                                            <ul className={s.storyGallery} aria-label="Фото до історії">
                                                                {story.images.map((image, imageIndex) => {
                                                                    return (
                                                                        <li
                                                                            key={image.id}
                                                                            className={s.storyGalleryItem}
                                                                        >
                                                                            <PhotoView src={image.publicUrl}>
                                                                                <button
                                                                                    className={s.storyImageThumb}
                                                                                    type="button"
                                                                                    aria-label={`Відкрити фото ${imageIndex + 1} до історії ${story.authorName}`}
                                                                                >
                                                                                    <img src={image.publicUrl} alt="" />
                                                                                </button>
                                                                            </PhotoView>
                                                                        </li>
                                                                    );
                                                                })}
                                                            </ul>
                                                        ) : null}
                                                    </article>
                                                );
                                            })}
                                        </PhotoProvider>
                                    </div>
                                </section>
                            </div>

                            <Dialog.Portal>
                                <Dialog.Backdrop className={s.formDialogScrim} forceRender />
                                <Dialog.Viewport className={s.formDialogViewport}>
                                    <Dialog.Popup className={s.formDialog}>
                                        <form className={s.storyForm} noValidate onSubmit={submitForm}>
                                            <div className={s.formHeader}>
                                                <div>
                                                    <span className={s.sectionKicker}>{year}</span>
                                                    <Dialog.Title className={s.formTitle}>
                                                        Додати свою подію
                                                    </Dialog.Title>
                                                    <Dialog.Description className={s.formDescription}>
                                                        Розкажіть коротку історію та додайте до 3 фото.
                                                    </Dialog.Description>
                                                </div>
                                                <Dialog.Close className={s.formClose}>Закрити</Dialog.Close>
                                            </div>

                                            <div className={s.formBody}>
                                                {visibleFormError ? (
                                                    <p ref={formErrorRef} className={s.formError} aria-live="polite">
                                                        {visibleFormError}
                                                    </p>
                                                ) : null}

                                                <label className={s.formField}>
                                                    <span>Імʼя та прізвище</span>
                                                    <input
                                                        {...register('authorName', {
                                                            required: 'Вкажіть імʼя та прізвище.',
                                                            minLength: {
                                                                value: 2,
                                                                message: 'Імʼя має містити щонайменше 2 символи.',
                                                            },
                                                            maxLength: {
                                                                value: 80,
                                                                message: 'Імʼя має містити до 80 символів.',
                                                            },
                                                        })}
                                                    />
                                                </label>

                                                <label className={s.formField}>
                                                    <span>Посада або роль</span>
                                                    <input
                                                        {...register('authorRole', {
                                                            maxLength: {
                                                                value: 120,
                                                                message: 'Посада має містити до 120 символів.',
                                                            },
                                                        })}
                                                    />
                                                </label>

                                                <label className={s.formField}>
                                                    <span>Історія</span>
                                                    <textarea
                                                        {...register('storyText', {
                                                            required: 'Додайте текст історії.',
                                                            minLength: {
                                                                value: 5,
                                                                message: 'Історія має містити щонайменше 5 символів.',
                                                            },
                                                            maxLength: {
                                                                value: 1500,
                                                                message: 'Історія має містити до 1500 символів.',
                                                            },
                                                        })}
                                                    />
                                                </label>

                                                <label className={s.fileField}>
                                                    <span>Фото</span>
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/webp"
                                                        multiple
                                                        onChange={onFilesChange}
                                                    />
                                                    <small>До 3 фото, JPG/PNG/WebP, максимум 3 MB кожне.</small>
                                                </label>

                                                {images.length > 0 ? (
                                                    <ul className={s.fileList}>
                                                        {images.map((image) => {
                                                            return (
                                                                <li key={`${image.name}-${image.size}`}>
                                                                    {image.name}
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                ) : null}

                                                <div ref={turnstileRef} className={s.turnstileBox} />
                                            </div>

                                            <div className={s.formFooter}>
                                                <Button className={s.primaryCta} type="submit" disabled={isPending}>
                                                    {isPending ? 'Зберігаємо...' : 'Опублікувати історію'}
                                                </Button>
                                            </div>
                                        </form>
                                    </Dialog.Popup>
                                </Dialog.Viewport>
                            </Dialog.Portal>
                        </Dialog.Root>
                    </Dialog.Popup>
                </Dialog.Viewport>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default StoriesModal;
