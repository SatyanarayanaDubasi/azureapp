const express = require('express');

const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

// Initialize Express App
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));



// Connect to MongoDB
const mongoose = require('mongoose');

// Replace with your connection string
const mongoURI = 'mongodb://markmytrade:vAcg3jx0PmdEHe5EMmoFMRyUKKBWtCaC3zR77opXJQmCM24UIkmKULMqQwSSQjEN9uu4PhEoBUb8ACDbI10UXw==@markmytrade.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@markmytrade@'
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to Azure Cosmos DB (MongoDB)'))
  .catch((err) => console.error('MongoDB connection error:', err));

// User Schema and Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Routes
app.get('/', (req, res) => {
  res.send(`
    <h2>User Login Form</h2>
    <form action="/login" method="POST">
      <input type="text" name="username" placeholder="Username" required><br>
      <input type="password" name="password" placeholder="Password" required><br>
      <button type="submit">Login</button>
    </form>
    <br>
    <h3>New User?</h3>
    <form action="/register" method="POST">
      <input type="text" name="username" placeholder="Username" required><br>
      <input type="password" name="password" placeholder="Password" required><br>
      <button type="submit">Register</button>
    </form>
  `);
});

// Register User
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to database
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.send('User registered successfully! <a href="/">Go to login</a>');
  } catch (err) {
    res.send('Error registering user: ' + err.message);
  }
});

// Login User
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user in database
    const user = await User.findOne({ username });
    if (!user) return res.send('User not found!');

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send('Invalid credentials!');

    res.send(`Welcome ${username}!`);
  } catch (err) {
    res.send('Error logging in: ' + err.message);
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
