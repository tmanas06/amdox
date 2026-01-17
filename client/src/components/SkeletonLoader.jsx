import React from 'react';
import './SkeletonLoader.css';

/**
 * SkeletonLoader Component
 * Provides loading placeholders that match content layout
 */
const SkeletonLoader = ({ 
  variant = 'text',
  width = '100%',
  height = 'auto',
  lines = 1,
  className = '',
  animate = true
}) => {
  const baseClass = `skeleton ${animate ? 'skeleton--animate' : ''} ${className}`;

  // Text skeleton with multiple lines
  if (variant === 'text') {
    return (
      <div className={`${baseClass} skeleton--text`} style={{ width }}>
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className="skeleton__line"
            style={{
              width: index === lines - 1 && lines > 1 ? '75%' : '100%'
            }}
          />
        ))}
      </div>
    );
  }

  // Rectangle skeleton
  if (variant === 'rect') {
    return (
      <div
        className={`${baseClass} skeleton--rect`}
        style={{ width, height }}
      />
    );
  }

  // Circle skeleton (for avatars)
  if (variant === 'circle') {
    const size = typeof width === 'string' ? width : `${width}px`;
    return (
      <div
        className={`${baseClass} skeleton--circle`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Card skeleton
  if (variant === 'card') {
    return (
      <div className={`${baseClass} skeleton--card`} style={{ width }}>
        <div className="skeleton__card-header">
          <div className="skeleton--circle" style={{ width: '40px', height: '40px' }} />
          <div className="skeleton__card-title">
            <div className="skeleton--text">
              <div className="skeleton__line" style={{ width: '60%' }} />
            </div>
            <div className="skeleton--text">
              <div className="skeleton__line" style={{ width: '40%' }} />
            </div>
          </div>
        </div>
        <div className="skeleton__card-content">
          <div className="skeleton--text">
            <div className="skeleton__line" />
            <div className="skeleton__line" />
            <div className="skeleton__line" style={{ width: '75%' }} />
          </div>
        </div>
      </div>
    );
  }

  // Job card skeleton
  if (variant === 'job-card') {
    return (
      <div className={`${baseClass} skeleton--job-card`}>
        <div className="skeleton__job-header">
          <div className="skeleton--rect" style={{ width: '48px', height: '48px', borderRadius: '8px' }} />
          <div className="skeleton__job-info">
            <div className="skeleton--text">
              <div className="skeleton__line" style={{ width: '70%' }} />
            </div>
            <div className="skeleton--text">
              <div className="skeleton__line" style={{ width: '50%' }} />
            </div>
          </div>
          <div className="skeleton--circle" style={{ width: '24px', height: '24px' }} />
        </div>
        <div className="skeleton__job-tags">
          <div className="skeleton--rect" style={{ width: '60px', height: '24px', borderRadius: '12px' }} />
          <div className="skeleton--rect" style={{ width: '80px', height: '24px', borderRadius: '12px' }} />
          <div className="skeleton--rect" style={{ width: '70px', height: '24px', borderRadius: '12px' }} />
        </div>
        <div className="skeleton__job-meta">
          <div className="skeleton--text">
            <div className="skeleton__line" style={{ width: '40%' }} />
          </div>
          <div className="skeleton--text">
            <div className="skeleton__line" style={{ width: '30%' }} />
          </div>
        </div>
        <div className="skeleton__job-description">
          <div className="skeleton--text">
            <div className="skeleton__line" />
            <div className="skeleton__line" />
            <div className="skeleton__line" style={{ width: '60%' }} />
          </div>
        </div>
        <div className="skeleton__job-actions">
          <div className="skeleton--rect" style={{ width: '80px', height: '36px', borderRadius: '6px' }} />
          <div className="skeleton--rect" style={{ width: '100px', height: '36px', borderRadius: '6px' }} />
        </div>
      </div>
    );
  }

  // Default rectangle
  return (
    <div
      className={`${baseClass} skeleton--rect`}
      style={{ width, height }}
    />
  );
};

/**
 * JobCardSkeleton - Specialized skeleton for job cards
 */
export const JobCardSkeleton = ({ count = 1 }) => (
  <div className="skeleton-container">
    {Array.from({ length: count }, (_, index) => (
      <SkeletonLoader key={index} variant="job-card" />
    ))}
  </div>
);

/**
 * StatCardSkeleton - Specialized skeleton for dashboard stat cards
 */
export const StatCardSkeleton = ({ count = 4 }) => (
  <div className="skeleton-stats-grid">
    {Array.from({ length: count }, (_, index) => (
      <div key={index} className="skeleton--stat-card">
        <div className="skeleton__stat-header">
          <div className="skeleton--text">
            <div className="skeleton__line" style={{ width: '60%' }} />
          </div>
          <div className="skeleton--text">
            <div className="skeleton__line" style={{ width: '30%' }} />
          </div>
        </div>
        <div className="skeleton__stat-value">
          <div className="skeleton--text">
            <div className="skeleton__line" style={{ width: '40%', height: '32px' }} />
          </div>
        </div>
        <div className="skeleton__stat-description">
          <div className="skeleton--text">
            <div className="skeleton__line" style={{ width: '80%' }} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/**
 * ProfileSkeleton - Specialized skeleton for profile sections
 */
export const ProfileSkeleton = () => (
  <div className="skeleton--profile">
    <div className="skeleton__profile-header">
      <div className="skeleton--circle" style={{ width: '80px', height: '80px' }} />
      <div className="skeleton__profile-info">
        <div className="skeleton--text">
          <div className="skeleton__line" style={{ width: '60%' }} />
        </div>
        <div className="skeleton--text">
          <div className="skeleton__line" style={{ width: '40%' }} />
        </div>
        <div className="skeleton--text">
          <div className="skeleton__line" style={{ width: '50%' }} />
        </div>
      </div>
    </div>
    <div className="skeleton__profile-content">
      <div className="skeleton--text">
        <div className="skeleton__line" />
        <div className="skeleton__line" />
        <div className="skeleton__line" />
        <div className="skeleton__line" style={{ width: '75%' }} />
      </div>
    </div>
  </div>
);

export default SkeletonLoader;