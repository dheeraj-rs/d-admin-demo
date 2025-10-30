/**
 * Migration Script: Update Database to New Role System
 * 
 * This script helps migrate existing data to the new role-based system:
 * OLD: admin, superadmin, user, moderator
 * NEW: owner, superadmin, account (with plans: free, pro, max)
 * 
 * Run this script ONCE after deploying the new role system.
 */

import { connectDB } from '../lib/mongodb';
import SuperAdmin from '../models/SuperAdmin';
import Account from '../models/Account';
import User from '../models/User';

async function migrateRoles() {
    console.log('🚀 Starting role migration...\n');

    try {
        await connectDB();
        console.log('✅ Connected to database\n');

        // Step 1: Update all SuperAdmin documents to include role field
        console.log('📝 Step 1: Updating SuperAdmin documents...');
        const superAdminResult = await SuperAdmin.updateMany(
            { role: { $exists: false } },
            { $set: { role: 'superadmin' } }
        );
        console.log(`   Updated ${superAdminResult.modifiedCount} SuperAdmin documents\n`);

        // Step 2: Update User documents to include organizationKey if needed
        console.log('📝 Step 2: Updating User documents...');
        const userResult = await User.updateMany(
            { organizationKey: { $exists: false } },
            { $set: { organizationKey: null, superAdminId: null } }
        );
        console.log(`   Updated ${userResult.modifiedCount} User documents\n`);

        // Step 3: Log accounts that might need manual review
        console.log('📝 Step 3: Checking for accounts that need review...');
        const usersWithoutOrg = await User.find({
            organizationKey: null,
            isActive: true,
        }).countDocuments();
        
        if (usersWithoutOrg > 0) {
            console.log(`   ⚠️  Found ${usersWithoutOrg} active users without organization association`);
            console.log('   These users may need to be manually assigned to a SuperAdmin organization\n');
        } else {
            console.log('   ✅ All users have organization associations\n');
        }

        // Step 4: Verify all SuperAdmins have databaseName
        console.log('📝 Step 4: Verifying SuperAdmin database names...');
        const superAdminsWithoutDB = await SuperAdmin.find({
            databaseName: { $exists: false },
            isActive: true,
        });
        
        if (superAdminsWithoutDB.length > 0) {
            console.log(`   ⚠️  Found ${superAdminsWithoutDB.length} SuperAdmins without database names`);
            console.log('   These need to be regenerated:');
            for (const sa of superAdminsWithoutDB) {
                console.log(`      - ${sa.email}: ${sa.organizationName}`);
            }
            console.log();
        } else {
            console.log('   ✅ All SuperAdmins have database names\n');
        }

        // Step 5: Summary
        console.log('📊 Migration Summary:');
        const totalSuperAdmins = await SuperAdmin.countDocuments({ isActive: true });
        const totalUsers = await User.countDocuments({ isActive: true });
        
        console.log(`   - Active SuperAdmins: ${totalSuperAdmins}`);
        console.log(`   - Active Users: ${totalUsers}`);
        console.log();

        console.log('✅ Migration completed successfully!\n');
        console.log('🔍 Next Steps:');
        console.log('   1. Review any warnings above');
        console.log('   2. Test authentication with different roles');
        console.log('   3. Verify permissions are working correctly');
        console.log('   4. Update any hardcoded role references in your code\n');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

// Run migration if this script is executed directly
if (require.main === module) {
    migrateRoles()
        .then(() => {
            console.log('Migration script finished.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration script failed:', error);
            process.exit(1);
        });
}

export default migrateRoles;
