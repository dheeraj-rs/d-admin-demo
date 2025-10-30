import React from 'react';
import Link from 'next/link';
import { dateFormat } from '../../../../lib/utils';
import { WebConfigCardProps } from '../../../../types';
import websiteBuilderStore from '../../../../components/website-builder/store/websiteBuilderStore';

const WebConfigCard: React.FC<WebConfigCardProps> = ({ item, handleDelete, handleEdit }) => {

    const {setWebsitePreview } = websiteBuilderStore();

    const handleView = (e: React.MouseEvent) => {
        setWebsitePreview(true, item._id);
        e.preventDefault();
        e.stopPropagation();
    };
    return (
        <div className="webconfig__card">
            <div className="card-image-container">
                <img src={item.thumbnail || '/images/website-thumbnail.jpg'} alt={`${item.name} screenshot`} className="card-image" loading="lazy" />
                <Link href={`/webconfig/editor/${item._id}`} className="edit-icon" aria-label="Edit website">
                    <i className="pi pi-pencil"></i>
                </Link>
            </div>
            <div className="card-content">
                <div className="card-header">
                    <h3 className="card-title" title={item.name}>
                        {item.name}
                    </h3>
                </div>
                <div className="card-dates">
                    <div className="date-row">
                        <span className="date-label">Created:</span>
                        <span className="date-value">{dateFormat(item.createdAt)}</span>
                    </div>
                    <div className="date-row">
                        <span className="date-label">Updated:</span>
                        <span className="date-value">{dateFormat(item.updatedAt)}</span>
                    </div>
                </div>
                <div className="card-actions">
                    <button onClick={handleView} className="action-btn view-btn">
                        <i className="pi pi-eye"></i>
                        <span>View</span>
                    </button>
                    <Link href={`/website-builder/${item?._id}`} className="action-btn edit-btn">
                        <i className="pi pi-file-edit"></i>
                        <span>Edit</span>
                    </Link>
                    <button onClick={() => item._id && handleDelete(item._id)} className="action-btn delete-btn" disabled={!item._id}>
                        <i className="pi pi-trash"></i>
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WebConfigCard;
