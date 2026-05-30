import type { User } from 'react-instagram-stories';
import type { Milestone } from '../../types';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { userStoriesByYearQueryOptions } from '@/services/userStories/queries';
import StoryBubble from './components/StoryBubble/StoryBubble';
import { BUBBLE_VISIBLE_COUNT, generateCollapsedLayout, generateExpandedLayout } from './bubbleLayout';
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
    const bubbleFieldRef = React.useRef<HTMLDivElement>(null);
    const isFirstHeightApply = React.useRef(true);

    const [isExpanded, setIsExpanded] = React.useState(false);
    const [viewedStoryIds, setViewedStoryIds] = React.useState<Set<string>>(() => {
        return new Set();
    });

    // Reset expanded state when year changes
    React.useEffect(() => {
        setIsExpanded(false);
        isFirstHeightApply.current = true;
    }, [milestone.year]);

    React.useEffect(() => {
        try {
            const stored = window.localStorage.getItem(getViewedStoriesStorageKey(milestone.year));
            const ids = stored ? (JSON.parse(stored) as string[]) : [];
            setViewedStoryIds(new Set(ids));
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
                                  type: 'image' as const,
                                  src: image.publicUrl,
                                  alt: story.authorName,
                              };
                          })
                        : [
                              {
                                  id: `${story.id}-text`,
                                  type: 'text' as const,
                                  text: story.storyText,
                                  backgroundColor: '#111827',
                                  textColor: '#FFFFFF',
                              },
                          ],
            };
        });
    }, [storiesQuery.data, viewedStoryIds]);

    const hasOverflow = storyUsers.length > BUBBLE_VISIBLE_COUNT;
    const overflowCount = storyUsers.length - BUBBLE_VISIBLE_COUNT;
    const displayedStoryUsers = isExpanded ? storyUsers : storyUsers.slice(0, BUBBLE_VISIBLE_COUNT);

    // Total slots: displayed stories + 1 overflow button slot (when applicable)
    const totalSlots = hasOverflow ? displayedStoryUsers.length + 1 : displayedStoryUsers.length;

    const layout = React.useMemo(() => {
        return isExpanded ? generateExpandedLayout(totalSlots) : generateCollapsedLayout(totalSlots);
    }, [isExpanded, totalSlots]);

    // Story bubbles = all positions except the last (which is overflow button)
    const storyPositions = hasOverflow ? layout.positions.slice(0, -1) : layout.positions;
    const overflowPos = hasOverflow ? layout.positions.at(-1) : null;

    // Apply container height. First apply: no transition (prevents mount animation).
    // Subsequent applies (expand/collapse): smooth CSS transition.
    React.useEffect(() => {
        const el = bubbleFieldRef.current;
        if (!el) return;

        if (isFirstHeightApply.current) {
            isFirstHeightApply.current = false;
            el.style.transition = 'none';
            el.style.height = `${layout.containerHeightRem}rem`;
            return;
        }

        el.style.transition = 'height 0.45s cubic-bezier(0.4, 0, 0.2, 1)';
        el.style.height = `${layout.containerHeightRem}rem`;
    }, [layout.containerHeightRem]);

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
                    // localStorage optional
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
            <div ref={bubbleFieldRef} className={s.timelineStoryBubbleField}>
                {displayedStoryUsers.map((user, index) => {
                    const pos = storyPositions[index];
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
                                onStoriesOpen(milestone.year, index);
                            }}
                        />
                    );
                })}

                {hasOverflow && overflowPos !== null && overflowPos !== undefined && (
                    <button
                        className={s.overflowBubble}
                        style={
                            {
                                left: `${overflowPos.x}%`,
                                top: `${overflowPos.y}%`,
                                width: `${overflowPos.size}rem`,
                                height: `${overflowPos.size}rem`,
                                '--bubble-size': `${overflowPos.size}rem`,
                            } as React.CSSProperties
                        }
                        type="button"
                        aria-label={isExpanded ? 'Показати менше' : `Показати ще ${overflowCount} учасників`}
                        onClick={() => {
                            return setIsExpanded((prev) => {
                                return !prev;
                            });
                        }}
                    >
                        <span aria-hidden="true">{isExpanded ? '↑' : `+${overflowCount}`}</span>
                    </button>
                )}

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
        </aside>
    );
};

export default TimelineYearStories;
