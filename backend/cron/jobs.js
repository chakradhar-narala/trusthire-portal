const cron = require('node-cron');
const Job = require('../models/Job');
const Application = require('../models/Application');
const refundService = require('../services/refundService');

const startCronJobs = () => {
  console.log('[Cron] Initialization complete.');

  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Executing nightly maintenance...');

    try {
      // 1. Auto-expire jobs
      const expiredJobs = await Job.updateMany(
        { 
          status: 'Active', 
          expirationDate: { $lte: new Date() } 
        },
        { $set: { status: 'Expired' } }
      );
      console.log(`[Cron] ${expiredJobs.modifiedCount} jobs marked as Expired.`);

      // 2. Check for Stale Applications (System Decides: Not shortlisted within 7 days)
      await refundService.checkStaleApplications();

      // 3. Auto-refund candidates on jobs that just expired without recruiter action
      const autoRejectedApps = await Application.find({
        status: 'Applied',
        refundStatus: 'Pending'
      }).populate('jobId');

      let autoRefundCount = 0;
      for (const app of autoRejectedApps) {
        if (app.jobId && app.jobId.status === 'Expired') {
          await refundService.processRefund(app._id, 'Job expired without action');
          autoRefundCount++;
        }
      }
      console.log(`[Cron] ${autoRefundCount} auto-refunds processed for newly expired jobs.`);

    } catch (error) {
      console.error('[Cron] Error during maintenance tasks:', error);
    }
  });

  // Optional: Run stale check more frequently if needed (e.g., every 6 hours)
  cron.schedule('0 */6 * * *', async () => {
    try {
      await refundService.checkStaleApplications();
    } catch (error) {
      console.error('[Cron] Error during stale check:', error);
    }
  });
};

module.exports = startCronJobs;
