import { logger } from '../../../shared/logger';
import setCronJob from '../../../shared/setCronJob';
import { StandingService } from './standing.service';

const END_DATE = new Date('2026-07-31T23:59:59Z');

const isExpired = () => Date.now() > END_DATE.getTime();

let isCronInitialized = false;

const dailyStandingsUpdate = () => {
  if (isCronInitialized) return;

  isCronInitialized = true;

  // Every day at 5:00 AM
  setCronJob(
    '0 5 * * *',
    async () => {
      if (isExpired()) {
        logger.info('🛑 Cron permanently stopped (end date reached)');
        return;
      }

      try {
        logger.info('🕐 Running daily standings update cron job');
        await StandingService.updateStandingsData();
        logger.info('✅ Daily standings update completed');
      } catch (error) {
        logger.error('❌ Daily standings update failed:', error);
      }
    },
    false,
  );
};



export { dailyStandingsUpdate };
