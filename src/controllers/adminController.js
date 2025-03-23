const prisma = require('../config/database');

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profilePicture: true,
        createdAt: true,
        _count: {
          select: {
            articles: true,
            savedArticles: true,
          }
        }
      }
    });
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        articles: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          }
        },
        savedArticles: {
          select: {
            article: {
              select: {
                id: true,
                title: true,
              }
            },
            savedAt: true,
          }
        },
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        name,
        email,
        role,
      }
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalArticles,
      usersByRole,
      recentArticles
    ] = await Promise.all([
      prisma.user.count(),
      prisma.article.count(),
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      prisma.article.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              name: true,
            }
          }
        }
      })
    ]);

    res.json({
      totalUsers,
      totalArticles,
      usersByRole,
      recentArticles
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  getDashboardStats
}; 