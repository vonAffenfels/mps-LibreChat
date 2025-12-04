import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import type { ContextType } from '~/common';
import {
  useSearchEnabled,
  useAssistantsMap,
  useAuthContext,
  useAgentsMap,
  useFileMap,
  useLocalize,
  useModalNavigation,
  useStaticContent,
} from '~/hooks';
import {
  PromptGroupsProvider,
  AssistantsMapContext,
  AgentsMapContext,
  SetConvoProvider,
  FileMapContext,
} from '~/Providers';
import { useUserTermsQuery, useGetStartupConfig } from '~/data-provider';
import { TermsAndConditionsModal } from '~/components/ui';
import StaticContentModal from '~/components/ui/StaticContentModal';
import { Nav, MobileNav } from '~/components/Nav';
import { useHealthCheck } from '~/data-provider';
import { Banner } from '~/components/Banners';

export default function Root() {
  const [showTerms, setShowTerms] = useState(false);
  const [showImpressum, setShowImpressum] = useState(false);
  const [showUsagePolicy, setShowUsagePolicy] = useState(false);
  const [showPrivacyPolicyFull, setShowPrivacyPolicyFull] = useState(false);
  const [showPrivacyPolicyTeaser, setShowPrivacyPolicyTeaser] = useState(false);
  const [bannerHeight, setBannerHeight] = useState(0);
  const [navVisible, setNavVisible] = useState(() => {
    const savedNavVisible = localStorage.getItem('navVisible');
    return savedNavVisible !== null ? JSON.parse(savedNavVisible) : true;
  });

  const location = useLocation();
  const navigate = useNavigate();
  const localize = useLocalize();
  const { isAuthenticated, logout } = useAuthContext();
  const handleImpressumClose = useModalNavigation('/legal/imprint');
  const handleUsagePolicyClose = useModalNavigation('/legal/usage-policy');
  const handlePrivacyPolicyFullClose = useModalNavigation('/legal/privacy-policy');
  const { content: impressumContent, loadContent: loadImpressum } = useStaticContent(
    '/static/imprint.md',
  );
  const { content: usagePolicyContent, loadContent: loadUsagePolicy } = useStaticContent(
    '/static/usage-policy.md',
  );
  const { content: privacyPolicyFullContent, loadContent: loadPrivacyPolicyFull } =
    useStaticContent('/static/privacy-policy-full.md');
  const { content: privacyPolicyTeaserContent, loadContent: loadPrivacyPolicyTeaser } =
    useStaticContent('/static/privacy-policy-teaser.md');

  // Global health check - runs once per authenticated session
  useHealthCheck(isAuthenticated);

  const assistantsMap = useAssistantsMap({ isAuthenticated });
  const agentsMap = useAgentsMap({ isAuthenticated });
  const fileMap = useFileMap({ isAuthenticated });

  const { data: config } = useGetStartupConfig();
  const { data: termsData } = useUserTermsQuery({
    enabled: isAuthenticated && config?.interface?.termsOfService?.modalAcceptance === true,
  });

  useSearchEnabled(isAuthenticated);

  useEffect(() => {
    if (termsData) {
      setShowTerms(!termsData.termsAccepted);
    }
  }, [termsData]);

  // Check if URL is /legal/imprint and open modal
  useEffect(() => {
    if (location.pathname === '/legal/imprint') {
      setShowImpressum(true);
      loadImpressum();
    }
  }, [location.pathname, loadImpressum]);

  // Check if URL is /legal/usage-policy and open modal
  useEffect(() => {
    if (location.pathname === '/legal/usage-policy') {
      setShowUsagePolicy(true);
      loadUsagePolicy();
    }
  }, [location.pathname, loadUsagePolicy]);

  // Check if URL is /legal/privacy-policy and open full modal
  useEffect(() => {
    if (location.pathname === '/legal/privacy-policy') {
      setShowPrivacyPolicyFull(true);
      loadPrivacyPolicyFull();
    }
  }, [location.pathname, loadPrivacyPolicyFull]);

  // Listen for custom event to open teaser modal
  useEffect(() => {
    const handleOpenTeaserEvent = () => {
      openTeaserModal();
    };
    window.addEventListener('openPrivacyPolicyTeaser', handleOpenTeaserEvent);
    return () => {
      window.removeEventListener('openPrivacyPolicyTeaser', handleOpenTeaserEvent);
    };
  }, []);

  const handleAcceptTerms = () => {
    setShowTerms(false);
  };

  const handleDeclineTerms = () => {
    setShowTerms(false);
    logout('/login?redirect=false');
  };

  const openTeaserModal = () => {
    setShowPrivacyPolicyTeaser(true);
    loadPrivacyPolicyTeaser();
  };

  const closeTeaserModal = () => {
    setShowPrivacyPolicyTeaser(false);
  };

  const handleReadFullVersion = () => {
    // Close teaser modal and navigate to full version
    closeTeaserModal();
    navigate('/legal/privacy-policy');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SetConvoProvider>
      <FileMapContext.Provider value={fileMap}>
        <AssistantsMapContext.Provider value={assistantsMap}>
          <AgentsMapContext.Provider value={agentsMap}>
            <PromptGroupsProvider>
              <Banner onHeightChange={setBannerHeight} />
              <div className="flex" style={{ height: `calc(100dvh - ${bannerHeight}px)` }}>
                <div className="relative z-0 flex h-full w-full overflow-hidden">
                  <Nav navVisible={navVisible} setNavVisible={setNavVisible} />
                  <div className="relative flex h-full max-w-full flex-1 flex-col overflow-hidden">
                    <MobileNav navVisible={navVisible} setNavVisible={setNavVisible} />
                    <Outlet context={{ navVisible, setNavVisible } satisfies ContextType} />
                  </div>
                </div>
              </div>
            </PromptGroupsProvider>
          </AgentsMapContext.Provider>
          {config?.interface?.termsOfService?.modalAcceptance === true && (
            <TermsAndConditionsModal
              open={showTerms}
              onOpenChange={setShowTerms}
              onAccept={handleAcceptTerms}
              onDecline={handleDeclineTerms}
              title={config.interface.termsOfService.modalTitle}
              modalContent={config.interface.termsOfService.modalContent}
            />
          )}
          <StaticContentModal
            open={showImpressum}
            onOpenChange={(isOpen) => handleImpressumClose(isOpen, setShowImpressum)}
            title={localize('com_nav_impressum')}
            modalContent={impressumContent}
          />
          <StaticContentModal
            open={showUsagePolicy}
            onOpenChange={(isOpen) => handleUsagePolicyClose(isOpen, setShowUsagePolicy)}
            title={localize('com_nav_usage_policy')}
            modalContent={usagePolicyContent}
          />
          <StaticContentModal
            open={showPrivacyPolicyFull}
            onOpenChange={(isOpen) =>
              handlePrivacyPolicyFullClose(isOpen, setShowPrivacyPolicyFull)
            }
            title={localize('com_nav_privacy_policy')}
            modalContent={privacyPolicyFullContent}
          />
          <StaticContentModal
            open={showPrivacyPolicyTeaser}
            onOpenChange={closeTeaserModal}
            title={localize('com_nav_privacy_policy')}
            modalContent={privacyPolicyTeaserContent}
            customButtons={
              <button
                onClick={handleReadFullVersion}
                className="btn btn-primary"
                type="button"
              >
                {localize('com_nav_read_full_version')}
              </button>
            }
          />
        </AssistantsMapContext.Provider>
      </FileMapContext.Provider>
    </SetConvoProvider>
  );
}
