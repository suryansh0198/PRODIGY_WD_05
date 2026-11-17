const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const VALID_TRANSPORTS = ['walking', 'cycling', 'two_wheeler', 'transit', 'driving'];

export function validateRegister(req, res, next) {
  const { name, email, password, preferredTransport } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Name is required and must be at least 2 characters long',
    });
  }

  if (name.trim().length > 50) {
    return res.status(400).json({
      success: false,
      error: 'Name cannot exceed 50 characters',
    });
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid email address',
    });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters long',
    });
  }

  if (preferredTransport && !VALID_TRANSPORTS.includes(preferredTransport)) {
    return res.status(400).json({
      success: false,
      error: `Invalid transport mode. Allowed: ${VALID_TRANSPORTS.join(', ')}`,
    });
  }

  // Normalize trimmed email
  req.body.email = email.trim().toLowerCase();
  req.body.name = name.trim();

  next();
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid email address',
    });
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Password is required',
    });
  }

  req.body.email = email.trim().toLowerCase();
  next();
}

export function validatePreferences(req, res, next) {
  const { preferredTransport, defaultLocation } = req.body;

  if (preferredTransport && !VALID_TRANSPORTS.includes(preferredTransport)) {
    return res.status(400).json({
      success: false,
      error: `Invalid transport mode. Allowed modes are: ${VALID_TRANSPORTS.join(', ')}`,
    });
  }

  if (defaultLocation) {
    const { name, latitude, longitude } = defaultLocation;
    if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        error: 'Latitude must be a valid number between -90 and 90',
      });
    }
    if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        error: 'Longitude must be a valid number between -180 and 180',
      });
    }
    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Location name is required',
      });
    }
  }

  next();
}
