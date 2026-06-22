export default async function handler(req, res) {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) {
    return res.status(500).json({ error: 'Missing API_FOOTBALL_KEY environment variable.' });
  }

  const type = req.query.type || 'fixtures';
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const league = req.query.league;
  const season = req.query.season || '2026';

  let url = `https://v3.football.api-sports.io/fixtures?date=${encodeURIComponent(date)}`;
  if (type === 'live') url = 'https://v3.football.api-sports.io/fixtures?live=all';
  if (type === 'standings') {
    if (!league) return res.status(400).json({ error: 'Missing league parameter.' });
    url = `https://v3.football.api-sports.io/standings?league=${encodeURIComponent(league)}&season=${encodeURIComponent(season)}`;
  }
  if (type === 'teams') {
    if (!league) return res.status(400).json({ error: 'Missing league parameter.' });
    url = `https://v3.football.api-sports.io/teams?league=${encodeURIComponent(league)}&season=${encodeURIComponent(season)}`;
  }

  try {
    const response = await fetch(url, { headers: { 'x-apisports-key': key } });
    const data = await response.json();
    res.setHeader('Cache-Control', type === 'live' ? 's-maxage=60, stale-while-revalidate=60' : 's-maxage=300, stale-while-revalidate=300');
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
