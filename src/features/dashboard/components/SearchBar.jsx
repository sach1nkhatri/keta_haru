import React from 'react';
import '../css/SearchBar.css';

const SearchBar = ({ value, onChange, onSearch, placeholder, isDarkTheme }) => {
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Trigger search as user types (with debouncing)
    if (onSearch) {
      // Clear any existing timeout
      if (window.searchTimeout) {
        clearTimeout(window.searchTimeout);
      }
      
      // Set new timeout for search
      window.searchTimeout = setTimeout(() => {
        onSearch(newValue);
      }, 500); // 500ms delay for better performance
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  const handleClear = () => {
    onChange('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className={`search-bar ${isDarkTheme ? 'dark' : ''}`}>
      <div className="search-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      </div>
      <input
        type="text"
        className="search-input"
        value={value}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
      />
      {value && (
        <button 
          className="clear-search"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchBar; 