import React, { useState, useRef, useEffect } from 'react';
import { Play, X, Folder, Search } from 'lucide-react';

function App() {
  const [videoFiles, setVideoFiles] = useState([]); // { file, url }
  const [currentIndex, setCurrentIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const videoRef = useRef();

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      videoFiles.forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, [videoFiles]);

  const handleFolderChange = (e) => {
    // Create URLs for previews
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('video/'));
    const withUrls = files.map(f => ({ file: f, url: URL.createObjectURL(f) }));
    // Cleanup old URLs
    videoFiles.forEach(({ url }) => URL.revokeObjectURL(url));
    setVideoFiles(withUrls);
    setCurrentIndex(null);
  };

  const handlePlay = (index) => {
    setCurrentIndex(index);
  };

  const handleClose = () => {
    if (videoRef.current) videoRef.current.pause();
    setCurrentIndex(null);
  };

  // Filter with search term
  const filtered = videoFiles
    .map((item, idx) => ({ ...item, idx }))
    .filter(({ file }) => file.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-red-600">Movie Player</h1>
        <div className="flex items-center space-x-4">
          <label htmlFor="folderInput" className="flex items-center cursor-pointer bg-red-600 hover:bg-red-500 px-4 py-2 rounded">
            <Folder className="w-5 h-5 mr-2" />
            Open Folder
            <input
              id="folderInput"
              type="file"
              webkitdirectory="true"
              directory="true"
              multiple
              accept="video/*"
              onChange={handleFolderChange}
              className="hidden"
            />
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 rounded focus:outline-none"
            />
          </div>
        </div>
      </header>

      {!videoFiles.length && (
        <div className="h-64 flex items-center justify-center border-2 border-red-600 rounded">
          <span className="text-gray-500">No videos loaded. Use 'Open Folder' to load files.</span>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map(({ file, url, idx }) => (
            <div
              key={idx}
              className="cursor-pointer group relative bg-gray-800 rounded overflow-hidden"
              onClick={() => handlePlay(idx)}
            >
              <video
                src={url}
                muted
                autoPlay
                loop
                className="w-full h-32 object-cover"
              />
              <div className="p-2">
                <p className="text-sm truncate" title={file.name}>{file.name}</p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition">
                <Play className="w-10 h-10 text-white" />
              </div>
            </div>
          ))}
        </div>
      )}

      {currentIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
          <div className="relative w-full max-w-3xl">
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 text-white bg-red-600 p-2 rounded-full hover:bg-red-500 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <video
              ref={videoRef}
              src={videoFiles[currentIndex].url}
              controls
              autoPlay
              className="w-full h-auto rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;