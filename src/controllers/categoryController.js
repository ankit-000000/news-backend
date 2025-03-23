const prisma = require('../config/database');
const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    });
    res.json(categories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const { includeCount = false } = req.query;

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: includeCount ? {
        _count: {
          select: {
            articles: {
              where: { status: 'PUBLISHED' }
            }
          }
        }
      } : undefined
    });

    // Format response based on includeCount
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      ...(includeCount && { articleCount: category._count.articles })
    }));

    res.json(formattedCategories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await prisma.category.create({
      data: { name, description }
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { name, description }
    });
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    await prisma.category.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllCategories,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
}; 