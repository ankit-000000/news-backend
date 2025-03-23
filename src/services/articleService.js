const prisma = require('../config/database');

const getArticleIncludes = {
  author: {
    select: {
      id: true,
      name: true,
      profilePicture: true,
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
};

const calculateTrending = async (skip = 0, take = 10, days = 7) => {
  const date = new Date();
  date.setDate(date.getDate() - days);

  return prisma.article.findMany({
    where: {
      status: 'PUBLISHED',
      createdAt: {
        gte: date
      }
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
    skip,
    take,
    include: getArticleIncludes
  });
};

module.exports = {
  getArticleIncludes,
  calculateTrending
}; 