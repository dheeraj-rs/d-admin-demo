const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const SuperAdmin = require('../models/SuperAdmin');
const PlanConfiguration = require('../models/PlanConfiguration');

async function createTestSuperAdmin() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database');

        // Check if test SuperAdmin already exists
        const existingSuperAdmin = await SuperAdmin.findOne({ email: 'test@example.com' });
        
        if (existingSuperAdmin) {
            console.log('⚠️  Test SuperAdmin already exists');
            return;
        }

        // Create test SuperAdmin
        const testSuperAdmin = new SuperAdmin({
            email: 'test@example.com',
            googleId: 'test_google_id',
            name: 'Test SuperAdmin',
            organizationName: 'Test Organization',
            industry: 'Technology',
            companySize: '1-10',
            country: 'US',
            approvalStatus: 'approved',
            approvedBy: 'system',
            approvedAt: new Date(),
            isActive: true
        });

        await testSuperAdmin.save();
        console.log('✅ Test SuperAdmin created:', testSuperAdmin.organizationName);

        // Create plan configurations
        const freePlan = new PlanConfiguration({
            superAdminId: testSuperAdmin._id,
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
                customFeatures: []
            },
            price: {
                monthly: 0,
                yearly: 0,
                currency: 'USD'
            }
        });

        const proPlan = new PlanConfiguration({
            superAdminId: testSuperAdmin._id,
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
                allowedPages: ['/', '/elements', '/add-elements', '/website-builder', '/ai-websites', '/webconfig', '/websites', '/knowledge', '/webconfig/portfolio', '/analytics'],
                restrictedPages: ['/api', '/webhooks'],
                customFeatures: []
            },
            price: {
                monthly: 29,
                yearly: 290,
                currency: 'USD'
            }
        });

        const maxPlan = new PlanConfiguration({
            superAdminId: testSuperAdmin._id,
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
                        description: '24/7 priority support'
                    },
                    {
                        name: 'Custom Integrations',
                        enabled: true,
                        description: 'Custom API integrations'
                    }
                ]
            },
            price: {
                monthly: 99,
                yearly: 990,
                currency: 'USD'
            }
        });

        // Save all plans
        await Promise.all([freePlan.save(), proPlan.save(), maxPlan.save()]);

        // Update SuperAdmin with plan references
        await SuperAdmin.findByIdAndUpdate(testSuperAdmin._id, {
            planConfigurations: {
                FREE: freePlan._id,
                PRO: proPlan._id,
                MAX: maxPlan._id
            }
        });

        console.log('✅ Plan configurations created for test SuperAdmin');
        console.log('🎉 Test setup completed successfully!');
        console.log('\nYou can now test the system with:');
        console.log('- SuperAdmin ID:', testSuperAdmin._id);
        console.log('- Organization:', testSuperAdmin.organizationName);
        console.log('- Database:', testSuperAdmin.databaseName);
    } catch (error) {
        console.error('❌ Error creating test SuperAdmin:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from database');
    }
}

// Run the setup
createTestSuperAdmin();
