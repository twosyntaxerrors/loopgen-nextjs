import React from 'react';
import { motion } from 'framer-motion';

const AnimatedWaveform: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <svg
        viewBox="0 0 1440 363"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <motion.path
          d="M1440 27.4774C1352.73 19.8184 1122.41 49.0556 899.331 227.276C620.48 450.052 354.282 355.647 170.328 185.318C23.165 49.0556 -4.21721 8.32998 0.487081 5"
          stroke="#4AEDC4"
          strokeOpacity="0.1"
          strokeWidth="10"
          initial={{ pathLength: 0, pathOffset: 1 }}
          animate={{ pathLength: 1, pathOffset: 0 }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
        <motion.path
          d="M1440 27.4774C1352.73 19.8184 1122.41 49.0556 899.331 227.276C620.48 450.052 354.282 355.647 170.328 185.318C23.165 49.0556 -4.21721 8.32998 0.487081 5"
          stroke="#4AEDC4"
          strokeOpacity="0.2"
          strokeWidth="10"
          initial={{ pathLength: 0, pathOffset: 0 }}
          animate={{ pathLength: 1, pathOffset: 1 }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
      </svg>
    </div>
  );
};

export default AnimatedWaveform;