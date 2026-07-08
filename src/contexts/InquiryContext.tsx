'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface InquiryContextType {
  isInquiryModalOpen: boolean;
  preferredClass: string;
  openInquiryModal: (className?: string) => void;
  closeInquiryModal: () => void;
}

const InquiryContext = createContext<InquiryContextType | undefined>(undefined);

export function useInquiry() {
  const context = useContext(InquiryContext);
  if (!context) {
    throw new Error('useInquiry must be used within an InquiryProvider');
  }
  return context;
}

interface InquiryProviderProps {
  children: ReactNode;
}

export function InquiryProvider({ children }: InquiryProviderProps) {
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [preferredClass, setPreferredClass] = useState('');

  const openInquiryModal = (className?: string) => {
    setPreferredClass(className || '');
    setIsInquiryModalOpen(true);
  };
  const closeInquiryModal = () => {
    setPreferredClass('');
    setIsInquiryModalOpen(false);
  };

  return (
    <InquiryContext.Provider value={{ isInquiryModalOpen, preferredClass, openInquiryModal, closeInquiryModal }}>
      {children}
    </InquiryContext.Provider>
  );
}
