const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  image: String,
});

// Create Model
const User = mongoose.model('User', userSchema);

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

// API Route for User Registration
app.post('/api/register', upload.single('image'), async (req, res) => {
  try {
    const user = new User({
      username: req.body.username,
      password: req.body.password,
      image: req.file.path,
    });
    await user.save();
    res.json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).send({ error: 'Error registering user' });
  }
});

// Start Server
app.listen(3000, () => console.log('Server running on port 3000'));
