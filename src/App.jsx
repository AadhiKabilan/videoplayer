import React, { useState, useRef, useEffect } from 'react';
import { Play, X, Folder, Search } from 'lucide-react';

function App() {
  const [videoFiles, setVideoFiles] = useState([]); // { file, url }
  const [subtitleFiles, setSubtitleFiles] = useState([]); // { file, url }
  const [currentIndex, setCurrentIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const videoRef = useRef();
  const [selectedSubtitle, setSelectedSubtitle] = useState(null);
  const [subtitleBlobUrl, setSubtitleBlobUrl] = useState(null);


  useEffect(() => {
  if (!selectedSubtitle) {
    setSubtitleBlobUrl(null);
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const vttText = reader.result;
    const blob = new Blob([vttText], { type: 'text/vtt' });
    const newUrl = URL.createObjectURL(blob);
    setSubtitleBlobUrl(prevUrl => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return newUrl;
    });
  };
  reader.readAsText(selectedSubtitle.file);

  return () => {
    if (subtitleBlobUrl) URL.revokeObjectURL(subtitleBlobUrl);
  };
}, [selectedSubtitle]);


  useEffect(() => {
    return () => {
      videoFiles.forEach(({ url }) => URL.revokeObjectURL(url));
      subtitleFiles.forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, [videoFiles, subtitleFiles]);

  const handleFolderChange = (e) => {
    const files = Array.from(e.target.files);
    const videoFiltered = files.filter(f => f.type.startsWith('video/'));
    const subtitleFiltered = files.filter(f => f.name.toLowerCase().endsWith('.vtt'));

    const withVideoUrls = videoFiltered.map(f => ({ file: f, url: URL.createObjectURL(f) }));
    const withSubtitleUrls = subtitleFiltered.map(f => ({ file: f, url: URL.createObjectURL(f) }));

    videoFiles.forEach(({ url }) => URL.revokeObjectURL(url));
    subtitleFiles.forEach(({ url }) => URL.revokeObjectURL(url));

    setVideoFiles(withVideoUrls);
    setSubtitleFiles(withSubtitleUrls);
    setCurrentIndex(null);
  };

  const handlePlay = (index) => {
  const videoFile = videoFiles[index];
  const defaultSubtitle = getMatchingSubtitle(videoFile);
  setSelectedSubtitle(defaultSubtitle || null);
  setCurrentIndex(index);
};


  const handleClose = () => {
    if (videoRef.current) videoRef.current.pause();
    setCurrentIndex(null);
  };

  const getMatchingSubtitle = (videoFile) => {
    const baseName = videoFile.file.name.replace(/\.[^.]+$/, '');
    return subtitleFiles.find(sub => sub.file.name.startsWith(baseName));
  };

  const filtered = videoFiles
    .map((item, idx) => ({ ...item, idx }))
    .filter(({ file }) => file.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-3xl sm:text-4xl font-bold text-red-600">Movie Player</h1>
        <div className="flex flex-wrap gap-4">
          <label htmlFor="folderInput" className="flex items-center cursor-pointer bg-red-600 hover:bg-red-500 px-4 py-2 rounded">
            <Folder className="w-5 h-5 mr-2" />
            Open Folder
            <input
              id="folderInput"
              type="file"
              webkitdirectory="true"
              directory="true"
              multiple
              accept="video/*,.vtt"
              onChange={handleFolderChange}
              className="hidden"
            />
          </label>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded focus:outline-none"
            />
          </div>
        </div>
      </header>

      {!videoFiles.length && (
        <div className="h-64 flex items-center justify-center border-2 border-red-600 rounded">
          <span className="text-gray-500 text-center">No videos loaded. Use 'Open Folder' to load video and subtitle files.</span>
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
           <div className="bg-black p-4 rounded space-y-4">
  <video
    ref={videoRef}
    src={videoFiles[currentIndex].url}
    controls
    autoPlay
    className="w-full h-auto rounded"
  >
   {subtitleBlobUrl && (
  <track
    key={subtitleBlobUrl}
    kind="subtitles"
    src={subtitleBlobUrl}
    srcLang="en"
    label="English"
    default
  />
)}

  </video>

  {subtitleFiles.length > 0 && (
    <div className="mt-4 text-white">
      <label className="block mb-1 font-semibold">Choose Subtitle:</label>
      <select
        value={selectedSubtitle ? selectedSubtitle.file.name : ''}
        onChange={(e) => {
          const selected = subtitleFiles.find(sub => sub.file.name === e.target.value);
          setSelectedSubtitle(selected);
        }}
        className="bg-gray-800 border border-gray-600 rounded px-3 py-1 w-full text-white"
      >
        <option value="">-- None --</option>
        {subtitleFiles.map((sub, i) => (
          <option key={i} value={sub.file.name}>
            {sub.file.name}
          </option>
        ))}
      </select>
    </div>
  )}
</div>

          </div>
        </div>
      )}
    </div>
  );
}

export default App;