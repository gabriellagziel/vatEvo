'use client';

import { useState, useEffect } from 'react';

interface ApiStatus {
  version: string;
  commit: string;
  buildTime: string;
  regions: string[];
  api: {
    live: boolean;
    ready: boolean;
    db: boolean;
  };
  latencyMs: {
    p50: number | null;
    p95: number | null;
  };
  timestamp: string;
}

export default function StatusPage() {
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('https://app-ezgnqzzi.fly.dev/status');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        setApiStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: boolean) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        status 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {status ? '✓ Operational' : '✗ Down'}
      </span>
    );
  };

  const getOverallStatus = () => {
    if (!apiStatus) return 'Unknown';
    const { api } = apiStatus;
    return api.live && api.ready && api.db ? 'Operational' : 'Degraded';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Vatevo Service Status
            </h1>

            {/* Overall Status */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Overall Status
                </h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  getOverallStatus() === 'Operational'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {getOverallStatus() === 'Operational' ? '✓ All Systems Operational' : '⚠ Service Degraded'}
                </span>
              </div>
            </div>

            {/* API Status */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">API Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">API Live</span>
                    {loading ? (
                      <div className="animate-pulse bg-gray-300 h-6 w-20 rounded"></div>
                    ) : apiStatus ? (
                      getStatusBadge(apiStatus.api.live)
                    ) : (
                      <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                        ✗ Error
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">API Ready</span>
                    {loading ? (
                      <div className="animate-pulse bg-gray-300 h-6 w-20 rounded"></div>
                    ) : apiStatus ? (
                      getStatusBadge(apiStatus.api.ready)
                    ) : (
                      <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                        ✗ Error
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Database</span>
                    {loading ? (
                      <div className="animate-pulse bg-gray-300 h-6 w-20 rounded"></div>
                    ) : apiStatus ? (
                      getStatusBadge(apiStatus.api.db)
                    ) : (
                      <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                        ✗ Error
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* System Information */}
            {apiStatus && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Version</dt>
                      <dd className="mt-1 text-sm text-gray-900">{apiStatus.version}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Commit</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-mono">{apiStatus.commit}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Build Time</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(apiStatus.buildTime).toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Regions</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {apiStatus.regions.join(', ')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(apiStatus.timestamp).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="mb-8">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Unable to fetch status
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* JSON Debug (for development) */}
            {apiStatus && (
              <details className="mt-8">
                <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                  Raw Status Data (Debug)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto">
                  {JSON.stringify(apiStatus, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
