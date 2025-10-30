'use client';
import React from 'react';

interface LanguageSelectorModalProps {
  isVisible: boolean;
  position: { top: number; left: number };
  modalRef: React.RefObject<HTMLDivElement | null>;
  isEditing: boolean;
  availableLanguages: Array<{ value: string; label: string }>;
  onSelectLanguage: (language: string) => void;
}

const LanguageSelectorModal = ({
  isVisible,
  position,
  modalRef,
  isEditing,
  availableLanguages,
  onSelectLanguage
}: LanguageSelectorModalProps) => {
  if (!isVisible) return null;
  
  return (
    <div
      ref={modalRef}
      className="element-code-language-add__wrapper"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="language-selector-header">{isEditing ? 'Change Language' : 'Add Language'}</div>
      {availableLanguages.length > 0 ? (
        availableLanguages.map((option) => (
          <button 
            key={option.value} 
            className="tab-option-item" 
            onClick={() => onSelectLanguage(option.value)}
          >
            {option.label}
          </button>
        ))
      ) : (
        <div className="no-languages-available">All languages are already added</div>
      )}
    </div>
  );
};

export default LanguageSelectorModal; 