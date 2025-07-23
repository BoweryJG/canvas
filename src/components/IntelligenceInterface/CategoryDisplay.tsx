import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CategoryDisplayProps {
  categories: string[];
  progress: number;
  scanStage: string;
}

const CategoryDisplay: React.FC<CategoryDisplayProps> = ({ categories }) => {
  const categoryData = [
    { name: 'Medical Credentials', icon: '🏥', confidence: 92 },
    { name: 'Practice Information', icon: '🏢', confidence: 88 },
    { name: 'Digital Presence', icon: '🌐', confidence: 85 },
    { name: 'Patient Reviews', icon: '⭐', confidence: 79 },
    { name: 'Professional Network', icon: '🤝', confidence: 84 },
    { name: 'Specializations', icon: '🔬', confidence: 91 }
  ];

  return (
    <motion.div 
      className="category-display"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="category-header">
        <h3>INTELLIGENCE CATEGORIZATION</h3>
        <p>Organizing medical practice data into intelligence categories...</p>
      </div>

      <div className="category-grid">
        <AnimatePresence>
          {categories.map((categoryName, index) => {
            const categoryInfo = categoryData.find(c => c?.name === categoryName);
            if (!categoryInfo || !categoryInfo.name) return null;

            return (
              <motion.div
                key={categoryName}
                className="category-card"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 10 }}
                transition={{ 
                  delay: index * 0.2,
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100
                }}
              >
                <div className="card-header">
                  <span className="category-icon">{categoryInfo.icon}</span>
                  <span className="category-name">{categoryInfo.name}</span>
                </div>

                <div className="card-body">
                  {/* Data filling animation */}
                  <div className="data-items">
                    {Array.from({ length: 5 }, (_, i) => (
                      <motion.div
                        key={i}
                        className="data-item"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: '100%', opacity: 1 }}
                        transition={{ 
                          delay: index * 0.2 + i * 0.1,
                          duration: 0.8 
                        }}
                      />
                    ))}
                  </div>

                  {/* Confidence meter */}
                  <div className="confidence-meter">
                    <div className="confidence-label">CONFIDENCE</div>
                    <div className="confidence-bar">
                      <motion.div 
                        className="confidence-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${categoryInfo.confidence}%` }}
                        transition={{ 
                          delay: index * 0.2 + 0.5,
                          duration: 1 
                        }}
                      />
                    </div>
                    <div className="confidence-value">{categoryInfo.confidence}%</div>
                  </div>
                </div>

                {/* Card status indicator */}
                <motion.div 
                  className="card-status"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.2 + 1 }}
                >
                  ✓ CATEGORIZED
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Processing indicator */}
      <motion.div
        className="processing-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="processing-dots">
          {Array.from({ length: 3 }, (_, i) => (
            <motion.div
              key={i}
              className="processing-dot"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 0.6,
                delay: i * 0.2,
                repeat: Infinity
              }}
            />
          ))}
        </div>
        <span>ORGANIZING INTELLIGENCE DATA</span>
      </motion.div>
    </motion.div>
  );
};

export default CategoryDisplay;