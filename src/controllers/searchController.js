const prisma = require('../config/database');

const searchArticles = async (req, res) => {
  try {
    const {
      query,
      page = 1,
      limit = 10,
      sortBy = 'relevance', // relevance, date, views, likes
      categoryId,
      tags,
      dateRange, // today, week, month, year
      status = 'PUBLISHED' // default to published for public search
    } = req.query;

    const skip = (page - 1) * Number(limit);

    // Date range filter
    let dateFilter = {};
    if (dateRange) {
      const now = new Date();
      switch (dateRange) {
        case 'today':
          now.setHours(0, 0, 0, 0);
          dateFilter = { gte: now };
          break;
        case 'week':
          now.setDate(now.getDate() - 7);
          dateFilter = { gte: now };
          break;
        case 'month':
          now.setMonth(now.getMonth() - 1);
          dateFilter = { gte: now };
          break;
        case 'year':
          now.setFullYear(now.getFullYear() - 1);
          dateFilter = { gte: now };
          break;
      }
    }

    // Build where clause
    const where = {
      status,
      ...(query && {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { summary: { contains: query, mode: 'insensitive' } },
          { tags: { some: { name: { contains: query, mode: 'insensitive' } } } },
        ]
      }),
      ...(categoryId && { categoryId }),
      ...(tags && {
        tags: {
          some: {
            name: {
              in: Array.isArray(tags) ? tags : [tags]
            }
          }
        }
      }),
      ...(Object.keys(dateFilter).length > 0 && {
        createdAt: dateFilter
      })
    };

    // Determine sort order
    let orderBy = [];
    switch (sortBy) {
      case 'date':
        orderBy = { createdAt: 'desc' };
        break;
      case 'views':
        orderBy = { views: 'desc' };
        break;
      case 'likes':
        orderBy = {
          likes: {
            _count: 'desc'
          }
        };
        break;
      case 'relevance':
      default:
        // For relevance, we'll sort by views and date
        orderBy = [
          { views: 'desc' },
          { createdAt: 'desc' }
        ];
        break;
    }

    const [articles, total, categories, popularTags] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy,
        skip,
        take: Number(limit),
        include: {
          author: {
            select: {
              id: true,
              name: true,
              profilePicture: true
            }
          },
          category: true,
          tags: true,
          _count: {
            select: {
              likes: true,
              savedBy: true
            }
          }
        }
      }),
      prisma.article.count({ where }),
      // Get categories with article counts
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              articles: {
                where: { status: 'PUBLISHED' }
              }
            }
          }
        }
      }),
      // Get popular tags
      prisma.tag.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              articles: {
                where: { status: 'PUBLISHED' }
              }
            }
          }
        },
        orderBy: {
          articles: {
            _count: 'desc'
          }
        },
        take: 10
      })
    ]);

    // If searching by query, calculate relevance score
    const articlesWithScore = query
      ? articles.map(article => ({
          ...article,
          relevanceScore: calculateRelevanceScore(article, query)
        }))
      : articles;

    // Sort by relevance score if needed
    if (query && sortBy === 'relevance') {
      articlesWithScore.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    res.json({
      articles: articlesWithScore,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: Number(page)
      },
      filters: {
        query,
        sortBy,
        categoryId,
        tags,
        dateRange
      },
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        articleCount: cat._count.articles
      })),
      popularTags: popularTags.map(tag => ({
        id: tag.id,
        name: tag.name,
        articleCount: tag._count.articles
      }))
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Helper function to calculate relevance score
function calculateRelevanceScore(article, query) {
  const queryLower = query.toLowerCase();
  let score = 0;

  // Title matches (highest weight)
  if (article.title.toLowerCase().includes(queryLower)) {
    score += 10;
  }

  // Summary matches
  if (article.summary && article.summary.toLowerCase().includes(queryLower)) {
    score += 5;
  }

  // Content matches
  if (article.content.toLowerCase().includes(queryLower)) {
    score += 3;
  }

  // Tag matches
  if (article.tags.some(tag => tag.name.toLowerCase().includes(queryLower))) {
    score += 2;
  }

  // Add weight for views and likes
  score += (article.views / 1000); // Normalize views
  score += (article._count.likes * 0.5); // Weight for likes

  return score;
}

const getSearchSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    const [titleSuggestions, tagSuggestions, categorySuggestions] = await Promise.all([
      // Get article title suggestions
      prisma.article.findMany({
        where: {
          status: 'PUBLISHED',
          title: {
            contains: query,
            mode: 'insensitive'
          }
        },
        select: {
          title: true
        },
        take: 5
      }),
      // Get tag suggestions
      prisma.tag.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        select: {
          name: true
        },
        take: 3
      }),
      // Get category suggestions
      prisma.category.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        select: {
          name: true
        },
        take: 3
      })
    ]);

    res.json({
      suggestions: {
        articles: titleSuggestions.map(s => s.title),
        tags: tagSuggestions.map(s => s.name),
        categories: categorySuggestions.map(s => s.name)
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  searchArticles,
  getSearchSuggestions
}; 