export function calculateCommuteScore(weather, airQuality, mode = 'transit') {
  if (!weather || !weather.current) {
    return {
      score: 50,
      verdict: 'Data unavailable',
      color: '#64748b',
      factors: [],
      departureAdvisory: 'Waiting for live weather data...',
    };
  }

  const { current, hourlyForecast = [] } = weather;
  const currentRainProb = hourlyForecast[0]?.rainProbability ?? 0;
  const usAqi = airQuality?.usAqi?.value ?? 50;

  let score = 100;
  const factors = [];

  const isRainCode = current.isPrecipitation;
  const isSevereStorm = [95, 96, 99, 82, 65].includes(current.weatherCode);
  const isModerateRain = [55, 63, 81].includes(current.weatherCode);
  const isFog = [45, 48].includes(current.weatherCode);
  const isSnow = [71, 73, 75, 77, 85, 86].includes(current.weatherCode);

  switch (mode) {
    case 'cycling': {
      // Rain impact
      if (isSevereStorm) {
        score -= 50;
        factors.push({ name: 'Severe Storm', impact: -50, detail: 'High danger of slipping and lightning.' });
      } else if (isModerateRain || isRainCode) {
        score -= 35;
        factors.push({ name: 'Wet Roads', impact: -35, detail: 'Reduced tire grip and poor visibility.' });
      } else if (currentRainProb >= 40) {
        score -= 15;
        factors.push({ name: 'Rain Likely', impact: -15, detail: `${currentRainProb}% rain chance.` });
      }

      // Wind impact
      if (current.windSpeed >= 38 || current.windGusts >= 48) {
        score -= 35;
        factors.push({ name: 'Dangerous Winds', impact: -35, detail: `Gusts up to ${current.windGusts || current.windSpeed} km/h.` });
      } else if (current.windSpeed >= 28) {
        score -= 20;
        factors.push({ name: 'Breezy', impact: -20, detail: `${current.windSpeed} km/h crosswinds.` });
      }

      // Air quality impact (cardio exertion)
      if (usAqi > 150) {
        score -= 30;
        factors.push({ name: 'Unhealthy Air', impact: -30, detail: `US AQI ${usAqi} increases lung pollution.` });
      } else if (usAqi > 100) {
        score -= 15;
        factors.push({ name: 'Moderate Pollution', impact: -15, detail: `US AQI ${usAqi}. Consider a mask.` });
      }

      // Temperature impact
      if (current.temperature < 6) {
        score -= 15;
        factors.push({ name: 'Chilly Weather', impact: -15, detail: `${Math.round(current.temperature)}°C cold.` });
      } else if (current.temperature > 34) {
        score -= 20;
        factors.push({ name: 'Heat Stress', impact: -20, detail: `${Math.round(current.temperature)}°C heat.` });
      }
      break;
    }

    case 'two_wheeler': {
      // Wind impact
      if (current.windSpeed >= 35 || current.windGusts >= 45) {
        score -= 40;
        factors.push({ name: 'High Wind Hazard', impact: -40, detail: `Dangerous ${current.windSpeed} km/h crosswinds.` });
      } else if (current.windSpeed >= 25) {
        score -= 15;
        factors.push({ name: 'Moderate Wind', impact: -15, detail: `${current.windSpeed} km/h wind.` });
      }

      // Rain impact
      if (isSevereStorm) {
        score -= 45;
        factors.push({ name: 'Torrential Rain', impact: -45, detail: 'High hydroplaning and visor fogging.' });
      } else if (isRainCode || currentRainProb >= 50) {
        score -= 30;
        factors.push({ name: 'Wet Tarmac', impact: -30, detail: 'Slippery road markings.' });
      }

      // Fog
      if (isFog) {
        score -= 25;
        factors.push({ name: 'Low Visibility', impact: -25, detail: 'Fog significantly reduces reaction distance.' });
      }

      // Cold
      if (current.temperature < 8) {
        score -= 15;
        factors.push({ name: 'Windchill', impact: -15, detail: 'Sub-10°C windchill numbs fingers.' });
      }
      break;
    }

    case 'walking': {
      // Rain impact
      if (isSevereStorm) {
        score -= 45;
        factors.push({ name: 'Storm', impact: -45, detail: 'Heavy downpour.' });
      } else if (isRainCode || currentRainProb >= 40) {
        score -= 25;
        factors.push({ name: 'Rain', impact: -25, detail: 'Umbrella required.' });
      }

      // Temperature
      if (current.temperature < 2) {
        score -= 25;
        factors.push({ name: 'Freezing Cold', impact: -25, detail: `${Math.round(current.temperature)}°C.` });
      } else if (current.temperature > 36) {
        score -= 25;
        factors.push({ name: 'Extreme Heat', impact: -25, detail: `${Math.round(current.temperature)}°C.` });
      }

      // Air quality
      if (usAqi > 150) {
        score -= 30;
        factors.push({ name: 'Poor Air Quality', impact: -30, detail: 'Particulate pollution.' });
      }
      break;
    }

    case 'driving': {
      if (isFog) {
        score -= 25;
        factors.push({ name: 'Dense Fog', impact: -25, detail: 'Reduced road visibility.' });
      }
      if (isSevereStorm) {
        score -= 25;
        factors.push({ name: 'Storm Weather', impact: -25, detail: 'Traffic slowdowns & surface water.' });
      }
      if (isSnow) {
        score -= 30;
        factors.push({ name: 'Snow/Ice', impact: -30, detail: 'Slippery driving conditions.' });
      }
      break;
    }

    case 'transit':
    default: {
      if (isSevereStorm) {
        score -= 25;
        factors.push({ name: 'Severe Weather', impact: -25, detail: 'Potential transit delays.' });
      } else if (isRainCode) {
        score -= 10;
        factors.push({ name: 'Rainy Commute', impact: -10, detail: 'Allow time to walk to station.' });
      }
      break;
    }
  }

  // Ensure factors list has positive note if conditions are clean
  if (factors.length === 0) {
    factors.push({ name: 'Clear Conditions', impact: 0, detail: 'Optimal weather with no major travel deterrents.' });
  }

  // Clamp score
  score = Math.max(10, Math.min(100, score));

  // Determine Verdict and Color
  let verdict = 'Excellent commute conditions';
  let color = '#22c55e'; // Green

  if (score >= 80) {
    verdict = 'Excellent conditions for your commute';
    color = '#22c55e';
  } else if (score >= 65) {
    verdict = 'Good travel conditions';
    color = '#10b981'; // Teal
  } else if (score >= 50) {
    verdict = 'Fair conditions — allow extra time';
    color = '#eab308'; // Yellow
  } else if (score >= 35) {
    verdict = 'Difficult conditions — take precautions';
    color = '#f97316'; // Orange
  } else {
    verdict = 'Hazardous weather — consider alternate mode';
    color = '#ef4444'; // Red
  }

  // Calculate Departure Window Advisory from 24h timeline
  let departureAdvisory = 'Weather conditions remain stable over the next few hours.';
  const upcomingRain = hourlyForecast.slice(1, 7).find((h) => h.rainProbability >= 50);

  if (!isRainCode && upcomingRain) {
    const timeFormatted = new Date(upcomingRain.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    departureAdvisory = `Optimal travel window: Set out soon. Rain probability spikes to ${upcomingRain.rainProbability}% around ${timeFormatted}.`;
  } else if (isRainCode) {
    const upcomingDry = hourlyForecast.slice(1, 8).find((h) => h.rainProbability < 25);
    if (upcomingDry) {
      const dryTime = new Date(upcomingDry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      departureAdvisory = `Rain expected to ease around ${dryTime}.`;
    } else {
      departureAdvisory = 'Persistent rain expected throughout the journey window.';
    }
  }

  return {
    score,
    verdict,
    color,
    factors,
    departureAdvisory,
  };
}
