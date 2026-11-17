import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB(uri = process.env.MONGO_URI || 'mongodb://localhost:27017/commutecast') {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    });

    isConnected = true;
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    return conn.connection;
  } catch (error) {
    isConnected = false;
    console.warn(`[MongoDB] Connection failed: ${error.message}`);
    console.warn('[MongoDB] Note: To use local database, ensure MongoDB service is started (e.g., net start MongoDB or mongod).');
    return null;
  }
}

export function getDBStatus() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const stateCode = mongoose.connection.readyState;
  return {
    state: states[stateCode] || 'unknown',
    connected: stateCode === 1,
    host: stateCode === 1 ? mongoose.connection.host : null,
    database: stateCode === 1 ? mongoose.connection.name : null,
  };
}

export async function closeDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[MongoDB] Connection closed.');
  }
}
