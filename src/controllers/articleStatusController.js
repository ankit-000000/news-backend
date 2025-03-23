const prisma = require('../config/database');
const { getArticleIncludes } = require('../services/articleService');

const updateStatusByEditor = async (req, res) => {
  try {
    const { status } = req.body;
    const articleId = req.params.id;

    // Verify if status is valid for editor
    if (status !== 'DRAFT' && status !== 'PENDING') {
      return res.status(403).json({ 
        error: 'Editors can only set articles to DRAFT or PENDING status' 
      });
    }

    // Verify article ownership
    const article = await prisma.article.findFirst({
      where: {
        id: articleId,
        authorId: req.user.id
      }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found or unauthorized' });
    }

    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: { status },
      include: getArticleIncludes
    });

    res.json(updatedArticle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateStatusByAdmin = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const articleId = req.params.id;

    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: { 
        status,
        ...(status === 'REJECTED' && { rejectionReason })
      },
      include: getArticleIncludes
    });

    // If article is published or rejected, notify the author (you can implement this later)
    if (status === 'PUBLISHED' || status === 'REJECTED') {
      // TODO: Implement notification system
    }

    res.json(updatedArticle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getPendingArticles = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * Number(limit);

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: { status: 'PENDING' },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: Number(limit),
        include: getArticleIncludes
      }),
      prisma.article.count({
        where: { status: 'PENDING' }
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

const getArticlesByStatus = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * Number(limit);

    const where = status ? { status } : {};

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: Number(limit),
        include: getArticleIncludes
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

const getMyArticlesByStatus = async (req, res) => {
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

    const [articles, total, statusCounts] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: Number(limit),
        include: {
          ...getArticleIncludes,
          category: true,
          tags: true,
          _count: {
            select: {
              likes: true,
              savedBy: true,
            }
          }
        }
      }),
      prisma.article.count({ where }),
      // Get count of articles by status
      prisma.article.groupBy({
        by: ['status'],
        where: { authorId: req.user.id },
        _count: true
      })
    ]);

    res.json({
      articles,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: Number(page)
      },
      statusCounts: statusCounts.reduce((acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      }, {
        DRAFT: 0,
        PENDING: 0,
        PUBLISHED: 0,
        REJECTED: 0
      })
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllArticlesByStatus = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search, categoryId } = req.query;
    const skip = (page - 1) * Number(limit);

    const where = {
      ...(status && { status }),
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [articles, total, statusCounts] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: Number(limit),
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePicture: true
            }
          },
          category: true,
          tags: true,
          _count: {
            select: {
              likes: true,
              savedBy: true,
            }
          }
        }
      }),
      prisma.article.count({ where }),
      // Get count of all articles by status
      prisma.article.groupBy({
        by: ['status'],
        _count: true
      })
    ]);

    res.json({
      articles,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: Number(page)
      },
      statusCounts: statusCounts.reduce((acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      }, {
        DRAFT: 0,
        PENDING: 0,
        PUBLISHED: 0,
        REJECTED: 0
      })
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  updateStatusByEditor,
  updateStatusByAdmin,
  getPendingArticles,
  getArticlesByStatus,
  getMyArticlesByStatus,
  getAllArticlesByStatus
}; 