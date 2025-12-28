import React from 'react';
import { Tab, NavItem } from '../types';
import { 
  IdCard, 
  Bath, 
  Tent, 
  Sprout, 
  TicketPercent 
} from 'lucide-react';

interface NavigationProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange }) => {
  
  const navItems: NavItem[] = [
    { id: Tab.PASSPORT, label: '岛民护照', icon: <IdCard size={24} /> },
    { id: Tab.GROOMING, label: '洗护', icon: <Bath size={24} /> },
    { id: Tab.FOSTER,   label: '寄养', icon: <Tent size={24} /> },
    { id: Tab.GROWTH,   label: '成长', icon: <Sprout size={24} /> },
    { id: Tab.COUPONS,  label: '优惠券', icon: <TicketPercent size={24} /> },
  ];

  return (
    <nav className="flex-none bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] pb-safe z-50 w-full max-w-md mx-auto">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 active:scale-95 group`}
            >
              <div className={`p-1.5 rounded-2xl transition-all duration-300 mb-1 ${
                isActive 
                  ? 'bg-slate-800 text-white shadow-lg shadow-slate-200 translate-y-[-4px]' 
                  : 'text-slate-400 group-hover:text-slate-600 bg-transparent'
              }`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-bold transition-colors duration-300 ${
                isActive ? 'text-slate-800' : 'text-slate-300'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
