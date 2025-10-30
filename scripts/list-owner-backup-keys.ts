import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'drjsde@gmail.com';

async function listOwnerBackupKeys() {
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

        console.log('\n📋 Owner Backup Keys Status:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Total keys in database: ${owner.backupKeys?.length || 0}`);
        
        if (owner.backupKeys && owner.backupKeys.length > 0) {
            console.log('\n🔑 Database Backup Keys:');
            owner.backupKeys.forEach((key: any, index: number) => {
                console.log(`\n  Key ${index + 1}:`);
                console.log(`    Key: ${key.key}`);
                console.log(`    Active: ${key.isActive ? '✅' : '❌'}`);
                console.log(`    Generated: ${key.generatedAt?.toLocaleString() || 'Unknown'}`);
                console.log(`    Last Used: ${key.lastUsed?.toLocaleString() || 'Never'}`);
            });
            
            console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('💡 Use one of these keys to login, OR run clear-owner-backup-keys.ts to use .env keys');
        } else {
            console.log('\n✅ No database keys - Using environment keys from .env:');
            console.log('   - OWNER2025KEY1');
            console.log('   - OWNER2025KEY2');
            console.log('   - OWNER2025KEY3');
        }

        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

listOwnerBackupKeys();
