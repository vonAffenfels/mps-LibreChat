import React from 'react';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocalize } from '~/hooks';
import { TooltipAnchor } from '@librechat/client';

interface AILabelBadgeProps {
  variant?: 'default' | 'compact' | 'header' | 'footer';
  showLinks?: boolean;
  className?: string;
}

export default function AILabelBadge({
  variant = 'default',
  showLinks = false,
  className = ''
}: AILabelBadgeProps) {
  const localize = useLocalize();
  const navigate = useNavigate();

  const tooltipText = localize('com_ui_ai_label_tooltip');
  const labelText = localize('com_ui_ai_assistant');
  const ariaLabel = localize('com_ui_ai_label_aria');

  const handleUsagePolicyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/legal/usage-policy');
  };

  const handleFAQClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/faq');
  };

  // Variant-specific styling
  const variantClasses = {
    default: 'flex items-center gap-2 rounded-lg border border-border-light bg-surface-primary px-3 py-2 text-sm',
    compact: 'flex items-center gap-1.5 rounded-md border border-border-light bg-surface-primary px-2 py-1 text-xs',
    header: 'flex items-center gap-1.5 rounded-md border border-border-light bg-surface-primary-alt px-2 py-1 text-xs',
    footer: 'inline-flex items-center gap-2 rounded-lg border border-border-light bg-surface-primary px-3 py-1.5 text-sm'
  };

  const iconSize = variant === 'compact' || variant === 'header' ? 14 : 16;

  const badgeContent = (
    <div
      className={`${variantClasses[variant]} ${className}`}
      role="status"
      aria-label={ariaLabel}
    >
      <Sparkles
        size={iconSize}
        className="flex-shrink-0 text-text-secondary"
        aria-hidden="true"
      />
      <span className="font-medium text-text-primary">
        {labelText}
      </span>
    </div>
  );

  const badgeWithTooltip = (
    <TooltipAnchor
      description={tooltipText}
      render={badgeContent}
    />
  );

  if (!showLinks) {
    return badgeWithTooltip;
  }

  // Footer variant with links
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      {badgeWithTooltip}
      <div className="flex gap-3 text-xs text-text-secondary">
        <button
          onClick={handleUsagePolicyClick}
          className="hover:text-text-primary transition-colors underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-border-xheavy"
          aria-label={localize('com_nav_usage_policy')}
        >
          {localize('com_nav_usage_policy')}
        </button>
        <span aria-hidden="true">•</span>
        <button
          onClick={handleFAQClick}
          className="hover:text-text-primary transition-colors underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-border-xheavy"
          aria-label={localize('com_nav_faq')}
        >
          {localize('com_nav_faq')}
        </button>
      </div>
    </div>
  );
}
