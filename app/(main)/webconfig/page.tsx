'use client';
import Link from 'next/link';
import Card from '../../../components/sample/Card/Card';
import { websiteCategories } from '../../../public/demo/data/menuItems';
import '../../../styles/pages/webconfig/index.scss';

function WebconfigLists() {
    return (
        <div className="children__wrapper">
            <div className="webconfig__lists-wrapper">
                <div className="webconfig-grid">
                    {websiteCategories.map((category) => (
                        <div key={category.id} className="card-wrapper">
                            <Card className={`website-card ${category.color}`}>
                                <Link href={category.url} style={{ textDecoration: 'none' }}>
                                    <div className="card-header">
                                        <div className="card-content">
                                            <h3 className="title">{category.title}</h3>
                                            <div className="count">{category.count} sites</div>
                                        </div>
                                        <div className="icon-wrapper">
                                            <i className={category.icon} />
                                        </div>
                                    </div>
                                    <div className="card-content">
                                        <p className="description">{category.description}</p>
                                    </div>
                                    <div className="card-footer">
                                        <span className="status">
                                            <i className="pi pi-check-circle" />
                                            Active Sites
                                        </span>
                                    </div>
                                </Link>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default WebconfigLists;
