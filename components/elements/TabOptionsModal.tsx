'use client';
import React from 'react';

interface TabOptionsModalProps {
  isVisible: boolean;
  position: { top: number; left: number };
  modalRef: React.RefObject<HTMLDivElement | null>;
  activeTabId: string | null;
  onEditTab: (id: string) => void;
  onRemoveTab: (id: string) => void;
}

const TabOptionsModal = ({
  isVisible,
  position,
  modalRef,
  activeTabId,
  onEditTab,
  onRemoveTab
}: TabOptionsModalProps) => {
  if (!isVisible || !activeTabId) return null;
  
  return (
    <div
      ref={modalRef}
      className="element-code-tab-editor__wrapper"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <button className="tab-option-item" onClick={() => onEditTab(activeTabId)}>
        Edit
      </button>
      <button className="tab-option-item" onClick={() => onRemoveTab(activeTabId)}>
        Remove
      </button>
    </div>
  );
};

export default TabOptionsModal; 