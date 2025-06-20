import React from 'react';
import { motion } from 'framer-motion';
import type { NPIDoctorInfo } from '../lib/doctorDetection';

interface DoctorInfoCardProps {
  doctor: NPIDoctorInfo;
  onResearch?: () => void;
  onAddToConversation?: () => void;
  compact?: boolean;
}

const DoctorInfoCard: React.FC<DoctorInfoCardProps> = ({
  doctor,
  onResearch,
  onAddToConversation,
  compact = false
}) => {
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20"
      >
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        <span className="text-sm text-white font-medium">{doctor.displayName}</span>
        <span className="text-xs text-gray-400">• {doctor.specialty}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-white font-semibold text-lg flex items-center gap-2">
            {doctor.displayName}
            <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
              NPI: {doctor.npi}
            </span>
          </h4>
          <p className="text-gray-400 text-sm mt-1">{doctor.specialty}</p>
        </div>
        <div className="flex gap-2">
          {onResearch && (
            <button
              onClick={onResearch}
              className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors group"
              title="Research this doctor"
            >
              <svg 
                className="w-4 h-4 text-blue-400 group-hover:text-blue-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </button>
          )}
          {onAddToConversation && (
            <button
              onClick={onAddToConversation}
              className="p-2 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors group"
              title="Add to conversation context"
            >
              <svg 
                className="w-4 h-4 text-green-400 group-hover:text-green-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 4v16m8-8H4" 
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {doctor.organizationName && (
          <div className="flex items-start gap-2">
            <svg 
              className="w-4 h-4 text-gray-500 mt-0.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
              />
            </svg>
            <span className="text-gray-300">{doctor.organizationName}</span>
          </div>
        )}
        
        <div className="flex items-start gap-2">
          <svg 
            className="w-4 h-4 text-gray-500 mt-0.5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
          <span className="text-gray-300">{doctor.fullAddress || `${doctor.city}, ${doctor.state}`}</span>
        </div>
        
        {doctor.phone && (
          <div className="flex items-start gap-2">
            <svg 
              className="w-4 h-4 text-gray-500 mt-0.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
              />
            </svg>
            <a 
              href={`tel:${doctor.phone}`} 
              className="text-gray-300 hover:text-blue-400 transition-colors"
            >
              {doctor.phone}
            </a>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700/50">
        <p className="text-xs text-gray-500">
          Data from NPI Registry • Last verified by CMS
        </p>
      </div>
    </motion.div>
  );
};

export default DoctorInfoCard;