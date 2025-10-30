import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'drjsde@gmail.com';

// The 6 keys from your database screenshot
const BACKUP_KEYS = [
    'WEG1UEUF1',
    'L9UTHV5VH',
    'Q8V29D2W8',
    '7Y392Q46T',
    'G9BCTY04U',
    'QN4P4HTK0',
];

async function restoreOwnerBackupKeys() {
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

        // Restore the backup keys
        owner.backupKeys = BACKUP_KEYS.map(key => ({
            key: key,
            generatedAt: new Date(),
            isActive: true,
            lastUsed: null,
        }));

        await owner.save();

        console.log('✅ Database backup keys restored!');
        console.log('\n🔑 Your 6 backup keys:');
        BACKUP_KEYS.forEach((key, index) => {
            console.log(`   ${index + 1}. ${key}`);
        });

        console.log('\n💡 Now restart your dev server and try logging in with one of these keys');

        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

restoreOwnerBackupKeys();
