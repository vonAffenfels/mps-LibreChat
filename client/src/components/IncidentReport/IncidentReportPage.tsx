import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Scale, Bug, ExternalLink, Mail, Phone } from 'lucide-react';
import { useLocalize } from '~/hooks';

interface IncidentType {
  id: string;
  title: string;
  icon: string;
  description: string;
  target: string;
  targetType: 'email' | 'external';
  contact: string;
}

interface EmergencyContact {
  number: string;
}

interface WhistleblowerInfo {
  url: string;
  description: string;
}

interface HelpSection {
  title: string;
  description: string;
}

interface IncidentConfig {
  incidents: IncidentType[];
  contacts: {
    emergency: EmergencyContact;
  };
  whistleblower: WhistleblowerInfo;
  helpSection: HelpSection;
}

const iconMap: Record<string, React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>> = {
  '🔒': AlertTriangle,
  '🛡️': Shield,
  '⚖️': Scale,
  '🐛': Bug,
};

export default function IncidentReportPage() {
  const localize = useLocalize();
  const [incidentData, setIncidentData] = useState<IncidentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadIncidentConfig = async () => {
      try {
        const response = await fetch('/static/incident-config.json');
        if (!response.ok) {
          throw new Error('Failed to load incident configuration');
        }
        const data = await response.json();
        setIncidentData(data);
      } catch (err) {
        console.error('Error loading incident configuration:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadIncidentConfig();
  }, []);

  const handleIncidentClick = (incident: IncidentType) => {
    if (incident.targetType === 'email') {
      window.location.href = `mailto:${incident.target}`;
    } else {
      window.open(incident.target, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-text-primary" role="status" aria-live="polite">
          {localize('com_ui_incident_report_loading')}
        </div>
      </div>
    );
  }

  if (error || !incidentData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-red-500" role="alert" aria-live="assertive">
          {localize('com_ui_incident_report_error')}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center overflow-y-auto bg-surface-primary">
      <div className="w-full max-w-5xl px-4 py-8 md:px-8 md:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text-primary md:text-4xl">
            {localize('com_ui_incident_report_title')}
          </h1>
          <p className="mt-4 text-text-secondary">
            {localize('com_ui_incident_report_description')}
          </p>
        </div>

        {/* Incident Type Cards Grid */}
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {incidentData.incidents.map((incident) => {
            const IconComponent = iconMap[incident.icon] || AlertTriangle;
            return (
              <button
                key={incident.id}
                onClick={() => handleIncidentClick(incident)}
                className="group flex flex-col items-start rounded-lg border-2 border-border-light bg-surface-secondary p-6 text-left transition-all hover:border-ring-primary hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring-primary"
                aria-label={`${incident.title}: ${incident.description}`}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-full bg-surface-primary p-3 transition-colors group-hover:bg-surface-hover">
                    <IconComponent
                      className="h-6 w-6 text-text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <h2 className="text-xl font-semibold text-text-primary">
                    {incident.title}
                  </h2>
                </div>
                <p className="mb-4 text-text-secondary">
                  {incident.description}
                </p>
                <div className="mt-auto flex items-center gap-2 text-sm text-text-secondary">
                  {incident.targetType === 'email' ? (
                    <>
                      <Mail className="h-4 w-4" aria-hidden="true" />
                      <span>{incident.contact}</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      <span className="group-hover:underline">
                        Zum Meldeformular
                      </span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Help Section */}
        <div className="mb-8 rounded-lg border border-border-light bg-surface-secondary p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-text-primary">
            {incidentData.helpSection.title}
          </h2>
          <p className="mb-4 text-text-secondary">
            {incidentData.helpSection.description}
          </p>

          <div className="space-y-3">
            {/* Contact List */}
            {incidentData.incidents.map((incident) => (
              <div
                key={`help-${incident.id}`}
                className="flex items-start gap-3 text-sm"
              >
                <Mail className="mt-1 h-4 w-4 flex-shrink-0 text-text-secondary" aria-hidden="true" />
                <span className="text-text-secondary">{incident.contact}</span>
              </div>
            ))}

            {/* Emergency Contact */}
            <div className="mt-4 flex items-start gap-3 rounded-md bg-surface-primary p-3 text-sm">
              <Phone className="mt-1 h-4 w-4 flex-shrink-0 text-text-secondary" aria-hidden="true" />
              <div>
                <div className="font-medium text-text-primary">
                  {localize('com_ui_incident_emergency_contact')}
                </div>
                <div className="text-text-secondary">
                  {incidentData.contacts.emergency.number}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Whistleblower Section */}
        <div className="rounded-lg border border-border-light bg-surface-secondary p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-surface-primary p-3">
              <Shield className="h-6 w-6 text-text-primary" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h2 className="mb-2 text-xl font-semibold text-text-primary">
                {localize('com_nav_whistleblower')}
              </h2>
              <p className="mb-4 text-text-secondary">
                {incidentData.whistleblower.description}
              </p>
              <a
                href={incidentData.whistleblower.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-surface-primary px-4 py-2 font-medium text-text-primary transition-colors hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-ring-primary"
                aria-label={`${localize('com_nav_whistleblower')} - Opens in new tab`}
              >
                <span>Zum Whistleblower-System</span>
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
