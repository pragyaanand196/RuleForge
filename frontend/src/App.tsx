import React, { useState, useEffect } from 'react';
import { Page } from './types';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { LearnPage } from './pages/LearnPage';
import { LabPage } from './pages/LabPage';
import { GeneralizationPage } from './pages/GeneralizationPage';
import { AmbiguityPage } from './pages/AmbiguityPage';
import { SandboxPage } from './pages/SandboxPage';
import { BDHPage } from './pages/BDHPage';
import { ResearchPage } from './pages/ResearchPage';

export const App: React.FC = () => {
  // Synchronize navigation with URL hash for browser history & back button support
  const getPageFromHash = (): Page => {
    const hash = window.location.hash.replace('#', '') as Page;
    const validPages: Page[] = [
      'home',
      'learn',
      'lab',
      'generalization',
      'ambiguity',
      'sandbox',
      'bdh',
      'research',
    ];
    return validPages.includes(hash) ? hash : 'home';
  };

  const [currentPage, setCurrentPage] = useState<Page>(getPageFromHash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(getPageFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: Page) => {
    window.location.hash = page;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigateTo} />;
      case 'learn':
        return <LearnPage onNavigate={navigateTo} />;
      case 'lab':
        return <LabPage onNavigate={navigateTo} />;
      case 'generalization':
        return <GeneralizationPage onNavigate={navigateTo} />;
      case 'ambiguity':
        return <AmbiguityPage onNavigate={navigateTo} />;
      case 'sandbox':
        return <SandboxPage onNavigate={navigateTo} />;
      case 'bdh':
        return <BDHPage onNavigate={navigateTo} />;
      case 'research':
        return <ResearchPage onNavigate={navigateTo} />;
      default:
        return <HomePage onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="app-root">
      <Header currentPage={currentPage} onNavigate={navigateTo} />
      
      <main className="main-content">
        {renderPage()}
      </main>

      <footer className="app-footer">
        <div className="container footer-inner">
          <div>
            <strong>RuleForge</strong> — Skill Acquisition from Demonstrations
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <button
              onClick={() => navigateTo('research')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Research Sources & Provenance
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
