import type { AvatarClassNames } from 'react-instagram-stories';
import React from 'react';
import clsx from 'clsx';
import { BubblePosition } from '../../bubbleLayout';
import s from '../../styles.module.css';

type StoryBubbleProps = {
    avatarUrl: string;
    username: string;
    hasUnreadStories: boolean;
    position: BubblePosition;
    classNames?: AvatarClassNames;
    onClick: () => void;
};

/**
 * Реплікує DOM-структуру Avatar з react-instagram-stories
 * (ті самі класи → той самий CSS працює без змін),
 * але з bubble-позиціонуванням через inline style.
 */
const StoryBubble: React.FC<StoryBubbleProps> = ({
    avatarUrl,
    username,
    hasUnreadStories,
    position,
    classNames,
    onClick,
}) => {
    const [imageLoaded, setImageLoaded] = React.useState(false);
    const [imageError, setImageError] = React.useState(false);

    return (
        <button
            className={clsx(
                'story-avatar',
                hasUnreadStories ? 'story-avatar-unread' : 'story-avatar-read',
                s.timelineStoryAvatar,
                classNames?.root
            )}
            style={
                {
                    position: 'absolute',
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    width: `${position.size}rem`,
                    height: `${position.size}rem`,
                    '--bubble-size': `${position.size}rem`,
                    transform: 'translate(-50%, -50%)',
                } as React.CSSProperties
            }
            type="button"
            aria-label={`Переглянути історію ${username}`}
            onClick={onClick}
        >
            <div className={clsx('story-avatar-ring', s.timelineStoryAvatarRing, classNames?.ring)}>
                <div className={clsx('story-avatar-image-wrapper', s.timelineStoryAvatarImageWrapper)}>
                    {imageError ? (
                        <div className={clsx('story-avatar-placeholder', s.timelineStoryAvatarPlaceholder)}>
                            {username.charAt(0).toUpperCase()}
                        </div>
                    ) : (
                        <img
                            src={avatarUrl}
                            alt={username}
                            className={clsx(
                                'story-avatar-image',
                                imageLoaded && 'story-avatar-image-loaded',
                                s.timelineStoryAvatarImage,
                                classNames?.image
                            )}
                            loading="lazy"
                            onLoad={() => {
                                return setImageLoaded(true);
                            }}
                            onError={() => {
                                return setImageError(true);
                            }}
                        />
                    )}
                </div>
            </div>
            <span className={clsx('story-avatar-username', s.timelineStoryAvatarUsername, classNames?.username)}>
                {username}
            </span>
        </button>
    );
};

export default StoryBubble;
