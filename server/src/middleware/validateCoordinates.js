export function validateCoordinates(req, res, next) {
  const latRaw = req.query.lat ?? req.body.lat;
  const lonRaw = req.query.lon ?? req.body.lon;

  if (latRaw === undefined || lonRaw === undefined || latRaw === '' || lonRaw === '') {
    return res.status(400).json({
      success: false,
      error: 'Both "lat" (latitude) and "lon" (longitude) parameters are required.',
    });
  }

  const lat = parseFloat(latRaw);
  const lon = parseFloat(lonRaw);

  if (isNaN(lat) || !isFinite(lat)) {
    return res.status(400).json({
      success: false,
      error: 'Latitude must be a valid numeric value.',
    });
  }

  if (isNaN(lon) || !isFinite(lon)) {
    return res.status(400).json({
      success: false,
      error: 'Longitude must be a valid numeric value.',
    });
  }

  if (lat < -90 || lat > 90) {
    return res.status(400).json({
      success: false,
      error: 'Latitude must be between -90.0 and 90.0 degrees.',
    });
  }

  if (lon < -180 || lon > 180) {
    return res.status(400).json({
      success: false,
      error: 'Longitude must be between -180.0 and 180.0 degrees.',
    });
  }

  req.validCoords = { lat, lon };
  next();
}
