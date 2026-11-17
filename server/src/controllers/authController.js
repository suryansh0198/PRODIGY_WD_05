import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate a signed JWT
function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'commutecast_dev_secret_key_change_in_production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

  return jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    secret,
    { expiresIn }
  );
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export async function register(req, res) {
  try {
    const { name, email, password, preferredTransport } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email already exists',
      });
    }

    // Create user (pre-save hook will hash the password)
    const user = await User.create({
      name,
      email,
      password,
      preferredTransport: preferredTransport || 'transit',
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user,
    });
  } catch (error) {
    console.error('[Auth Error - Register]:', error.message);
    res.status(500).json({
      success: false,
      error: 'An unexpected server error occurred during registration',
    });
  }
}

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Must explicitly select +password since schema has select: false
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Compare password hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user,
    });
  } catch (error) {
    console.error('[Auth Error - Login]:', error.message);
    res.status(500).json({
      success: false,
      error: 'An unexpected server error occurred during login',
    });
  }
}

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private (JWT protected)
export async function getMe(req, res) {
  res.status(200).json({
    success: true,
    user: req.user,
  });
}

// @desc    Update user commute preferences
// @route   PUT /api/auth/preferences
// @access  Private (JWT protected)
export async function updatePreferences(req, res) {
  try {
    const { preferredTransport, defaultLocation } = req.body;
    const user = req.user;

    if (preferredTransport) {
      user.preferredTransport = preferredTransport;
    }

    if (defaultLocation) {
      user.defaultLocation = defaultLocation;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      user,
    });
  } catch (error) {
    console.error('[Auth Error - Preferences]:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences',
    });
  }
}
