const prisma = require('../config/database');
const { getArticleIncludes } = require('../services/articleService');

const getEditorStats = async (req, res) => {
  try {
    const stats = await prisma.article.groupBy({
      by: ['status'],
      where: {
        authorId: req.user.id
      },
      _count: true
    });

    const totalViews = await prisma.article.aggregate({
      where: {
        authorId: req.user.id,
        status: 'PUBLISHED'
      },
      _sum: {
        views: true
      }
    });

    const totalLikes = await prisma.like.count({
      where: {
        article: {
          authorId: req.user.id
        }
      }
    });

    res.json({
      articleStats: stats,
      totalViews: totalViews._sum.views || 0,
      totalLikes: totalLikes
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getEditorArticles = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * Number(limit);

    const where = {
      authorId: req.user.id,
      ...(status && { status }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
        include: {
          ...getArticleIncludes,
          likes: {
            select: {
              userId: true,
              createdAt: true
            }
          }
        }
      }),
      prisma.article.count({ where })
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

const getArticleDetails = async (req, res) => {
  try {
    const article = await prisma.article.findFirst({
      where: {
        id: req.params.id,
        authorId: req.user.id
      },
      include: {
        ...getArticleIncludes,
        likes: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                profilePicture: true
              }
            },
            createdAt: true
          }
        },
        savedBy: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                profilePicture: true
              }
            },
            savedAt: true
          }
        }
      }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateArticleStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const article = await prisma.article.findFirst({
      where: {
        id: req.params.id,
        authorId: req.user.id
      }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const updatedArticle = await prisma.article.update({
      where: { id: req.params.id },
      data: { status },
      include: getArticleIncludes
    });

    res.json(updatedArticle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getTopArticles = async (req, res) => {
  try {
    const topArticles = await prisma.article.findMany({
      where: {
        authorId: req.user.id,
        status: 'PUBLISHED'
      },
      orderBy: [
        {
          views: 'desc'
        },
        {
          likes: {
            _count: 'desc'
          }
        }
      ],
      take: 5,
      include: getArticleIncludes
    });

    res.json(topArticles);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getEditorStats,
  getEditorArticles,
  getArticleDetails,
  updateArticleStatus,
  getTopArticles
}; 