import React from "react";

function SearchBar({ searchText, styleClass, placeholderText, setSearchText }) {
  const updateSearchInput = (value) => {
    setSearchText(value);
  };

  return (
    <div className={"inline-block " + styleClass}>
      <div className="input-group relative flex flex-wrap items-stretch w-full">
        <input
          type="search"
          value={searchText}
          placeholder={placeholderText || "Search"}
          onChange={(e) => updateSearchInput(e.target.value)}
          className="input input-sm input-bordered w-full max-w-xs rounded-full border-base-300 bg-base-100/90 shadow-sm outline-none focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
        />
      </div>
    </div>
  );
}

export default SearchBar;
