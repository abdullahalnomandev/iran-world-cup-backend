# Football API Documentation

## Overview
A real-time football data system using the Anysport API with Redis caching, WebSocket real-time updates, and automated data synchronization.

## Features
- **Real-time match updates** via WebSocket
- **Redis caching** for optimal performance
- **Automated data sync** with cron jobs
- **Change detection** to minimize unnecessary updates
- **REST API endpoints** for all football data
- **MongoDB storage** with proper indexing

## Environment Setup

Add these variables to your `.env` file:

```env
# Redis
REDIS_URL=redis://localhost:6379

# Anysport API
ANYSPORT_API_KEY=f3f8a0c3eb236fe5221cb4000f42e9eb133073b67df9dffae13b2066aabf2b42
```

## API Endpoints

### Public Endpoints

#### Standings
```
GET /football/standings?league_id=28
```
Returns current league standings

#### Today's Matches
```
GET /football/matches/today?league_id=28
```
Returns all matches scheduled for today

#### Live Matches
```
GET /football/matches/live?league_id=28
```
Returns currently live matches

#### Match Details
```
GET /football/matches/:id
```
Returns detailed information for a specific match

#### Matches by Date Range
```
GET /football/matches?from=2026-06-01&to=2026-06-30&league_id=28
```
Returns matches within a date range

#### Team Matches
```
GET /football/matches/team/:teamId?limit=50
```
Returns recent matches for a specific team

#### Search Matches
```
GET /football/search?q=team_name&league_id=28
```
Search matches by team name, stadium, or referee

#### Team Standings
```
GET /football/standings/team/:teamId
```
Returns standing information for a specific team

#### Statistics
```
GET /football/statistics?league_id=28
```
Returns system statistics (total matches, teams, etc.)

### Admin Endpoints

#### Trigger Initial Sync
```
POST /football/admin/sync/initial
```
Manually trigger complete data synchronization

#### Trigger Standings Sync
```
POST /football/admin/sync/standings
```
Manually trigger standings update

#### Trigger Match Sync
```
POST /football/admin/sync/matches
```
Manually trigger match synchronization

#### Refresh Standings
```
POST /football/admin/refresh/standings
```
Force refresh standings from API

#### Refresh Matches
```
POST /football/admin/refresh/matches
```
Force refresh matches from API

#### System Status
```
GET /football/admin/status
```
Returns system status (connected clients, active tasks)

## WebSocket Events

### Client Events

#### Subscribe to Match
```javascript
socket.emit('subscribe_match', matchId);
```

#### Unsubscribe from Match
```javascript
socket.emit('unsubscribe_match', matchId);
```

#### Subscribe to Live Matches
```javascript
socket.emit('subscribe_live');
```

#### Unsubscribe from Live Matches
```javascript
socket.emit('unsubscribe_live');
```

#### Get Match Details
```javascript
socket.emit('get_match_details', matchId);
```

#### Ping (Health Check)
```javascript
socket.emit('ping');
```

### Server Events

#### Match Updates
```javascript
socket.on('match_update', (update) => {
  // update = {
  //   match_id: 1626442,
  //   event: 'goal',
  //   score: '2-1',
  //   minute: '68',
  //   data: { goal details }
  // }
});
```

#### Major Updates
```javascript
socket.on('major_update', (update) => {
  // Goals, status changes, etc.
});
```

#### Today's Matches
```javascript
socket.on('today_matches', (matches) => {
  // Array of today's matches
});
```

#### Live Matches
```javascript
socket.on('live_matches', (matches) => {
  // Array of live matches
});
```

#### Standings
```javascript
socket.on('standings', (standings) => {
  // Current league standings
});
```

#### Match Details
```javascript
socket.on('match_details', (data) => {
  // { matchId, data: match details }
});
```

#### Pong (Response to Ping)
```javascript
socket.on('pong', () => {
  // Connection health confirmed
});
```

## Automated Synchronization

### Cron Jobs

1. **Daily Standings Update** - 2:00 AM UTC
   - Fetches latest standings
   - Updates database and cache
   - Only updates if data has changed

2. **Match Sync** - Every 30 seconds
   - Fetches today's matches
   - Fetches live matches
   - Detects changes using Redis state comparison
   - Emits WebSocket updates for changes

3. **Daily Cleanup** - 3:00 AM UTC
   - Cleans up old match states
   - Relies on Redis TTL expiration

### Change Detection

The system tracks match state changes in Redis and only emits updates when:
- Score changes
- Status changes (e.g., match ends)
- Goals are scored
- Cards are given
- Match minute updates (for live matches)

## Data Models

### Standing
```typescript
interface IStanding {
  position: number;
  position_type: string;
  team: string;
  team_id: number;
  team_badge: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  league_id: number;
  league: string;
  league_season: string;
  stage_name: string;
  country: string;
  updated_at: string;
}
```

### Match
```typescript
interface IMatch {
  match_id: number;
  date: string;
  time: string;
  home: string;
  home_id: number;
  home_badge: string;
  away: string;
  away_id: number;
  away_badge: string;
  ht_score: string;
  score: string;
  status: string;
  minute: string | null;
  live: boolean;
  league: string;
  league_id: number;
  league_round: string;
  league_season: string;
  league_logo: string;
  country: string;
  country_id: number;
  stadium: string;
  referee: string;
  home_formation: string;
  away_formation: string;
  stage_name: string;
  vars: IMatchVars;
  goals: IMatchGoal[];
  cards: IMatchCard[];
  subs: IMatchSub[];
  stats: IMatchStat[];
  lineups: any;
}
```

## Performance Optimizations

1. **Redis Caching**
   - Standings cached for 1 hour
   - Today's matches cached for 30 minutes
   - Live matches cached for 30 minutes
   - Individual matches cached for 1 hour

2. **Database Indexing**
   - Standings: league_id, league_season, team_id
   - Matches: match_id (unique), date, league_id, live, status

3. **Change Detection**
   - Only fetches today's and live matches
   - Compares with previous state before updates
   - Emits delta updates only

## Error Handling

- API failures are logged and don't crash the system
- Redis connection failures are handled gracefully
- WebSocket connections are monitored
- Automatic retry mechanisms for failed API calls

## Monitoring

Use the `/football/admin/status` endpoint to monitor:
- Number of connected WebSocket clients
- Active cron jobs
- System uptime

## Example Usage

### Frontend Integration
```javascript
const socket = io('http://localhost:5000');

// Subscribe to live matches
socket.emit('subscribe_live');

// Listen for match updates
socket.on('match_update', (update) => {
  console.log('Match update:', update);
  if (update.event === 'goal') {
    showGoalNotification(update);
  }
});

// Get today's matches
fetch('/football/matches/today')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Admin Operations
```javascript
// Force refresh standings
fetch('/football/admin/refresh/standings', { method: 'POST' })
  .then(res => res.json())
  .then(data => console.log('Standings refreshed:', data));
```

## Deployment Notes

1. Ensure Redis is running and accessible
2. Set proper environment variables
3. MongoDB should be properly indexed
4. WebSocket connections need proper CORS configuration
5. Monitor system resources for high traffic

## License

This system is built for educational and demonstration purposes.
