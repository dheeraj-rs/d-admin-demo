'use client';
import { Handle, Position } from 'reactflow';
import SectionPreview from './SectionPreview';

const SectionNode = ({ data }: { data: any }) => {
    return (
        <div className="section-node">
            <Handle
                type="target"
                position={Position.Top}
                className="connection-handle"
                style={{ background: '#94a3b8' }}
            />
            <div className="section-node-content">
                <SectionPreview Section={data.section} />
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                className="connection-handle"
                style={{ background: '#94a3b8' }}
            />
        </div>
    );
};

export default SectionNode; 