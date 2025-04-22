const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5500;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('uploads')); // to serve uploaded files

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected!'))
.catch(err => console.error('MongoDB error:', err));

// Mongoose Schemas
const userSchema = new mongoose.Schema({
  name: String,
  mobileNumber: String,
});

const fileSchema = new mongoose.Schema({
  name: String,
  fileName: String,
});

const User = mongoose.model('User', userSchema);
const FileUser = mongoose.model('FileUser', fileSchema);

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Routes
app.post('/submit', async (req, res) => {
  const { name, mobileNumber } = req.body;
  try {
    const user = new User({ name, mobileNumber });
    await user.save();
    res.json({ message: `Thank you, ${name}! Your number ${mobileNumber} has been saved.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving user data' });
  }
});

app.post('/submit-file', upload.single('file'), async (req, res) => {
  const { name } = req.body;
  const file = req.file;

  if (!name || !file) {
    return res.status(400).json({ message: "Name and file required" });
  }

  try {
    const fileUser = new FileUser({ name, fileName: file.filename });
    await fileUser.save();
    res.json({ message: `File uploaded by ${name}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'File upload failed' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
