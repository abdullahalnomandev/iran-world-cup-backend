import { logger } from '../../../shared/logger';
import setCronJob from '../../../shared/setCronJob';
import { MatchService } from './match.service';

const END_DATE = new Date('2026-07-31T23:59:59Z');

const isExpired = () => Date.now() > END_DATE.getTime();

let matchCronInitialized = false;



const dailyMatchesUpdate = () => {
  if (matchCronInitialized) return;

  matchCronInitialized = true;

  // Every day at 2:00 AM
  setCronJob(
    '0 2 * * *',
    async () => {
      if (isExpired()) {
        logger.info('🛑 Cron permanently stopped (end date reached)');
        return;
      }

      try {
        logger.info('🕐 Running daily matches update cron job');
        await MatchService.updateMatchesData();
        logger.info('✅ Daily matches update completed');
      } catch (error) {
        logger.error('❌ Daily matches update failed:', error);
      }
    },
    false,
  );
};



const everyMinuteCronJob = () => {
  if (matchCronInitialized) return;

  matchCronInitialized = true;

  // Every minute
  setCronJob(
    '* * * * *',
    async () => {
      if (isExpired()) {
        logger.info('🛑 Cron permanently stopped (end date reached)');
        return;
      }

      try {
        await MatchService.updateLiveMatchesData();
        logger.info('✅ Every minute cron job completed');
      } catch (error) {
        logger.error('❌ Every minute cron job failed:', error);
      }
    },
    false,
  );
}

export { dailyMatchesUpdate, everyMinuteCronJob };
