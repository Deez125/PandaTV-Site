import { useState, useEffect } from 'react';

export default function PlexServerSelectionModal({ isOpen, onClose, plexAuthToken, onServerSelected }) {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedServer, setSelectedServer] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);

  useEffect(() => {
    if (isOpen && plexAuthToken) {
      fetchServers();
    }
  }, [isOpen, plexAuthToken]);

  const fetchServers = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8787'}/api/plex/servers?auth_token=${encodeURIComponent(plexAuthToken)}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Plex servers');
      }

      const data = await response.json();
      setServers(data.servers || []);

      // Auto-select first server if only one available
      if (data.servers && data.servers.length === 1) {
        const server = data.servers[0];
        setSelectedServer(server);
        if (server.connections && server.connections.length > 0) {
          setSelectedConnection(server.connections[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching servers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectServer = (server) => {
    setSelectedServer(server);
    // Auto-select best connection (first one, which is already sorted by preference)
    if (server.connections && server.connections.length > 0) {
      setSelectedConnection(server.connections[0]);
    } else {
      setSelectedConnection(null);
    }
  };

  const handleConfirm = () => {
    if (selectedServer && selectedConnection) {
      onServerSelected({
        serverUrl: selectedConnection.uri,
        serverName: selectedServer.name,
        serverMachineId: selectedServer.clientIdentifier,
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Select Your Plex Server</h2>
          <p className="text-sm text-slate-400 mt-1">
            Choose which Plex server you want to connect to NovixTV
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-slate-600 border-t-violet-400 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 mb-4">{error}</div>
              <button
                onClick={fetchServers}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg transition"
              >
                Retry
              </button>
            </div>
          ) : servers.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No Plex servers found. Make sure you have a Plex Media Server running.
            </div>
          ) : (
            <div className="space-y-3">
              {servers.map((server) => (
                <div
                  key={server.clientIdentifier}
                  onClick={() => handleSelectServer(server)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                    selectedServer?.clientIdentifier === server.clientIdentifier
                      ? 'border-violet-500 bg-violet-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L2 12h3v8h14v-8h3L12 2zm0 3.5L18 12h-2v6H8v-6H6l6-6.5z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-white">{server.name}</div>
                        <div className="text-xs text-slate-400">
                          {server.owned ? 'Owned by you' : 'Shared with you'} • {server.connections.length} connection{server.connections.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    {selectedServer?.clientIdentifier === server.clientIdentifier && (
                      <div className="w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Show connections for selected server */}
                  {selectedServer?.clientIdentifier === server.clientIdentifier && server.connections.length > 1 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-slate-400 mb-2">Available Connections:</div>
                      {server.connections.map((conn, idx) => (
                        <div
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedConnection(conn);
                          }}
                          className={`p-2 rounded text-xs border cursor-pointer transition ${
                            selectedConnection?.uri === conn.uri
                              ? 'border-violet-500 bg-violet-500/10 text-violet-300'
                              : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          <div className="font-mono">{conn.uri}</div>
                          <div className="text-[10px] mt-1">
                            {conn.local ? '🏠 Local' : conn.relay ? '🔄 Relay' : '🌐 Remote'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Show single connection inline */}
                  {selectedServer?.clientIdentifier === server.clientIdentifier && server.connections.length === 1 && (
                    <div className="mt-2 text-xs text-slate-500 font-mono">
                      {server.connections[0].uri}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedServer || !selectedConnection}
            className="px-6 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition"
          >
            Connect to Server
          </button>
        </div>
      </div>
    </div>
  );
}
