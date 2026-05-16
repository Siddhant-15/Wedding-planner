// MediaGalleryTabs.jsx

import React, {
    useMemo,
    useState,
    memo,
    useCallback,
} from "react";

import {
    Images,
    Film,
    ZoomIn,
    Play,
} from "lucide-react";

import styles from "./MediaGalleryTabs.module.css";

import FullscreenMediaModal from "./FullscreenMediaModal";

const INITIAL_ITEMS = 6;
const LOAD_MORE_COUNT = 6;

const getYouTubeId = (url = "") => {
    const m = url.match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/
    );

    return m ? m[1] : null;
};

const getThumb = (item) => {
    if (item.media_type === "image") {
        return item.media_url;
    }

    if (item.media_type === "youtube") {
        const id = getYouTubeId(
            item.media_url
        );

        return id
            ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
            : "";
    }

    return (
        item.thumbnail_url ||
        item.media_url
    );
};

const MediaCard = memo(
    ({
        item,
        index,
        isVideo,
        onOpen,
    }) => {
        return (
            <button
                className={styles.mediaCard}
                onClick={() =>
                    onOpen(index)
                }
            >
                <img
                    src={getThumb(item)}
                    alt={`Media ${index + 1}`}
                    className={
                        styles.mediaImage
                    }
                    loading="lazy"
                    decoding="async"
                />

                <div
                    className={
                        styles.mediaOverlay
                    }
                >
                    {isVideo ? (
                        <div
                            className={
                                styles.playButton
                            }
                        >
                            <Play
                                size={20}
                                fill="currentColor"
                            />
                        </div>
                    ) : (
                        <div
                            className={
                                styles.zoomButton
                            }
                        >
                            <ZoomIn
                                size={18}
                            />
                        </div>
                    )}
                </div>
            </button>
        );
    }
);

function MediaGalleryTabs({
    media = [],
    onLoadMore,
    hasMore = false,
    loadingMore = false,
}) {
    const [tab, setTab] =
        useState("images");

    const [active, setActive] =
        useState(null);

    const [visibleCount, setVisibleCount] =
        useState(INITIAL_ITEMS);

    const normalizedMedia =
        useMemo(() => {
            return media.filter(
                (m) => m?.media_url
            );
        }, [media]);

    const images = useMemo(
        () =>
            normalizedMedia.filter(
                (m) =>
                    m.media_type ===
                    "image"
            ),
        [normalizedMedia]
    );

    const videos = useMemo(
        () =>
            normalizedMedia.filter((m) =>
                [
                    "video",
                    "youtube",
                    "vimeo",
                ].includes(m.media_type)
            ),
        [normalizedMedia]
    );

    const list =
        tab === "images"
            ? images
            : videos;

    const visibleItems =
        useMemo(() => {
            return list.slice(
                0,
                visibleCount
            );
        }, [list, visibleCount]);

    const handleOpen =
        useCallback(
            (index) => {
                setActive({
                    list:
                        visibleItems,
                    index,
                });
            },
            [visibleItems]
        );

    const handleShowMore =
        useCallback(async () => {
            const nextVisible =
                visibleCount +
                LOAD_MORE_COUNT;

            if (
                nextVisible >
                list.length &&
                hasMore &&
                onLoadMore
            ) {
                await onLoadMore();
            }

            setVisibleCount(
                (prev) =>
                    prev +
                    LOAD_MORE_COUNT
            );
        }, [
            visibleCount,
            list.length,
            hasMore,
            onLoadMore,
        ]);

    const hasVisibleMore =
        visibleCount < list.length;

    return (
        <section className={styles.card}>
            <header className={styles.head}>
                <div
                    className={styles.tabs}
                >
                    <button
                        className={`${styles.tab} ${tab === "images"
                                ? styles.tabActive
                                : ""
                            }`}
                        onClick={() => {
                            setTab(
                                "images"
                            );

                            setVisibleCount(
                                INITIAL_ITEMS
                            );
                        }}
                    >
                        <Images size={16} />

                        Images

                        <span
                            className={
                                styles.count
                            }
                        >
                            {
                                images.length
                            }
                        </span>
                    </button>

                    <button
                        className={`${styles.tab} ${tab === "videos"
                                ? styles.tabActive
                                : ""
                            }`}
                        onClick={() => {
                            setTab(
                                "videos"
                            );

                            setVisibleCount(
                                INITIAL_ITEMS
                            );
                        }}
                    >
                        <Film size={16} />

                        Videos

                        <span
                            className={
                                styles.count
                            }
                        >
                            {
                                videos.length
                            }
                        </span>
                    </button>
                </div>
            </header>

            {list.length === 0 ? (
                <div className={styles.empty}>
                    {loadingMore
                        ? "Loading media..."
                        : `No ${tab} available yet.`}
                </div>
            ) : (
                <>
                    <div
                        className={
                            styles.scrollContainer
                        }
                    >
                        <div
                            className={
                                styles.mediaGrid
                            }
                        >
                            {visibleItems.map(
                                (
                                    item,
                                    i
                                ) => (
                                    <MediaCard
                                        key={
                                            item.id ||
                                            `${tab}-${i}`
                                        }
                                        item={
                                            item
                                        }
                                        index={
                                            i
                                        }
                                        isVideo={
                                            tab ===
                                            "videos"
                                        }
                                        onOpen={
                                            handleOpen
                                        }
                                    />
                                )
                            )}
                        </div>
                    </div>

                    {(hasVisibleMore ||
                        hasMore) && (
                            <div
                                className={
                                    styles.loadMoreWrap
                                }
                            >
                                <button
                                    onClick={
                                        handleShowMore
                                    }
                                    disabled={
                                        loadingMore
                                    }
                                    className={
                                        styles.loadMoreBtn
                                    }
                                >
                                    {loadingMore
                                        ? "Loading..."
                                        : "Show More"}
                                </button>
                            </div>
                        )}
                </>
            )}

            {active && (
                <FullscreenMediaModal
                    media={active.list}
                    startIndex={
                        active.index
                    }
                    onClose={() =>
                        setActive(null)
                    }
                />
            )}
        </section>
    );
}

export default memo(
    MediaGalleryTabs
);