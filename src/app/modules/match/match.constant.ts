export enum MATCH_STATUS {
  SCHEDULED = 'scheduled', // Match not yet started
  LIVE = 'live', // Match in progress (1st half or 2nd half)
  HT = 'ht', // Half-time break
  EXTRA_TIME = 'extra_time', // Extra time in progress
  PENALTIES = 'penalties', // Penalty shootout in progress
  FINISHED = 'finished', // Match ended (includes AET and penalties results)
  POSTPONED = 'postponed', // Match postponed to a later date
  CANCELLED = 'cancelled', // Match cancelled
  SUSPENDED = 'suspended', // Match temporarily suspended
  UNKNOWN = 'unknown', // Status could not be determined
}

