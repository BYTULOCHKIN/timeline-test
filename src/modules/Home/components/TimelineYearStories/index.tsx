import type { User } from 'react-instagram-stories';
import type { Milestone } from '../../types';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { AvatarList } from 'react-instagram-stories';
import { userStoriesByYearQueryOptions } from '@/services/userStories/queries';
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
            const fallbackImage = '/timeline-test/images/video_bg.png';

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

    const markStoryViewed = React.useCallback(
        (storyId: string) => {
            setViewedStoryIds((currentStoryIds) => {
                const nextStoryIds = new Set(currentStoryIds);
                nextStoryIds.add(storyId);

                try {
                    window.localStorage.setItem(
                        getViewedStoriesStorageKey(milestone.year),
                        JSON.stringify(Array.from(nextStoryIds))
                    );
                } catch {
                    // localStorage is optional; visual state still updates for this session.
                }

                return nextStoryIds;
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
                {storyUsers.length > 0 ? (
                    <AvatarList
                        users={storyUsers}
                        onAvatarClick={(userIndex) => {
                            const storyUser = storyUsers[userIndex];

                            if (storyUser) {
                                markStoryViewed(storyUser.id);
                            }

                            onStoriesOpen(milestone.year, userIndex);
                        }}
                        classNames={{
                            root: s.timelineStoryAvatarList,
                            avatar: {
                                root: s.timelineStoryAvatar,
                                ring: s.timelineStoryAvatarRing,
                                imageWrapper: s.timelineStoryAvatarImageWrapper,
                                image: s.timelineStoryAvatarImage,
                                placeholder: s.timelineStoryAvatarPlaceholder,
                                username: s.timelineStoryAvatarUsername,
                            },
                        }}
                    />
                ) : null}

                <button
                    className={clsx(s.emptyStoryBubble, storyUsers.length > 0 && s.emptyStoryBubbleHidden)}
                    type="button"
                    disabled={storiesQuery.isLoading}
                    onClick={() => {
                        onStoriesOpen(milestone.year);
                    }}
                >
                    {storiesQuery.isLoading ? '...' : milestone.year}
                </button>

                <button
                    className={s.addStoryBubble}
                    type="button"
                    aria-label={`Додати історію за ${milestone.year} рік`}
                    onClick={() => {
                        onStoryAdd(milestone.year);
                    }}
                >
                    <span aria-hidden="true">+</span>
                </button>
            </div>
        </aside>
    );
};

export default TimelineYearStories;
