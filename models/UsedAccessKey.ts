import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUsedAccessKey extends Document {
    _id: mongoose.Types.ObjectId;
    accessKey: string;
    usedBy: {
        superAdminId: mongoose.Types.ObjectId;
        email: string;
        name: string;
        organizationName: string;
    };
    usedAt: Date;
    createdAt: Date;
}

export interface IUsedAccessKeyModel extends Model<IUsedAccessKey> {
    isKeyUsed(accessKey: string): Promise<boolean>;
    markKeyAsUsed(
        accessKey: string,
        superAdminData: {
            superAdminId: mongoose.Types.ObjectId;
            email: string;
            name: string;
            organizationName: string;
        }
    ): Promise<void>;
}

const UsedAccessKeySchema = new Schema<IUsedAccessKey>(
    {
        accessKey: {
            type: String,
            required: true,
            unique: true,
        },
        usedBy: {
            superAdminId: {
                type: Schema.Types.ObjectId,
                ref: 'SuperAdmin',
                required: true,
            },
            email: {
                type: String,
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            organizationName: {
                type: String,
                required: true,
            },
        },
        usedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Static method to check if key is already used
UsedAccessKeySchema.statics.isKeyUsed = async function (accessKey: string): Promise<boolean> {
    const used = await this.findOne({ accessKey });
    return !!used;
};

// Static method to mark key as used
UsedAccessKeySchema.statics.markKeyAsUsed = async function (
    accessKey: string,
    superAdminData: {
        superAdminId: mongoose.Types.ObjectId;
        email: string;
        name: string;
        organizationName: string;
    }
) {
    const usedKey = new this({
        accessKey,
        usedBy: superAdminData,
        usedAt: new Date(),
    });
    await usedKey.save();
};

UsedAccessKeySchema.index({ 'usedBy.superAdminId': 1 });
UsedAccessKeySchema.index({ usedAt: -1 });

const UsedAccessKey: IUsedAccessKeyModel =
    (mongoose.models.UsedAccessKey as IUsedAccessKeyModel) || mongoose.model<IUsedAccessKey, IUsedAccessKeyModel>('UsedAccessKey', UsedAccessKeySchema);

export default UsedAccessKey;
