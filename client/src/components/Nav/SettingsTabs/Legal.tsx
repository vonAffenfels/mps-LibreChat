import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LinkIcon } from '@librechat/client';
import { useLocalize } from '~/hooks';

interface LegalProps {
  onOpenChange?: (open: boolean) => void;
}

export default function Legal({ onOpenChange }: LegalProps) {
  const localize = useLocalize();
  const navigate = useNavigate();

  const handlePrivacyPolicyClick = () => {
    // Dispatch custom event to open teaser modal
    window.dispatchEvent(new CustomEvent('openPrivacyPolicyTeaser'));
  };

  const handleNavigate = (path: string) => {
    if (onOpenChange) {
      onOpenChange(false);
    }
    navigate(path);
  };

  return (
    <div className="flex flex-col gap-3 p-1 text-sm text-text-primary">
      <div className="pb-3">
        <button
          onClick={() => handleNavigate('/legal/imprint')}
          className="flex items-center space-x-2 text-text-primary transition-colors hover:text-text-secondary"
        >
          <LinkIcon aria-hidden="true" />
          <span className="font-light">{localize('com_nav_impressum')}</span>
        </button>
      </div>
      <div className="pb-3">
        <button
          onClick={() => handleNavigate('/legal/usage-policy')}
          className="flex items-center space-x-2 text-text-primary transition-colors hover:text-text-secondary"
        >
          <LinkIcon aria-hidden="true" />
          <span className="font-light">{localize('com_nav_usage_policy')}</span>
        </button>
      </div>
      <div className="pb-3">
        <button
          onClick={handlePrivacyPolicyClick}
          className="flex items-center space-x-2 text-text-primary transition-colors hover:text-text-secondary"
        >
          <LinkIcon aria-hidden="true" />
          <span className="font-light">{localize('com_nav_privacy_policy')}</span>
        </button>
      </div>
      <div className="pb-3">
        <button
          onClick={() => handleNavigate('/faq')}
          className="flex items-center space-x-2 text-text-primary transition-colors hover:text-text-secondary"
        >
          <LinkIcon aria-hidden="true" />
          <span className="font-light">{localize('com_nav_faq')}</span>
        </button>
      </div>
    </div>
  );
}
