
import React from 'react';
import { cn } from '../../lib/utils';
import { TabKey } from '../../types';

interface TabDefinition {
  key: TabKey;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean; // Added disabled property
}

interface TabsNavProps {
  tabs: TabDefinition[];
  activeTab: TabKey;
  onTabChange: (tabKey: TabKey) => void;
}

const TabsNav: React.FC<TabsNavProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-4 px-4 sm:px-6 lg:px-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)} // The button's disabled attr will prevent this if tab.disabled is true
            disabled={tab.disabled}
            className={cn(
              'group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-150',
              activeTab === tab.key
                ? 'border-primary text-primary'
                : tab.disabled
                ? 'border-transparent text-gray-400 cursor-not-allowed'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
            aria-current={activeTab === tab.key ? 'page' : undefined}
            aria-disabled={tab.disabled || undefined}
          >
            {tab.icon && (
              <span
                className={cn(
                  'w-5 h-5 mr-2',
                  activeTab === tab.key 
                    ? 'text-primary' 
                    : tab.disabled
                    ? 'text-gray-300' // Disabled icon color
                    : 'text-gray-400 group-hover:text-gray-500'
                )}
              >
                {tab.icon}
              </span>
            )}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabsNav;