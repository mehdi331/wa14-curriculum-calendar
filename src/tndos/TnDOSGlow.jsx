import React from 'react';

export default function TnDOSGlow({ label = 'Loading' }) {
  return (
    <div className="tndos-glow-loading" role="status" aria-live="polite">
      <span className="tndos-glow-logo">TnDOS</span>
      {label && <span className="tndos-loading-label">{label}</span>}
    </div>
  );
}
