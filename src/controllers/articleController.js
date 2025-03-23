const prisma = require('../config/database');
const { getArticleIncludes, calculateTrending } = require('../services/articleService');

const createArticle = async (req, res) => {
  try {
    const { title, content, summary, categoryId, tags, imageUrl } = req.body;

    const article = await prisma.article.create({
      data: {
        title,
        content,
        summary,
        imageUrl,
        categoryId,
        authorId: req.user.id,
        tags: {
          connectOrCreate: tags.map(tag => ({
            where: { name: tag },
            create: { name: tag }
          }))
        }
      },
      include: getArticleIncludes
    });

    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateArticle = async (req, res) => {
  try {
    const { title, content, summary, categoryId, tags, imageUrl } = req.body;

    const article = await prisma.article.update({
      where: { id: req.params.id },
      data: {
        title,
        content,
        summary,
        imageUrl,
        categoryId,
        tags: {
          set: [], // Remove existing tags
          connectOrCreate: tags.map(tag => ({
            where: { name: tag },
            create: { name: tag }
          }))
        }
      },
      include: getArticleIncludes
    });

    res.json(article);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getMyFeed = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { followedCategories: true }
    });

    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        categoryId: {
          in: user.followedCategories.map(c => c.id)
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: getArticleIncludes,
      take: 20
    });

    res.json(articles);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getTrendingArticles = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      days = 7, // Optional: allow customizing the time range
      categoryId // Optional: filter by category
    } = req.query;
    
    const skip = (page - 1) * Number(limit);

    const where = {
      status: 'PUBLISHED',
      createdAt: {
        gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      },
      ...(categoryId && { categoryId })
    };

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: [
          { views: 'desc' },
          { likes: { _count: 'desc' } }
        ],
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
      prisma.article.count({ where })
    ]);

    // Calculate engagement score for each article
    const articlesWithScore = articles.map(article => ({
      ...article,
      engagementScore: article.views + (article._count.likes * 2) + (article._count.savedBy * 3)
    }));

    res.json({
      articles: articlesWithScore,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: Number(page)
      },
      filters: {
        days: Number(days),
        categoryId
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getArticlesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: {
          categoryId,
          status: 'PUBLISHED'
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: Number(limit),
        include: getArticleIncludes
      }),
      prisma.article.count({
        where: {
          categoryId,
          status: 'PUBLISHED'
        }
      })
    ]);

    res.json({
      articles,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: Number(page)
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const viewArticle = async (req, res) => {
  try {
    const article = await prisma.article.update({
      where: { id: req.params.id },
      data: {
        views: {
          increment: 1
        }
      },
      include: getArticleIncludes
    });

    res.json(article);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const likeArticle = async (req, res) => {
  try {
    await prisma.like.create({
      data: {
        userId: req.user.id,
        articleId: req.params.id
      }
    });
    res.status(201).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const unlikeArticle = async (req, res) => {
  try {
    await prisma.like.delete({
      where: {
        userId_articleId: {
          userId: req.user.id,
          articleId: req.params.id
        }
      }
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createArticle,
  updateArticle,
  getMyFeed,
  getTrendingArticles,
  getArticlesByCategory,
  viewArticle,
  likeArticle,
  unlikeArticle
}; 