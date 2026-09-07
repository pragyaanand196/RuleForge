import React from 'react';
import { Page } from '../types';
import { 
  Sparkles, 
  BookOpen, 
  FlaskConical, 
  TrendingUp, 
  AlertTriangle, 
  Palette, 
  BrainCircuit, 
  Zap,
  GraduationCap,
  FileText 
} from 'lucide-react';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Start', icon: <Sparkles size={15} /> },
    { id: 'learn', label: '1. Concept', icon: <BookOpen size={15} /> },
    { id: 'lab', label: '2. Experiment', icon: <FlaskConical size={15} /> },
    { id: 'generalization', label: '3. Generalization', icon: <TrendingUp size={15} /> },
    { id: 'ambiguity', label: '4. Ambiguity', icon: <AlertTriangle size={15} /> },
    { id: 'sandbox', label: '5. Sandbox', icon: <Palette size={15} /> },
    { id: 'bdh', label: '6. BDH-CQ', icon: <BrainCircuit size={15} /> },
    { id: 'challenge', label: '7. Challenge', icon: <Zap size={15} /> },
    { id: 'reflection', label: '8. Reflection', icon: <GraduationCap size={15} /> },
    { id: 'research', label: '9. Sources', icon: <FileText size={15} /> },
  ];


  return (
    <header className="app-header">
      <div className="container header-inner">
        <button 
          className="brand-logo" 
          onClick={() => onNavigate('home')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <span style={{ color: 'var(--accent-blue)' }}>Rule</span>
          <span>Forge</span>
          <span className="brand-badge">Skill Acquisition Lab</span>
        </button>

        <nav aria-label="Main Navigation" style={{ overflowX: 'auto', maxWidth: '75%' }}>
          <ul className="nav-links">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <li key={item.id}>
                  <button
                    className={`nav-item-btn ${isActive ? 'active' : ''}`}
                    onClick={() => onNavigate(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
};
