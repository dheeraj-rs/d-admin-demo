/**
 * Quick script to check user's current plan in database
 * Run: node scripts/check-user-plan.js <user_email>
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

async function checkUserPlan() {
    const userEmail = process.argv[2];

    if (!userEmail) {
        console.log('❌ Usage: node scripts/check-user-plan.js <user_email>');
        process.exit(1);
    }

    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/d-admin';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Get User model
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

        // Find user
        const user = await User.findOne({ email: userEmail }).lean();

        if (!user) {
            console.log('❌ User not found:', userEmail);
            process.exit(1);
        }

        console.log('\n📊 User Plan Information:');
        console.log('═══════════════════════════════════════');
        console.log('Email:', user.email);
        console.log('Name:', user.name);
        console.log('Plan:', user.plan || 'Not set');
        console.log('Tier:', user.tier || 'Not set');
        console.log('Billing Period:', user.billingPeriod || 'Not set');
        console.log('Is Plan Active:', user.isPlanActive !== undefined ? user.isPlanActive : 'Not set');
        console.log('Plan End Date:', user.planEndDate ? new Date(user.planEndDate).toLocaleDateString() : 'Not set');
        console.log('Last Payment:', user.lastPaymentDate ? new Date(user.lastPaymentDate).toLocaleDateString() : 'Not set');
        console.log('Last Payment Amount:', user.lastPaymentAmount ? `$${user.lastPaymentAmount}` : 'Not set');
        console.log('═══════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkUserPlan();
