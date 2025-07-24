import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../auth/useAuth';

interface Procedure {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  manufacturer?: string;
  is_featured: boolean;
  type: 'dental' | 'aesthetic';
}

interface ProcedureSelectorProps {
  onSelectProcedure: (procedure: Procedure | null) => void;
  backendUrl: string;
}

const ProcedureSelector: React.FC<ProcedureSelectorProps> = ({ 
  onSelectProcedure,
  backendUrl 
}) => {
  const { session } = useAuth();
  const [featuredProcedures, setFeaturedProcedures] = useState<{
    dental: Procedure[],
    aesthetic: Procedure[]
  }>({ dental: [], aesthetic: [] });
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadFeaturedProcedures();
  }, [session]);

  const loadFeaturedProcedures = async () => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(`${backendUrl}/api/canvas/procedures/featured`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      const data = await response.json();
      setFeaturedProcedures(data.procedures);
    } catch (error) {
      console.error('Failed to load featured procedures:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchProcedures = async (query: string) => {
    if (!query.trim() || !session?.access_token) return;

    setSearching(true);
    try {
      const response = await fetch(
        `${backendUrl}/api/canvas/procedures/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );
      const data = await response.json();
      setSearchResults(data.procedures || []);
    } catch (error) {
      console.error('Failed to search procedures:', error);
    } finally {
      setSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        searchProcedures(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const getProcedureIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Implants': '🦷',
      'Orthodontics': '😁',
      'Body Contouring': '💪',
      'Injectables': '💉',
      'Lasers': '✨',
      'Skin Rejuvenation': '🌟',
      'Surgical': '🏥',
      'Non-Invasive': '🎯'
    };
    return icons[category] || '📋';
  };

  const topDentalProcedures = featuredProcedures.dental.slice(0, 3);
  const topAestheticProcedures = featuredProcedures.aesthetic.slice(0, 3);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-48 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-800 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold text-white mb-4">
        Select a Procedure to Specialize Your Agent
      </h3>

      {/* Skip procedure selection option */}
      <button
        onClick={() => onSelectProcedure(null)}
        className="w-full mb-4 p-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all text-left"
      >
        Skip procedure selection (use general agent) →
      </button>

      {/* Featured procedures */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Dental column */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">Top Dental</h4>
          <div className="space-y-2">
            {topDentalProcedures.map((procedure) => (
              <motion.button
                key={procedure.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectProcedure({ ...procedure, type: 'dental' })}
                className="w-full p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg hover:border-blue-500/40 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getProcedureIcon(procedure.category)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{procedure.name}</div>
                    <div className="text-xs text-gray-400">{procedure.category}</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Aesthetic column */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">Top Aesthetic</h4>
          <div className="space-y-2">
            {topAestheticProcedures.map((procedure) => (
              <motion.button
                key={procedure.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectProcedure({ ...procedure, type: 'aesthetic' })}
                className="w-full p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg hover:border-purple-500/40 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getProcedureIcon(procedure.category)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{procedure.name}</div>
                    <div className="text-xs text-gray-400">{procedure.category}</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Search all procedures */}
      <div className="border-t border-gray-800 pt-4">
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="w-full p-3 bg-white/5 border border-[#00ffc6]/20 rounded-lg hover:border-[#00ffc6]/40 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5 text-[#00ffc6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-white">Search All Procedures</span>
        </button>

        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search procedures..."
                  className="w-full px-4 py-3 bg-white/5 border border-[#00ffc6]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00ffc6]/40 transition-all"
                  autoFocus
                />

                {searching && (
                  <div className="mt-4 text-center text-gray-400 text-sm">
                    Searching...
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="mt-4 max-h-64 overflow-y-auto space-y-2">
                    {searchResults.map((procedure) => (
                      <button
                        key={`${procedure.type}-${procedure.id}`}
                        onClick={() => onSelectProcedure(procedure)}
                        className="w-full p-3 bg-white/5 border border-gray-800 rounded-lg hover:border-[#00ffc6]/40 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{getProcedureIcon(procedure.category)}</span>
                          <div className="flex-1">
                            <div className="font-medium text-white">{procedure.name}</div>
                            <div className="text-xs text-gray-400">
                              {procedure.type === 'dental' ? '🦷' : '💉'} {procedure.category}
                              {procedure.manufacturer && ` • ${procedure.manufacturer}`}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchTerm && searchResults.length === 0 && !searching && (
                  <div className="mt-4 text-center text-gray-500 text-sm">
                    No procedures found matching "{searchTerm}"
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProcedureSelector;