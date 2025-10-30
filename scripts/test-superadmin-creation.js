/**
 * Test script to verify SuperAdmin creation with auto-generated fields
 * Run: node scripts/test-superadmin-creation.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function testSuperAdminCreation() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Import SuperAdmin model
        const SuperAdmin = require('../models/SuperAdmin').default;

        // Test data
        const testData = {
            googleId: 'test_google_id_' + Date.now(),
            email: `test${Date.now()}@example.com`,
            name: 'Test SuperAdmin',
            organizationName: 'Test Organization Inc.',
            industry: 'Technology',
            website: 'https://test.com',
            companySize: '11-50',
            country: 'USA',
            approvalStatus: 'pending'
        };

        console.log('\n📝 Creating SuperAdmin with data:');
        console.log(JSON.stringify(testData, null, 2));

        // Create new SuperAdmin
        const newSuperAdmin = new SuperAdmin(testData);
        
        console.log('\n⏳ Saving SuperAdmin (pre-save hook will generate fields)...');
        await newSuperAdmin.save();

        console.log('\n✅ SuperAdmin created successfully!');
        console.log('📊 Generated fields:');
        console.log('   - organizationKey:', newSuperAdmin.organizationKey);
        console.log('   - databaseName:', newSuperAdmin.databaseName);
        console.log('   - _id:', newSuperAdmin._id);

        // Verify fields were generated
        if (!newSuperAdmin.organizationKey) {
            throw new Error('❌ organizationKey was not generated!');
        }
        if (!newSuperAdmin.databaseName) {
            throw new Error('❌ databaseName was not generated!');
        }

        console.log('\n✅ All fields generated correctly!');
        console.log('\n🎉 Test PASSED!');

        // Clean up - delete test record
        await SuperAdmin.findByIdAndDelete(newSuperAdmin._id);
        console.log('\n🧹 Test record cleaned up');

    } catch (error) {
        console.error('\n❌ Test FAILED:', error.message);
        console.error('Error details:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

testSuperAdminCreation();
