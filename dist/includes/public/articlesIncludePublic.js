"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformArticlePublic = exports.articlePublicDetailSelect = exports.articlePublicSelect = void 0;
exports.articlePublicSelect = {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    publishedAt: true,
    viewCount: true,
    isFeatured: true,
    metaTitle: true,
    metaDescription: true,
    updatedAt: true,
    seoKeywords: true,
    thumbnailMedia: {
        select: {
            id: true,
            url: true,
            altText: true,
        },
    },
    publication: {
        select: {
            id: true,
            fileName: true,
            filePath: true,
            altText: true,
            url: true,
        },
    },
    category: {
        select: {
            id: true,
            name: true,
            slug: true,
        },
    },
    tags: {
        select: {
            tag: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
        take: 5,
    },
    service: {
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
        },
    },
    industry: {
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
        },
    },
    creator: {
        select: {
            id: true,
            name: true,
        },
    },
};
exports.articlePublicDetailSelect = {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    content: true,
    publishedAt: true,
    viewCount: true,
    isFeatured: true,
    metaTitle: true,
    metaDescription: true,
    seoKeywords: true,
    thumbnailMedia: {
        select: {
            id: true,
            url: true,
            altText: true,
            width: true,
            height: true,
        },
    },
    publication: {
        select: {
            id: true,
            fileName: true,
            filePath: true,
            altText: true,
            url: true,
        },
    },
    category: {
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
        },
    },
    tags: {
        select: {
            tag: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
    },
    service: {
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
        },
    },
    industry: {
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
        },
    },
    creator: {
        select: {
            id: true,
            name: true,
        },
    },
};
const transformArticlePublic = (article) => ({
    ...article,
    tags: article.tags.map((at) => at.tag),
    seoKeywords: article.seoKeywords || [],
});
exports.transformArticlePublic = transformArticlePublic;
//# sourceMappingURL=articlesIncludePublic.js.map