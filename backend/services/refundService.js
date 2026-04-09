const Application = require('../models/Application');
const User = require('../models/User');

/**
 * Centeralized service to handle candidate escrow refunds and forfeits
 */
const refundService = {
  /**
   * Process a refund to the candidate
   * @param {string} applicationId 
   * @param {string} reason 
   */
  async processRefund(applicationId, reason) {
    try {
      const application = await Application.findById(applicationId).populate('paymentId');
      if (!application) throw new Error('Application not found');
      if (application.refundStatus !== 'Pending') return application;

      // 1. Update Application Status
      application.refundStatus = 'Refunded';
      application.refundReason = reason;
      application.refundProcessedAt = new Date();
      await application.save();

      // 2. Update Candidate TrustScore (+10 for successful process completion)
      const candidate = await User.findById(application.candidateId);
      if (candidate) {
        candidate.trustScore += 10;
        await candidate.save();
      }

      // 3. Real Stripe Refund logic
      if (application.paymentId && application.paymentId.stripePaymentIntentId) {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        try {
          await stripe.refunds.create({
            payment_intent: application.paymentId.stripePaymentIntentId,
            reason: 'requested_by_customer' // This is a general reason
          });
          console.log(`[RefundEngine] Stripe Refund Successful for Application ${applicationId}`);
        } catch (stripeError) {
          console.error(`[RefundEngine] Stripe Refund Failed for ${applicationId}:`, stripeError.message);
          // We still mark it as Refunded in our DB if the intent is to refund, 
          // but in production we might want to handle failures more gracefully (e.g., retries).
        }
      }
      
      console.log(`[RefundEngine] Refunded Application ${applicationId}. Reason: ${reason}`);
      return application;
    } catch (error) {
      console.error(`[RefundEngine] Error processing refund for ${applicationId}:`, error.message);
      throw error;
    }
  },

  /**
   * Process a forfeit of the candidate's escrow
   * @param {string} applicationId 
   * @param {string} reason 
   */
  async processForfeit(applicationId, reason) {
    try {
      const application = await Application.findById(applicationId);
      if (!application) throw new Error('Application not found');
      if (application.refundStatus !== 'Pending') return application;

      // 1. Update Application Status
      application.refundStatus = 'Forfeited';
      application.refundReason = reason;
      application.refundProcessedAt = new Date();
      await application.save();

      // 2. Update Candidate TrustScore (-30 for no-show or violation)
      const candidate = await User.findById(application.candidateId);
      if (candidate) {
        candidate.trustScore = Math.max(0, candidate.trustScore - 30);
        await candidate.save();
      }

      console.log(`[RefundEngine] Forfeited Application ${applicationId}. Reason: ${reason}`);
      return application;
    } catch (error) {
      console.error(`[RefundEngine] Error processing forfeit for ${applicationId}:`, error.message);
      throw error;
    }
  },

  /**
   * Runs automated checks for stale applications
   * Rule: If an application is in 'Applied' status for more than 7 days, auto-refund it.
   */
  async checkStaleApplications() {
    console.log('[RefundEngine] Checking for stale applications...');
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const staleApps = await Application.find({
      status: 'Applied',
      refundStatus: 'Pending',
      createdAt: { $lte: sevenDaysAgo }
    });

    console.log(`[RefundEngine] Found ${staleApps.length} stale applications.`);
    
    for (const app of staleApps) {
      await this.processRefund(app._id, 'Not shortlisted within deadline');
    }
  }
};

module.exports = refundService;
