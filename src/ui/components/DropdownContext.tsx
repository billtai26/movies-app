import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface DropdownContextType {
  openDropdown: string | null;
  setOpenDropdown: (id: string | null) => void;
  registerDropdown: (id: string) => void;
  unregisterDropdown: (id: string) => void;
  closeDropdown: () => void;
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

export function DropdownProvider({ children }: { children: ReactNode }) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const registerDropdown = (id: string) => {
    // Có thể thêm logic để track registered dropdowns nếu cần
  };

  const unregisterDropdown = (id: string) => {
    // Có thể thêm logic để untrack dropdowns nếu cần
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  // Đóng dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Kiểm tra xem click có phải trên dropdown trigger hoặc content không
      const target = event.target as Element;
      if (target && !target.closest('[data-radix-select-trigger]') && !target.closest('[data-radix-select-content]')) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openDropdown]);

  return (
    <DropdownContext.Provider value={{ 
      openDropdown, 
      setOpenDropdown, 
      registerDropdown, 
      unregisterDropdown, 
      closeDropdown 
    }}>
      {children}
    </DropdownContext.Provider>
  );
}

export function useDropdown() {
  const context = useContext(DropdownContext);
  if (context === undefined) {
    throw new Error('useDropdown must be used within a DropdownProvider');
  }
  return context;
}