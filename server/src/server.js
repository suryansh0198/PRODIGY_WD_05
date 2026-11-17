import app from './app.js';

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.listen(PORT, () => {
  console.log(`[CommuteCast Server] Running on http://localhost:${PORT}`);
  console.log(`[CommuteCast Server] Allowed Client Origin: ${CLIENT_URL}`);
});
