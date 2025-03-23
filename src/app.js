require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const articleRoutes = require('./routes/articleRoutes');
const errorHandler = require('./middleware/errorHandler');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const editorRoutes = require('./routes/editorRoutes');
const articleStatusRoutes = require('./routes/articleStatusRoutes');
const searchRoutes = require('./routes/searchRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/editor', editorRoutes);
app.use('/api/articles/status', articleStatusRoutes);
app.use('/api/search', searchRoutes);

// Error handling
// app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 