import { useState } from 'react';

export function useAuthPageViewModel() {
  const [mode, setMode] = useState('login');
  const [termsOpen, setTermsOpen] = useState(false);
  const changeMode = next => setMode(next);
  return { mode, changeMode, termsOpen, openTerms: () => setTermsOpen(true), closeTerms: () => setTermsOpen(false) };
}
