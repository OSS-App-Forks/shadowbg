"use client";
import {useState, useRef, useEffect} from "react";
import ProgressBar from "@badrap/bar-of-progress";
import {FaSearch, FaMagnet, FaChevronDown, FaFilter} from "react-icons/fa";

let progress;
if (typeof window !== "undefined") {
  progress = new ProgressBar({
    size: 3,
    color: "#3b82f6",
    className: "bar-of-progress",
    delay: 100,
  });
}

const CATEGORY_STRUCTURE = [
  { id: 'ebooks', label: 'eBooks' },
  {
    id: 'games-parent',
    label: 'Games',
    subcategories: [
      { id: 'games_pc_iso', label: 'PC ISO' },
      { id: 'games_pc_rip', label: 'PC RIP' },
      { id: 'games_ps3', label: 'PS3' },
      { id: 'games_ps4', label: 'PS4' },
      { id: 'games_xbox360', label: 'Xbox360' }
    ]
  },
  {
    id: 'movies-parent',
    label: 'Movies',
    subcategories: [
      { id: 'movies', label: 'Uncategorized' },
      { id: 'movies_bd_full', label: 'BD Full' },
      { id: 'movies_bd_remux', label: 'BD Remux' },
      { id: 'movies_x264', label: 'x264' },
      { id: 'movies_x264_3d', label: 'x264 3D' },
      { id: 'movies_x264_4k', label: 'x264 4K' },
      { id: 'movies_x264_720', label: 'x264 720p' },
      { id: 'movies_x265', label: 'x265' },
      { id: 'movies_x265_4k', label: 'x265 4K' },
      { id: 'movies_x265_4k_hdr', label: 'x265 4K HDR' },
      { id: 'movies_xvid', label: 'XviD' },
      { id: 'movies_xvid_720', label: 'XviD 720p' }
    ]
  },
  {
    id: 'music-parent',
    label: 'Music',
    subcategories: [
      { id: 'music_flac', label: 'Music FLAC' },
      { id: 'music_mp3', label: 'Music MP3' }
    ]
  },
  { id: 'software_pc_iso', label: 'Software PC ISO' },
  {
    id: 'tv-parent',
    label: 'TV',
    subcategories: [
      { id: 'tv_sd', label: 'TV SD' },
      { id: 'tv_uhd', label: 'TV UHD' }
    ]
  },
  { id: 'xxx', label: 'XXX' }
];

function fetchResults(url) {
  return new Promise((resolve, reject) => {
    var oReq = new XMLHttpRequest();
    oReq.open('GET', url);
    oReq.send();
    oReq.onreadystatechange = function() {
      if (oReq.readyState == XMLHttpRequest.DONE) {
        try {
          let data = JSON.parse(oReq.responseText);
          resolve(data);
        } catch (e) {
          resolve({error: "Failed to parse response"});
        }
      }
    }
  });
}

function readableFileSize(size) {
  if (!size) return "0 B";
  var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  var i = 0;
  while(size >= 1024) {
    size /= 1024;
    ++i;
  }
  return parseFloat(size).toFixed(2) + ' ' + units[i];
}

async function handleSearch(setSearchResult, text, offset, setOffset) {
  if(text === "") return;
  if (progress) progress.start();

  let url = '/api/search?q='+encodeURIComponent(text);
  if (offset > 1) url += "&page=" + offset;

  const data = await fetchResults(url);
  if (progress) progress.finish();
  if (!data || data.error) {
    return;
  }
  setOffset(offset < 1 ? 1 : offset)
  setSearchResult(data.results)
}

export default function Home() {
  const [searchResult, setSearchResult] = useState();
  const [searchOffset, setSearchOffset] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedCats, setSelectedCats] = useState([]);
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const searchTextBox = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [searchResult])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCatDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = (e, link) => {
    e.preventDefault();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(() => {
        setToastMessage("Copied to clipboard!");
        setTimeout(() => setToastMessage(null), 2500);
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setToastMessage("Copied to clipboard!");
        setTimeout(() => setToastMessage(null), 2500);
      } catch (err) {
        console.error('Fallback copy failed: ', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const toggleCategory = (catId) => {
    setSelectedCats(prev => {
      let next = [...prev];

      if (catId.endsWith('-parent')) {
        // Find the group
        const parent = CATEGORY_STRUCTURE.find(c => c.id === catId);
        if (parent && parent.subcategories) {
          const subIds = parent.subcategories.map(s => s.id);
          const allSelected = subIds.length > 0 && subIds.every(id => next.includes(id));
          
          if (allSelected) {
            // Unselect all subcategories
            next = next.filter(id => !subIds.includes(id));
          } else {
            // Select all subcategories that are missing
            subIds.forEach(id => {
              if (!next.includes(id)) next.push(id);
            });
          }
        }
      } else {
        // Regular toggle
        const isSelected = next.includes(catId);
        if (isSelected) {
          next = next.filter(id => id !== catId);
        } else {
          next.push(catId);
        }
      }
      return next;
    });
  };

  const displayedResults = searchResult ? searchResult.filter(item => {
    if (selectedCats.length === 0) return true;
    return selectedCats.includes(item.cat);
  }) : [];

  return (
    <div className="main">
      <div className="logo"></div>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          ref={searchTextBox}
          placeholder="Search for something..."
          onKeyPress={(e) => {
            if(e.which == 13) {
              handleSearch(setSearchResult, searchTextBox.current.value, 1, setSearchOffset)
            }
          }}
        />
        <button
          className="search-button"
          onClick={() => handleSearch(setSearchResult, searchTextBox.current.value, 1, setSearchOffset)}
          type="button"
        >
          <FaSearch size={18} />
        </button>
      </div>

      <div className="filters-container">
        <div className="category-filter" ref={dropdownRef}>
          <button
            className="category-filter-button"
            onClick={() => setShowCatDropdown(!showCatDropdown)}
          >
            <FaFilter size={12} />
            Categories {selectedCats.length > 0 && `(${selectedCats.length})`}
            <FaChevronDown size={10} />
          </button>

          {showCatDropdown && (
            <div className="category-dropdown">
              {CATEGORY_STRUCTURE.map(cat => {
                if (cat.id.endsWith('-parent')) {
                  const subIds = cat.subcategories.map(s => s.id);
                  const allSelected = subIds.length > 0 && subIds.every(id => selectedCats.includes(id));
                  return (
                    <div key={cat.id} className="category-group">
                      <label className="category-option" style={{ fontWeight: 'bold' }}>
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={() => toggleCategory(cat.id)}
                        />
                        {cat.label} (All)
                      </label>
                      {cat.subcategories.map(sub => (
                        <label key={sub.id} className="category-option sub-option">
                          <input
                            type="checkbox"
                            checked={selectedCats.includes(sub.id)}
                            onChange={() => toggleCategory(sub.id)}
                          />
                          {sub.label}
                        </label>
                      ))}
                    </div>
                  );
                } else {
                  return (
                    <div key={cat.id} className="category-group">
                      <label className="category-option" style={{ fontWeight: 'bold' }}>
                        <input
                          type="checkbox"
                          checked={selectedCats.includes(cat.id)}
                          onChange={() => toggleCategory(cat.id)}
                        />
                        {cat.label}
                      </label>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>
      </div>

      {searchResult && (
        <>
          {displayedResults.length === 0 && selectedCats.length > 0 ? (
            <div style={{textAlign: "center", marginTop: "20px", color: "var(--text-muted)"}}>
              No results match the selected categories on this page.
            </div>
          ) : (
            <ul className="results-list">
              {displayedResults.map((item, key) => (
                <li key={key} className="search-item">
                  <a
                    className="search-item-magnet"
                    href={item.magnet}
                    title="Copy Magnet Link"
                    onClick={(e) => handleCopy(e, item.magnet)}
                  >
                    <FaMagnet />
                  </a>
                  <span className="search-item-title">{item.title}</span>
                  <div className="search-item-meta">
                    <span className="category-tag">{item.cat}</span>
                    <span>{readableFileSize(item.size.String)}</span>
                    <span>{item.dt}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {(searchResult.length >= 30 || searchOffset > 1) && (
            <div className="pagination-container">
              <button
                className="pagination-button"
                disabled={searchOffset == 1}
                onClick={() => handleSearch(setSearchResult, searchTextBox.current.value, searchOffset - 1, setSearchOffset)}
              >
                Previous
              </button>
              <button
                className="pagination-button"
                disabled={searchResult.length < 30}
                onClick={() => handleSearch(setSearchResult, searchTextBox.current.value, searchOffset + 1, setSearchOffset)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {toastMessage && (
        <div className="toast-notification">
          {toastMessage}
        </div>
      )}
    </div>
  );
}