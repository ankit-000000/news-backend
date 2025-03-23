const prisma = require('../config/database');

const updateRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, profilePicture } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, profilePicture },
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  updateRole,
  updateProfile,
}; 