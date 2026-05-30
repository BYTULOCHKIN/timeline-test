import type { User } from 'react-instagram-stories';
import type { Milestone } from '../../types';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { userStoriesByYearQueryOptions } from '@/services/userStories/queries';
import StoryBubble from './components/StoryBubble/StoryBubble';
import { generateBubblePositions } from './bubbleLayout';
import s from './styles.module.css';

type TimelineYearStoriesProps = {
    milestone: Milestone;
    isActive: boolean;
    isMirrored?: boolean;
    onStoriesOpen: (_year: string, _userIndex?: number) => void;
    onStoryAdd: (_year: string) => void;
};

const getViewedStoriesStorageKey = (year: string) => {
    return `homenet-viewed-stories:${year}`;
};

const TimelineYearStories: React.FC<TimelineYearStoriesProps> = ({
    milestone,
    isActive,
    isMirrored,
    onStoriesOpen,
    onStoryAdd,
}) => {
    const storiesQuery = useQuery(userStoriesByYearQueryOptions(milestone.year));

    const [viewedStoryIds, setViewedStoryIds] = React.useState<Set<string>>(() => {
        return new Set();
    });

    React.useEffect(() => {
        try {
            const storedValue = window.localStorage.getItem(getViewedStoriesStorageKey(milestone.year));
            const storyIds = storedValue ? (JSON.parse(storedValue) as string[]) : [];
            setViewedStoryIds(new Set(storyIds));
        } catch {
            setViewedStoryIds(new Set());
        }
    }, [milestone.year]);

    const storyUsers = React.useMemo<User[]>(() => {
        return (storiesQuery.data ?? []).map((story) => {
            const fallbackImage = '/images/video_bg.png';

            return {
                id: story.id,
                username: story.authorName,
                avatarUrl: story.images[0]?.publicUrl ?? fallbackImage,
                hasUnreadStories: !viewedStoryIds.has(story.id),
                stories:
                    story.images.length > 0
                        ? story.images.map((image) => {
                              return {
                                  id: image.id,
                                  type: 'image',
                                  src: image.publicUrl,
                                  alt: story.authorName,
                              };
                          })
                        : [
                              {
                                  id: `${story.id}-text`,
                                  type: 'text',
                                  text: story.storyText,
                                  backgroundColor: '#111827',
                                  textColor: '#FFFFFF',
                              },
                          ],
            };
        });
    }, [storiesQuery.data, viewedStoryIds]);

    const bubblePositions = React.useMemo(() => {
        return generateBubblePositions(storyUsers.length);
    }, [storyUsers.length]);

    const markStoryViewed = React.useCallback(
        (storyId: string) => {
            setViewedStoryIds((current) => {
                const next = new Set(current);
                next.add(storyId);

                try {
                    window.localStorage.setItem(
                        getViewedStoriesStorageKey(milestone.year),
                        JSON.stringify(Array.from(next))
                    );
                } catch {
                    // localStorage опціональний
                }

                return next;
            });
        },
        [milestone.year]
    );

    return (
        <aside
            className={clsx(
                s.timelineStories,
                isMirrored && s.timelineStoriesMirrored,
                isActive && s.timelineStoriesActive
            )}
            aria-label={`Історії команди за ${milestone.year} рік`}
        >
            <div className={s.timelineStoryBubbleField}>
                {storyUsers.map((user, index) => {
                    const pos = bubblePositions[index];
                    if (!pos) return null;

                    return (
                        <StoryBubble
                            key={user.id}
                            avatarUrl={user.avatarUrl}
                            username={user.username}
                            hasUnreadStories={user.hasUnreadStories ?? false}
                            position={pos}
                            onClick={() => {
                                markStoryViewed(user.id);
                                onStoriesOpen(milestone.year, index); // ← як було раніше
                            }}
                        />
                    );
                })}

                <button
                    className={clsx(s.emptyStoryBubble, storyUsers.length > 0 && s.emptyStoryBubbleHidden)}
                    type="button"
                    disabled={storiesQuery.isLoading}
                    onClick={() => {
                        return onStoriesOpen(milestone.year);
                    }}
                >
                    {storiesQuery.isLoading ? '...' : milestone.year}
                </button>

                <button
                    className={s.addStoryBubble}
                    type="button"
                    aria-label={`Додати історію за ${milestone.year} рік`}
                    onClick={() => {
                        return onStoryAdd(milestone.year);
                    }}
                >
                    <span aria-hidden="true">+</span>
                </button>
            </div>
            {/* StoryViewer живе в батьківському компоненті — тут його немає */}
        </aside>
    );
};

export default TimelineYearStories;
