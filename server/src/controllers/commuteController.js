import { getCommuteRecommendation } from '../services/commuteService.js';

export async function getRecommendation(req, res) {
  try {
    const { lat, lon } = req.validCoords;
    const mode = req.query.mode || 'transit';

    const validModes = ['transit', 'cycling', 'two_wheeler', 'walking', 'driving'];
    if (!validModes.includes(mode)) {
      return res.status(400).json({
        success: false,
        error: `Invalid mode. Allowed modes are: ${validModes.join(', ')}`,
      });
    }

    const recommendation = await getCommuteRecommendation(lat, lon, mode);
    res.status(200).json({
      success: true,
      ...recommendation,
    });
  } catch (error) {
    console.error('[Commute Controller Error]:', error.message);
    res.status(502).json({
      success: false,
      error: 'Failed to generate commute recommendations.',
    });
  }
}
