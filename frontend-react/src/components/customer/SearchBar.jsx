import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import Input from '../ui/Input';

const SearchBar = ({ onSearch, placeholder = "Search for rentals...", initialValue = "", className = "" }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onSearch) {
        onSearch(value);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [value, onSearch]);

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onSearch) {
            onSearch(value);
          }
        }}
        placeholder={placeholder}
        className="pl-10 pr-10 py-3 w-full text-base bg-elevated border-subtle focus:border-accent focus:ring-1 focus:ring-accent"
      />
      {value && (
        <button 
          onClick={() => setValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
