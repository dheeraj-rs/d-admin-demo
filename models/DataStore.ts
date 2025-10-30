import mongoose, { Schema, Document } from 'mongoose';

export interface IDataStore extends Document {
    dataType: string;
    category?: string;
    title: string;
    content: any;
    metadata?: Record<string, any>;
    tags?: string[];
    isDeleted: boolean;
    createdBy?: string;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

const DataStoreSchema: Schema = new Schema(
    {
        dataType: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        category: {
            type: String,
            trim: true,
            index: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: Schema.Types.Mixed,
            required: true
        },
        metadata: {
            type: Map,
            of: Schema.Types.Mixed,
            default: {}
        },
        tags: [{
            type: String,
            trim: true
        }],
        isDeleted: {
            type: Boolean,
            default: false,
            index: true
        },
        createdBy: {
            type: String,
            trim: true
        },
        updatedBy: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

// Indexes for faster queries
DataStoreSchema.index({ dataType: 1, isDeleted: 1 });
DataStoreSchema.index({ category: 1, isDeleted: 1 });
DataStoreSchema.index({ tags: 1 });
DataStoreSchema.index({ createdAt: -1 });

// Export schema for tenant-specific model creation
export { DataStoreSchema };

// For backward compatibility and type exports only
const DataStore = mongoose.models.DataStore || mongoose.model<IDataStore>('DataStore', DataStoreSchema);

export default DataStore;
