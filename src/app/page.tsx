'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '@/components/HeroSection';
import ClassesSection from '@/components/ClassesSection';
import AboutSection from '@/components/AboutSection';
import ContactSection from '@/components/ContactSection';
import { useModal } from '@/contexts/ModalContext';
import { useInquiry } from '@/contexts/InquiryContext';

export default function HomePage() {
  const { openModal } = useModal();
  const { openInquiryModal } = useInquiry();
  const [heroVideoUrl, setHeroVideoUrl] = useState<string | undefined>(undefined);
  const [historyText, setHistoryText] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const result = await res.json();
        if (result.success && result.data) {
          if (result.data.heroVideo?.url) {
            setHeroVideoUrl(result.data.heroVideo.url);
          }
          if (result.data.history) {
            setHistoryText(result.data.history);
          }
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleGetStarted = () => {
    openModal();
  };

  const handleMakeInquiry = () => {
    openInquiryModal();
  };

  return (
    <>
      <HeroSection onGetStarted={handleGetStarted} onMakeInquiry={handleMakeInquiry} heroVideoUrl={heroVideoUrl} />
      <ClassesSection />
      <AboutSection historyText={historyText} />
      <ContactSection />
    </>
  );
}
