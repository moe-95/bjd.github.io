import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { PassportView, GroomingView, FosterView, GrowthView, CouponsView } from './components/TabViews';
import { Tab } from './types';
import { AppProvider } from './contexts/AppContext';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.PASSPORT);

  const renderContent = () => {
    switch (currentTab) {
      case Tab.PASSPORT: return <PassportView />;
      case Tab.GROOMING: return <GroomingView />;
      case Tab.FOSTER:   return <FosterView />;
      case Tab.GROWTH:   return <GrowthView />;
      case Tab.COUPONS:  return <CouponsView />;
      default: return <PassportView />;
    }
  };

  return (
    <AppProvider>
      <div className="h-screen w-full bg-slate-50 font-sans text-slate-900 flex flex-col overflow-hidden">
        {/* Main Content Area - Scrollable */}
        <main className="flex-1 w-full max-w-md mx-auto relative overflow-y-auto no-scrollbar">
          {renderContent()}
        </main>

        {/* Navigation - Fixed at bottom */}
        <Navigation currentTab={currentTab} onTabChange={setCurrentTab} />
      </div>
    </AppProvider>
  );
};

export default App;
