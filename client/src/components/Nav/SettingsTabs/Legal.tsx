import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LinkIcon } from '@librechat/client';
import { useLocalize } from '~/hooks';

export default function Legal() {
  const localize = useLocalize();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-3 p-1 text-sm text-text-primary">
      <div className="pb-3">
        <button
          onClick={() => navigate('/legal/imprint')}
          className="flex items-center space-x-2 text-text-primary transition-colors hover:text-text-secondary"
        >
          <LinkIcon aria-hidden="true" />
          <span className="font-light">{localize('com_nav_impressum')}</span>
        </button>
      </div>
      <div className="pb-3">
        <button
          onClick={() => navigate('/legal/usage-policy')}
          className="flex items-center space-x-2 text-text-primary transition-colors hover:text-text-secondary"
        >
          <LinkIcon aria-hidden="true" />
          <span className="font-light">{localize('com_nav_usage_policy')}</span>
        </button>
      </div>
    </div>
  );
}
