import React, { useState } from 'react';

/**
 * Wrapper that adds an expand/fullscreen toggle to any card.
 * When expanded, the card fills the viewport as a modal overlay.
 */
export default function ExpandableCard({ children, title, tourId, className = '' }) {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('expand-overlay')) {
      setExpanded(false);
    }
  };

  // Handle escape key
  React.useEffect(() => {
    if (!expanded) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [expanded]);

  return (
    <>
      <div
        className={`expandable-card-wrapper ${className}`}
        data-tour={tourId}
      >
        <button
          className="expand-btn"
          onClick={handleToggle}
          title="Expand view"
          aria-label="Expand view"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 5V1H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 5V1H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M1 9V13H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 9V13H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {children}
      </div>

      {/* Fullscreen overlay */}
      {expanded && (
        <div className="expand-overlay" onClick={handleOverlayClick}>
          <div className="expand-modal">
            <div className="expand-modal-header">
              <span className="expand-modal-title">{title}</span>
              <button className="expand-close-btn" onClick={() => setExpanded(false)}>
                ✕
              </button>
            </div>
            <div className="expand-modal-body">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
