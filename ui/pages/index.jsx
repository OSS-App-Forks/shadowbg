"use client";
import {useState, useRef, useEffect} from "react";
import ProgressBar from "@badrap/bar-of-progress";
import {FaSearch, FaMagnet} from "react-icons/fa";

let progress;
if (typeof window !== "undefined") {
  progress = new ProgressBar({
    size: 3,
    color: "#3b82f6",
    className: "bar-of-progress",
    delay: 100,
  });
}

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
  const data = await fetchResults('/api/search?q='+encodeURIComponent(text)+(offset > 1 ? "&page="+offset : ""));
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
  const searchTextBox = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [searchResult])

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

      {searchResult && (
        <>
          <ul className="results-list">
            {searchResult.map((item, key) => (
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
                  <span>{readableFileSize(item.size.String)}</span>
                  <span>{item.dt}</span>
                </div>
              </li>
            ))}
          </ul>

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
