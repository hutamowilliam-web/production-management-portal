import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from './common/LoadingSpinner';

/**
 * PowerAppsPortal Component
 * Embeds Power Apps canvas app or portal within React application
 */
export interface PowerAppsPortalProps {
  /** Power Apps app ID */
  appId?: string;
  /** Azure Tenant ID */
  tenantId?: string;
  /** Portal URL (alternative to appId) */
  portalUrl?: string;
  /** Custom title for the embedded app */
  title?: string;
  /** Height of the iframe (default: 100vh) */
  height?: string;
  /** Custom CSS class */
  className?: string;
  /** On load callback */
  onLoad?: () => void;
  /** On error callback */
  onError?: (error: Error) => void;
}

/**
 * PowerAppsPortal Component
 * Embeds Power Apps application within the React frontend
 */
export const PowerAppsPortal: React.FC<PowerAppsPortalProps> = ({
  appId,
  tenantId,
  portalUrl,
  title = 'Power Apps Portal',
  height = '100vh',
  className = '',
  onLoad,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Build Power Apps URL
  const getPowerAppsUrl = (): string => {
    if (portalUrl) {
      return portalUrl;
    }

    if (appId && tenantId) {
      // Format: https://apps.powerapps.com/play/[APP_ID]?tenantId=[TENANT_ID]
      return `https://apps.powerapps.com/play/${appId}?tenantId=${tenantId}`;
    }

    throw new Error('Either appId+tenantId or portalUrl must be provided');
  };

  useEffect(() => {
    try {
      setIsLoading(true);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      onError?.(new Error(errorMessage));
    }
  }, [appId, tenantId, portalUrl, onError]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleIframeError = (event: React.SyntheticEvent<HTMLIFrameElement>) => {
    const errorMessage = 'Failed to load Power Apps portal';
    setError(errorMessage);
    setIsLoading(false);
    onError?.(new Error(errorMessage));
  };

  if (error) {
    return (
      <div
        className={`w-full p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Power Apps</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  try {
    const powerAppsUrl = getPowerAppsUrl();

    return (
      <div className={`relative w-full ${className}`} style={{ height }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <LoadingSpinner />
          </div>
        )}
        <iframe
          title={title}
          src={powerAppsUrl}
          className="w-full h-full border-0"
          allow="geolocation microphone camera accelerometer gyroscope"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-same-origin allow-popups allow-forms allow-presentation allow-scripts"
        />
      </div>
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Configuration error';
    return (
      <div
        className={`w-full p-6 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            Power Apps Configuration Error
          </h3>
          <p className="text-yellow-700">{errorMessage}</p>
        </div>
      </div>
    );
  }
};

/**
 * PowerAppsStatus Component
 * Displays Power Apps integration status and connection information
 */
export interface PowerAppsStatusProps {
  /** Callback to check health */
  onHealthCheck?: () => Promise<any>;
}

export const PowerAppsStatus: React.FC<PowerAppsStatusProps> = ({ onHealthCheck }) => {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    try {
      setStatus('checking');
      setError(null);

      const response = await fetch('/api/power-apps/health', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatus('connected');
        setDetails(data);
      } else {
        setStatus('disconnected');
        setError('Power Apps service is not responding');
      }
    } catch (err) {
      setStatus('disconnected');
      setError(err instanceof Error ? err.message : 'Health check failed');
    }
  };

  useEffect(() => {
    checkHealth();
    onHealthCheck?.();
  }, [onHealthCheck]);

  const statusColor = {
    connected: 'bg-green-100 text-green-800 border-green-300',
    disconnected: 'bg-red-100 text-red-800 border-red-300',
    checking: 'bg-blue-100 text-blue-800 border-blue-300'
  };

  const statusIcon = {
    connected: '✓',
    disconnected: '✗',
    checking: '⟳'
  };

  return (
    <div className={`p-4 rounded-lg border ${statusColor[status]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold">{statusIcon[status]}</span>
          <div>
            <h4 className="font-semibold capitalize">
              Power Apps {status === 'checking' ? 'Checking...' : status}
            </h4>
            {error && <p className="text-sm opacity-75">{error}</p>}
            {details && status === 'connected' && (
              <p className="text-sm opacity-75">
                Org: {details.organizationId?.substring(0, 8)}... • Updated: {new Date(details.timestamp).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={checkHealth}
          disabled={status === 'checking'}
          className="px-3 py-1 text-sm font-medium rounded opacity-75 hover:opacity-100 disabled:opacity-50 transition"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

/**
 * PowerAppsSyncButton Component
 * Button to manually trigger synchronization with Power Apps
 */
export interface PowerAppsSyncButtonProps {
  /** Type of sync: 'form', 'response', or 'all' */
  syncType: 'form' | 'response' | 'all-forms' | 'all-responses';
  /** Resource ID for form/response sync */
  resourceId?: number;
  /** Callback on sync complete */
  onSyncComplete?: (result: any) => void;
  /** Callback on sync error */
  onSyncError?: (error: Error) => void;
}

export const PowerAppsSyncButton: React.FC<PowerAppsSyncButtonProps> = ({
  syncType,
  resourceId,
  onSyncComplete,
  onSyncError
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      setMessage(null);

      let endpoint = '/api/power-apps/sync-all-forms';
      let body: any = {};

      switch (syncType) {
        case 'form':
          endpoint = '/api/power-apps/sync-form';
          body = { formId: resourceId };
          break;
        case 'response':
          endpoint = '/api/power-apps/sync-response';
          body = { responseId: resourceId };
          break;
        case 'all-responses':
          endpoint = '/api/power-apps/sync-all-responses';
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({
          type: 'success',
          text: result.message || 'Sync completed successfully'
        });
        onSyncComplete?.(result);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Sync failed');
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setMessage({
        type: 'error',
        text: err.message
      });
      onSyncError?.(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const buttonLabels = {
    form: 'Sync This Form',
    response: 'Sync This Response',
    'all-forms': 'Sync All Forms',
    'all-responses': 'Sync All Responses'
  };

  const messageColors = {
    success: 'bg-green-100 text-green-800 border-green-300',
    error: 'bg-red-100 text-red-800 border-red-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300'
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 transition font-medium"
      >
        {isSyncing ? 'Syncing...' : buttonLabels[syncType]}
      </button>
      {message && (
        <div className={`p-3 rounded border ${messageColors[message.type]}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default PowerAppsPortal;
