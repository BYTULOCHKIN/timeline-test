import type { StoryItemControls, User } from 'react-instagram-stories';
import type { UserStory } from '@/services/userStories/types';
import React from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form';
import { StoryViewer } from 'react-instagram-stories';
import {
    createUserStoryMutationOptions,
    deleteUserStoryMutationOptions,
    userStoriesByYearQueryOptions,
} from '@/services/userStories/queries';
import { userStoriesKeys } from '@/services/userStories/queryKeys';
import { Button } from '@/components/Button/Button';
import s from '../../style.module.css';

import 'react-instagram-stories/styles.css';

type StoriesModalProps = {
    year: string | null;
    isOpen: boolean;
    shouldOpenForm: boolean;
    initialUserIndex: number;
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

const preloadStoryImages = (stories: UserStory[]) => {
    stories.forEach((story) => {
        story.images.forEach((storyImage) => {
            const image = new Image();
            image.decoding = 'async';
            image.src = storyImage.publicUrl;
        });
    });
};

const getStoryDeleteLabel = (storyId: string, deletingStoryId: string | null, confirmingStoryId: string | null) => {
    if (deletingStoryId === storyId) {
        return 'Видаляємо...';
    }

    if (confirmingStoryId === storyId) {
        return 'Підтвердити';
    }

    return 'Видалити';
};

const createStoryContentComponent = ({
    story,
    imageUrl,
    imageIndex,
    imageCount,
    isAdminMode,
    deletingStoryId,
    confirmingStoryId,
    deleteError,
    onDeleteStory: handleDeleteStory,
    onCancelDelete,
}: {
    story: UserStory;
    imageUrl: string;
    imageIndex: number;
    imageCount: number;
    isAdminMode: boolean;
    deletingStoryId: string | null;
    confirmingStoryId: string | null;
    deleteError: string;
    onDeleteStory: (_storyId: string) => void;
    onCancelDelete: () => void;
}) => {
    const StoryContent: React.FC<StoryItemControls> = ({ pause, resume }) => {
        'use no memo';

        const isConfirmingDelete = confirmingStoryId === story.id;
        const isDeletingStory = deletingStoryId === story.id;

        React.useEffect(() => {
            if (!isAdminMode || (!isConfirmingDelete && !isDeletingStory)) {
                return undefined;
            }

            pause();

            return () => {
                resume();
            };
        }, [isConfirmingDelete, isDeletingStory, pause, resume]);

        const stopViewerInteraction = (event: React.SyntheticEvent) => {
            event.stopPropagation();
        };

        return (
            <div
                className={s.instagramStoryContent}
                onDragStart={(event) => {
                    event.preventDefault();
                }}
            >
                <img className={s.instagramStoryImage} src={imageUrl} alt="" draggable={false} />

                <div className={s.instagramStoryScrim} aria-hidden="true" />

                <div className={s.instagramStoryCaption}>
                    <div className={s.instagramStoryMeta}>
                        <div>
                            <strong>{story.authorName}</strong>
                            {story.authorRole ? <span>{story.authorRole}</span> : null}
                        </div>

                        {imageCount > 1 ? (
                            <span>
                                Фото {imageIndex + 1}/{imageCount}
                            </span>
                        ) : null}
                    </div>

                    <p>{story.storyText}</p>

                    {deleteError ? (
                        <p className={s.instagramStoryError} aria-live="polite">
                            {deleteError}
                        </p>
                    ) : null}

                    {isAdminMode ? (
                        <div className={s.storyActions}>
                            <Button
                                className={s.deleteStoryButton}
                                type="button"
                                variant="ghost"
                                size="small"
                                disabled={isDeletingStory}
                                onPointerDown={stopViewerInteraction}
                                onPointerUp={stopViewerInteraction}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleDeleteStory(story.id);
                                }}
                            >
                                {getStoryDeleteLabel(story.id, deletingStoryId, confirmingStoryId)}
                            </Button>

                            {confirmingStoryId === story.id ? (
                                <button
                                    className={s.cancelDeleteButton}
                                    type="button"
                                    onPointerDown={stopViewerInteraction}
                                    onPointerUp={stopViewerInteraction}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onCancelDelete();
                                    }}
                                >
                                    Скасувати
                                </button>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </div>
        );
    };

    return StoryContent;
};

const StoriesModal: React.FC<StoriesModalProps> = ({ year, isOpen, shouldOpenForm, initialUserIndex, onClose }) => {
    const queryClient = useQueryClient();
    const turnstileRef = React.useRef<HTMLDivElement | null>(null);
    const widgetIdRef = React.useRef<string | null>(null);
    const formErrorRef = React.useRef<HTMLParagraphElement | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);
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

                if (shouldOpenForm && isOpen) {
                    onClose();
                }
            }
        },
        [isOpen, onClose, resetForm, shouldOpenForm]
    );

    React.useEffect(() => {
        if (!isOpen) {
            setIsFormOpen(false);
            resetForm();
        }
    }, [isOpen, resetForm]);

    React.useEffect(() => {
        if (isOpen && shouldOpenForm) {
            setIsFormOpen(true);
        }
    }, [isOpen, shouldOpenForm, year]);

    React.useEffect(() => {
        setConfirmingStoryId(null);
        setDeleteError('');
    }, [year]);

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
                onClose();
            } catch (error) {
                showFormError(error instanceof Error ? error.message : 'Не вдалося зберегти історію.');

                if (widgetIdRef.current && window.turnstile) {
                    window.turnstile.reset(widgetIdRef.current);
                    setTurnstileToken('');
                }
            }
        },
        [images, mutateAsync, onClose, queryClient, resetForm, showFormError, turnstileToken, year]
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

    const storyUsers = React.useMemo<User[]>(() => {
        return (storiesQuery.data ?? []).map((story) => {
            const fallbackImage = '/images/video_bg.png';
            const avatarUrl = story.images[0]?.publicUrl ?? fallbackImage;

            return {
                id: story.id,
                username: story.authorName,
                avatarUrl,
                hasUnreadStories: true,
                stories:
                    story.images.length > 0
                        ? story.images.map((image, imageIndex) => {
                              return {
                                  id: image.id,
                                  type: 'custom_component',
                                  duration: 7000,
                                  component: createStoryContentComponent({
                                      story,
                                      imageUrl: image.publicUrl,
                                      imageIndex,
                                      imageCount: story.images.length,
                                      isAdminMode,
                                      deletingStoryId,
                                      confirmingStoryId,
                                      deleteError,
                                      onDeleteStory,
                                      onCancelDelete() {
                                          setConfirmingStoryId(null);
                                      },
                                  }),
                              };
                          })
                        : [
                              {
                                  id: `${story.id}-text`,
                                  type: 'custom_component',
                                  duration: 7000,
                                  component: createStoryContentComponent({
                                      story,
                                      imageUrl: fallbackImage,
                                      imageIndex: 0,
                                      imageCount: 0,
                                      isAdminMode,
                                      deletingStoryId,
                                      confirmingStoryId,
                                      deleteError,
                                      onDeleteStory,
                                      onCancelDelete() {
                                          setConfirmingStoryId(null);
                                      },
                                  }),
                              },
                          ],
            };
        });
    }, [confirmingStoryId, deleteError, deletingStoryId, isAdminMode, onDeleteStory, storiesQuery.data]);

    const isViewerOpen = isOpen && Boolean(year) && !shouldOpenForm && storyUsers.length > 0;
    const safeInitialUserIndex = Math.min(initialUserIndex, Math.max(storyUsers.length - 1, 0));
    const isEmptyStateOpen =
        isOpen && Boolean(year) && !shouldOpenForm && !storiesQuery.isLoading && storyUsers.length === 0;

    React.useEffect(() => {
        if (!isViewerOpen || !storiesQuery.data) {
            return;
        }

        preloadStoryImages(storiesQuery.data);
    }, [isViewerOpen, storiesQuery.data]);

    React.useEffect(() => {
        if (!isViewerOpen) {
            return undefined;
        }

        const closeFromViewerChrome = (event: Event) => {
            const target = event.target;

            if (!(target instanceof Element)) {
                return;
            }

            if (!target.closest('.story-viewer-close, .story-viewer-overlay')) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            onClose();
        };

        document.addEventListener('pointerdown', closeFromViewerChrome, true);
        document.addEventListener('click', closeFromViewerChrome, true);

        return () => {
            document.removeEventListener('pointerdown', closeFromViewerChrome, true);
            document.removeEventListener('click', closeFromViewerChrome, true);
        };
    }, [isViewerOpen, onClose]);

    return (
        <>
            <StoryViewer
                users={storyUsers}
                isOpen={isViewerOpen}
                initialUserIndex={safeInitialUserIndex}
                initialStoryIndex={0}
                onClose={onClose}
                classNames={{
                    root: s.instagramViewerRoot,
                    overlay: s.instagramViewerOverlay,
                    content: s.instagramViewerContent,
                    header: s.instagramViewerHeader,
                    closeButton: s.instagramViewerClose,
                    items: s.instagramViewerItems,
                    storyItem: {
                        root: s.instagramViewerStoryItem,
                    },
                    progressBars: {
                        root: s.instagramProgressRoot,
                        bar: {
                            fill: s.instagramProgressFill,
                        },
                    },
                }}
            />

            <Dialog.Root
                open={isEmptyStateOpen}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        onClose();
                    }
                }}
            >
                <Dialog.Portal>
                    <Dialog.Backdrop className={s.modalOverlay} />
                    <Dialog.Viewport className={s.modalViewport}>
                        <Dialog.Popup className={s.emptyStoriesModal}>
                            <header className={s.modalHeader}>
                                <div>
                                    <span className={s.sectionKicker}>{year}</span>
                                    <Dialog.Title className={s.modalTitle}>Історії команди HomeNet</Dialog.Title>
                                </div>
                                <Dialog.Close className={s.modalClose}>Закрити</Dialog.Close>
                            </header>

                            <div className={s.emptyStoriesBody}>
                                {storiesQuery.isError ? (
                                    <p className={s.formError}>Не вдалося завантажити історії. Спробуйте пізніше.</p>
                                ) : (
                                    <p className={s.emptyStories}>
                                        Ще немає історій за цей рік. Додайте перший спогад команди.
                                    </p>
                                )}

                                <Button
                                    className={s.primaryCta}
                                    type="button"
                                    onClick={() => {
                                        setIsFormOpen(true);
                                    }}
                                >
                                    Додати історію
                                </Button>
                            </div>
                        </Dialog.Popup>
                    </Dialog.Viewport>
                </Dialog.Portal>
            </Dialog.Root>

            <Dialog.Root open={Boolean(year) && isFormOpen} modal="trap-focus" onOpenChange={onFormOpenChange}>
                <Dialog.Portal>
                    <Dialog.Backdrop className={s.formDialogScrim} forceRender />
                    <Dialog.Viewport className={s.formDialogViewport}>
                        <Dialog.Popup className={s.formDialog}>
                            <form className={s.storyForm} noValidate onSubmit={submitForm}>
                                <div className={s.formHeader}>
                                    <div>
                                        <span className={s.sectionKicker}>{year}</span>
                                        <Dialog.Title className={s.formTitle}>Додати свою подію</Dialog.Title>
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
                                                    value: 4000,
                                                    message: 'Історія має містити до 4000 символів.',
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
                                                return <li key={`${image.name}-${image.size}`}>{image.name}</li>;
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
        </>
    );
};

export default StoriesModal;
