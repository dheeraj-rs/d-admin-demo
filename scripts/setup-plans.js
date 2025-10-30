const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const SuperAdmin = require('../models/SuperAdmin');
const PlanConfiguration = require('../models/PlanConfiguration');

async function setupPlans() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database');

        // Get all SuperAdmins
        const superAdmins = await SuperAdmin.find({ isActive: true });
        console.log(`📋 Found ${superAdmins.length} active SuperAdmins`);

        for (const superAdmin of superAdmins) {
            console.log(`\n🔧 Setting up plans for: ${superAdmin.organizationName}`);

            // Check if plans already exist
            const existingPlans = await PlanConfiguration.find({ superAdminId: superAdmin._id });

            if (existingPlans.length > 0) {
                console.log(`   ⚠️  Plans already exist for ${superAdmin.organizationName}`);
                continue;
            }

            // Create FREE plan
            const freePlan = new PlanConfiguration({
                superAdminId: superAdmin._id,
                plan: 'FREE',
                features: {
                    dashboard: true,
                    profile: true,
                    settings: true,
                    elements: true,
                    addElements: false,
                    websiteBuilder: false,
                    aiWebsites: true,
                    analytics: false,
                    customBranding: false,
                    apiAccess: false,
                    webhooks: false,
                    maxStorage: 100,
                    maxApiCalls: 100,
                    maxDownloads: 10,
                    maxPages: 5,
                    maxWebsites: 1,
                    allowedPages: ['/', '/elements', '/ai-websites', '/webconfig', '/websites', '/knowledge', '/webconfig/portfolio'],
                    restrictedPages: ['/website-builder', '/analytics', '/api', '/webhooks'],
                    customFeatures: [],
                },
                price: {
                    monthly: 0,
                    yearly: 0,
                    currency: 'USD',
                },
            });

            // Create PRO plan
            const proPlan = new PlanConfiguration({
                superAdminId: superAdmin._id,
                plan: 'PRO',
                features: {
                    dashboard: true,
                    profile: true,
                    settings: true,
                    elements: true,
                    addElements: true,
                    websiteBuilder: true,
                    aiWebsites: true,
                    analytics: true,
                    customBranding: false,
                    apiAccess: true,
                    webhooks: false,
                    maxStorage: 1000,
                    maxApiCalls: 1000,
                    maxDownloads: 100,
                    maxPages: 50,
                    maxWebsites: 5,
                    allowedPages: [
                        '/',
                        '/elements',
                        '/add-elements',
                        '/website-builder',
                        '/ai-websites',
                        '/webconfig',
                        '/websites',
                        '/knowledge',
                        '/webconfig/portfolio',
                        '/analytics',
                    ],
                    restrictedPages: ['/api', '/webhooks'],
                    customFeatures: [],
                },
                price: {
                    monthly: 29,
                    yearly: 290,
                    currency: 'USD',
                },
            });

            // Create MAX plan
            const maxPlan = new PlanConfiguration({
                superAdminId: superAdmin._id,
                plan: 'MAX',
                features: {
                    dashboard: true,
                    profile: true,
                    settings: true,
                    elements: true,
                    addElements: true,
                    websiteBuilder: true,
                    aiWebsites: true,
                    analytics: true,
                    customBranding: true,
                    apiAccess: true,
                    webhooks: true,
                    maxStorage: 10000,
                    maxApiCalls: 10000,
                    maxDownloads: 1000,
                    maxPages: 500,
                    maxWebsites: 50,
                    allowedPages: ['*'],
                    restrictedPages: [],
                    customFeatures: [
                        {
                            name: 'Priority Support',
                            enabled: true,
                            description: '24/7 priority support',
                        },
                        {
                            name: 'Custom Integrations',
                            enabled: true,
                            description: 'Custom API integrations',
                        },
                    ],
                },
                price: {
                    monthly: 99,
                    yearly: 990,
                    currency: 'USD',
                },
            });

            // Save all plans
            await Promise.all([freePlan.save(), proPlan.save(), maxPlan.save()]);

            // Update SuperAdmin with plan references
            await SuperAdmin.findByIdAndUpdate(superAdmin._id, {
                planConfigurations: {
                    FREE: freePlan._id,
                    PRO: proPlan._id,
                    MAX: maxPlan._id,
                },
            });

            console.log(`   ✅ Plans created for ${superAdmin.organizationName}`);
        }

        console.log('\n🎉 Plan setup completed successfully!');
    } catch (error) {
        console.error('❌ Error setting up plans:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from database');
    }
}

// Run the setup
setupPlans();
