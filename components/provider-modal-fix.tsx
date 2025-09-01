'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ModalWrapperProps {
  children: React.ReactNode;
  onClose: () => void;
}

export function ModalWrapper({ children, onClose }: ModalWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onMouseDown={(e) => {
        // only close if clicking the actual background, not when dragging/selecting text
        if (e.target === e.currentTarget && e.detail === 1) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background border rounded-lg shadow-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
        onMouseDown={(e) => {
          // prevent event from bubbling to parent
          e.stopPropagation();
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}