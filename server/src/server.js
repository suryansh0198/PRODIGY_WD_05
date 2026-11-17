import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
  console.log(`[CommuteCast Server] Running on http://localhost:${PORT}`);
  console.log(`[CommuteCast Server] Allowed Client Origin: ${CLIENT_URL}`);
});
