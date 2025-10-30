import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'drjsde@gmail.com';

async function clearOwnerBackupKeys() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get Owner model
        const OwnerSchema = new mongoose.Schema({
            email: String,
            backupKeys: Array,
        });
        
        const Owner = mongoose.models.Owner || mongoose.model('Owner', OwnerSchema);

        console.log(`🔍 Finding owner with email: ${OWNER_EMAIL}`);
        const owner = await Owner.findOne({ email: OWNER_EMAIL }).select('+backupKeys');

        if (!owner) {
            console.log('❌ Owner not found in database');
            process.exit(1);
        }

        console.log(`📋 Current backup keys count: ${owner.backupKeys?.length || 0}`);

        if (!owner.backupKeys || owner.backupKeys.length === 0) {
            console.log('✅ No backup keys to clear');
        } else {
            // Clear all backup keys
            owner.backupKeys = [];
            await owner.save();
            console.log('✅ All database backup keys cleared!');
            console.log('💡 You can now use environment backup keys from .env file:');
            console.log('   - OWNER2025KEY1');
            console.log('   - OWNER2025KEY2');
            console.log('   - OWNER2025KEY3');
        }

        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

clearOwnerBackupKeys();
