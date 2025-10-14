import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCompress,
  FaSpinner,
  FaClosedCaptioning,
  FaUpload,
} from "react-icons/fa";
import ReactPlayer from "react-player";

const TorrentStream = () => {
  const [magnet, setMagnet] = useState("");
  const [submittedMagnet, setSubmittedMagnet] = useState("");
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [availableSubtitles, setAvailableSubtitles] = useState([]);
  const [selectedSubtitle, setSelectedSubtitle] = useState(null);
  const [subtitleSearch, setSubtitleSearch] = useState("");
  const [subtitleSort, setSubtitleSort] = useState("name"); // name, language, size
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [torrentFiles, setTorrentFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [uploadedSubtitles, setUploadedSubtitles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedSite, setSelectedSite] = useState("yts");
  const [torrentSearch, setTorrentSearch] = useState("");
  const [torrentResults, setTorrentResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [captions_arr, setCaptions] = useState([]);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const subtitleTrackRef = useRef(null);
  const subtitleMenuRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!magnet.trim()) {
      setError("Please enter a magnet link.");
      return;
    }
    setError("");
    setIsLoading(true);
    setSubmittedMagnet(magnet.trim());
    try {
      await fetchTorrentFiles(magnet.trim());
    } catch (error) {
      console.error("Error fetching files:", error);
      setError("Failed to fetch files. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrendingTorrents = async (limit = 10) => {
    const res = await fetch(
      `https://torrent-api-py-nx0x.onrender.com/api/v1/all/trending?limit=${limit}`,
    );
    const data = await res.json();
    return data.data; // Array of torrents
  };

  const fetchSearchedTorrents = async (site, query, limit = 10, page = 1) => {
    const url = `https://torrent-api-py-nx0x.onrender.com/api/v1/search?site=${encodeURIComponent(site)}&query=${encodeURIComponent(query)}&limit=${limit}&page=${page}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.data;
  };

  const handleTorrentSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchError("");
    setTorrentResults([]);
    try {
      const torrents = await fetchSearchedTorrents(
        selectedSite,
        torrentSearch,
        10,
        1,
      );
      setTorrentResults(torrents);
    } catch (err) {
      setSearchError("Failed to fetch search results.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleTorrentSelect = (result) => {
    // If result is a quality selection (from allTorrents)
    if (result.quality && result.magnet) {
      setSubmittedMagnet(result.magnet);
      setSelectedFile(null);
      setSelectedSubtitle(null);
      setShowSubtitleMenu(false);
      setSelectedQuality(result.quality);
      return;
    }

    // If result is the main movie object
    if (result.magnet) {
      setSubmittedMagnet(result.magnet);
      setSelectedFile(null);
      setSelectedSubtitle(null);
      setShowSubtitleMenu(false);
      setSelectedQuality(result.quality);
    }
  };

  // Fetch available subtitles
  useEffect(() => {
    if (submittedMagnet && selectedFile) {
      // Extract movie name from file name
      const movieName = selectedFile.replace(/\.[^/.]+$/, ""); // Remove file extension
      fetch(
        `http://localhost:3000/api/subtitles/search?query=${encodeURIComponent(movieName)}`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            // Sort subtitles by score if available
            const sortedSubtitles = data.sort(
              (a, b) => (b.score || 0) - (a.score || 0),
            );
            setAvailableSubtitles(sortedSubtitles);
          } else {
            setAvailableSubtitles([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching subtitles:", err);
          setAvailableSubtitles([]);
        });
    }
  }, [submittedMagnet, selectedFile]);

  // Fetch file list after submitting magnet link
  const fetchTorrentFiles = async (magnet) => {
    try {
      const res = await fetch(
        `http://localhost:3000/stream?magnet=${encodeURIComponent(magnet)}`,
      );
      if (!res.ok) {
        throw new Error("Failed to fetch files");
      }
      const data = await res.json();
      console.log("Received files:", data.files); // Debug log
      setTorrentFiles(data.files || []);
    } catch (err) {
      console.error("Error fetching files:", err);
      setError("Failed to fetch files. Please try again.");
      setTorrentFiles([]);
      throw err; // Re-throw to be caught by handleSubmit
    }
  };

  const handleFileSelect = (fileName) => {
    setSelectedFile(fileName);
    setShowPlayer(true);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handlePlaybackRateChange = (rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const handleSubtitleChange = async (subtitle) => {
    if (subtitleTrackRef.current) {
      subtitleTrackRef.current.remove();
    }

    if (subtitle) {
      try {
        // Download and parse subtitle
        const response = await fetch(
          `http://localhost:3000/api/subtitles/download?url=${encodeURIComponent(subtitle.downloadUrl)}&format=${subtitle.format}`,
        );
        const subtitleData = await response.json();

        // Create VTT content
        const vttContent = convertToVTT(subtitleData);
        const vttBlob = new Blob([vttContent], { type: "text/vtt" });
        const vttUrl = URL.createObjectURL(vttBlob);

        const track = document.createElement("track");
        track.kind = "subtitles";
        track.label = subtitle.name;
        track.srclang = subtitle.language;
        track.default = true;
        track.src = vttUrl;

        if (videoRef.current) {
          videoRef.current.appendChild(track);
          subtitleTrackRef.current = track;

          // Enable subtitles
          videoRef.current.textTracks[0].mode = "showing";
        }
      } catch (error) {
        console.error("Error loading subtitle:", error);
      }
    } else {
      // Disable subtitles
      if (videoRef.current && videoRef.current.textTracks.length > 0) {
        videoRef.current.textTracks[0].mode = "hidden";
      }
    }

    setSelectedSubtitle(subtitle);
  };

  // Convert subtitle data to VTT format
  const convertToVTT = (subtitles) => {
    let vtt = "WEBVTT\n\n";

    subtitles.forEach((sub) => {
      const start = formatVttTime(sub.start);
      const end = formatVttTime(sub.end);
      vtt += `${start} --> ${end}\n${sub.text}\n\n`;
    });

    return vtt;
  };

  // Format time for VTT
  const formatVttTime = (ms) => {
    const date = new Date(ms);
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    const seconds = date.getUTCSeconds().toString().padStart(2, "0");
    const milliseconds = date.getUTCMilliseconds().toString().padStart(3, "0");
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  };

  // Add subtitle track when video is loaded
  useEffect(() => {
    if (videoRef.current && selectedSubtitle) {
      const track = document.createElement("track");
      track.kind = "subtitles";
      track.label = selectedSubtitle.name;
      track.srclang = "en";
      track.default = true;
      track.src = `http://localhost:3000/subtitle?magnet=${encodeURIComponent(submittedMagnet)}&file=${encodeURIComponent(selectedFile)}&subtitle=${encodeURIComponent(selectedSubtitle.name)}`;

      videoRef.current.appendChild(track);
      subtitleTrackRef.current = track;

      // Enable subtitles
      videoRef.current.textTracks[0].mode = "showing";
    }
  }, [videoRef.current, selectedSubtitle, submittedMagnet, selectedFile]);

  // Debug subtitle tracks
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      console.log("Available text tracks:", video.textTracks.length);

      for (let i = 0; i < video.textTracks.length; i++) {
        const track = video.textTracks[i];
        console.log(`Track ${i}:`, {
          kind: track.kind,
          label: track.label,
          mode: track.mode,
          language: track.language,
        });
      }
    }
  }, [videoRef.current?.textTracks.length]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Debug video events
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;

      const handleWaiting = () => {
        console.log("Video is buffering...");
        setIsBuffering(true);
      };

      const handlePlaying = () => {
        console.log("Video is playing");
        setIsBuffering(false);
      };

      const handleProgress = () => {
        if (video.buffered.length > 0) {
          const bufferedEnd = video.buffered.end(video.buffered.length - 1);
          console.log(`Buffered until: ${bufferedEnd} seconds`);
        }
      };

      video.addEventListener("waiting", handleWaiting);
      video.addEventListener("playing", handlePlaying);
      video.addEventListener("progress", handleProgress);

      return () => {
        video.removeEventListener("waiting", handleWaiting);
        video.removeEventListener("playing", handlePlaying);
        video.removeEventListener("progress", handleProgress);
      };
    }
  }, [submittedMagnet]);

  // Enhanced video event handlers
  const handleVideoEvents = () => {
    const video = videoRef.current;
    if (!video) return;

    // Debug video state
    const logVideoState = () => {
      console.log("Video State:", {
        currentTime: video.currentTime,
        duration: video.duration,
        buffered: video.buffered.length
          ? {
              start: video.buffered.start(0),
              end: video.buffered.end(0),
            }
          : "No buffered ranges",
        readyState: video.readyState,
        networkState: video.networkState,
        paused: video.paused,
        ended: video.ended,
        error: video.error ? video.error.message : null,
      });
    };

    // Log initial state
    logVideoState();

    // Log state changes
    const events = [
      "loadstart",
      "progress",
      "suspend",
      "abort",
      "error",
      "emptied",
      "stalled",
      "loadedmetadata",
      "loadeddata",
      "canplay",
      "canplaythrough",
      "playing",
      "waiting",
      "seeking",
      "seeked",
      "ended",
      "ratechange",
      "durationchange",
      "timeupdate",
      "volumechange",
    ];

    events.forEach((event) => {
      video.addEventListener(event, () => {
        console.log(`Video event: ${event}`);
        logVideoState();
      });
    });

    // Monitor network requests
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.initiatorType === "video" || entry.name.includes("/stream")) {
          console.log("Network request:", {
            name: entry.name,
            type: entry.initiatorType,
            duration: entry.duration,
            startTime: entry.startTime,
            transferSize: entry.transferSize,
            encodedBodySize: entry.encodedBodySize,
            decodedBodySize: entry.decodedBodySize,
          });
        }
      }
    });

    observer.observe({ entryTypes: ["resource"] });

    // Cleanup
    return () => {
      events.forEach((event) => {
        video.removeEventListener(event, logVideoState);
      });
      observer.disconnect();
    };
  };

  // Filter and sort subtitles
  const filteredSubtitles = useMemo(() => {
    let filtered = [...availableSubtitles];

    // Filter by search term
    if (subtitleSearch) {
      const searchLower = subtitleSearch.toLowerCase();
      filtered = filtered.filter(
        (sub) =>
          sub.name.toLowerCase().includes(searchLower) ||
          sub.language?.toLowerCase().includes(searchLower),
      );
    }

    // Sort subtitles
    filtered.sort((a, b) => {
      switch (subtitleSort) {
        case "name":
          return a.name.localeCompare(b.name);
        case "language":
          return (a.language || "").localeCompare(b.language || "");
        case "size":
          return (a.size || 0) - (b.size || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [availableSubtitles, subtitleSearch, subtitleSort]);

  // Close subtitle menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        subtitleMenuRef.current &&
        !subtitleMenuRef.current.contains(event.target)
      ) {
        setShowSubtitleMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Group subtitles by language
  const groupedSubtitles = useMemo(() => {
    const groups = {};
    filteredSubtitles.forEach((sub) => {
      const lang = sub.language || "Unknown";
      if (!groups[lang]) {
        groups[lang] = [];
      }
      groups[lang].push(sub);
    });
    return groups;
  }, [filteredSubtitles]);

  // Only show the video player if a file is selected
  const shouldShowPlayer = !!selectedFile;

  // Reset states when component unmounts or when new magnet is submitted
  useEffect(() => {
    return () => {
      setTorrentFiles([]);
      setSelectedFile(null);
      setShowPlayer(false);
      setIsLoading(false);
    };
  }, [submittedMagnet]);

  // Fetch uploaded subtitles
  const fetchUploadedSubtitles = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/subtitles/uploaded");
      const data = await res.json();
      setUploadedSubtitles(data.subtitles || []);
    } catch (err) {
      setUploadedSubtitles([]);
    }
  };

  // Handle file upload
  const handleSubtitleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError("");
    const formData = new FormData();
    formData.append("subtitle", file);

    try {
      const res = await fetch("http://localhost:3000/api/subtitles/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        await fetchUploadedSubtitles();
      } else {
        setUploadError(data.error || "Failed to upload subtitle.");
      }
    } catch (err) {
      setUploadError("Failed to upload subtitle.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    fetchUploadedSubtitles();
  }, []);

  // Update captions_arr whenever availableSubtitles or uploadedSubtitles changes
  useEffect(() => {
    // Map torrent subtitles
    const torrentSubs = availableSubtitles.map((sub) => ({
      kind: "subtitles",
      src: `http://localhost:3000/subtitle?magnet=${encodeURIComponent(submittedMagnet)}&name=${encodeURIComponent(sub.name)}`,
      srcLang: sub.language || "en",
      label: sub.name,
      default:
        selectedSubtitle &&
        selectedSubtitle.name === sub.name &&
        !selectedSubtitle.isUploaded,
    }));
    // Map uploaded subtitles
    const uploadedSubs = uploadedSubtitles.map((sub) => ({
      kind: "subtitles",
      src: `http://localhost:3000${sub.path.replace(/\\/g, "/")}`,
      srcLang: "en",
      label: sub.name,
      default:
        selectedSubtitle &&
        selectedSubtitle.name === sub.name &&
        selectedSubtitle.isUploaded,
    }));
    setCaptions([...torrentSubs, ...uploadedSubs]);
  }, [
    availableSubtitles,
    uploadedSubtitles,
    selectedSubtitle,
    submittedMagnet,
  ]);

  // Modify the subtitle menu to include upload option
  const renderSubtitleMenu = () => (
    <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg shadow-lg p-4 min-w-[300px]">
      <div className="flex flex-col space-y-4">
        {/* Upload Section */}
        <div className="border-b border-gray-700 pb-4">
          <h3 className="text-sm font-semibold mb-2">Upload Subtitle</h3>
          <div className="flex items-center space-x-2">
            <label className="flex-1">
              <input
                type="file"
                accept=".srt,.vtt"
                ref={fileInputRef}
                onChange={handleSubtitleUpload}
                disabled={isUploading}
                className="hidden"
                id="subtitle-upload"
              />
              <div className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded cursor-pointer">
                <FaUpload className="mr-2" />
                <span>Choose File</span>
              </div>
            </label>
          </div>
          {isUploading && (
            <div className="mt-2 text-sm text-gray-400">
              <FaSpinner className="animate-spin inline mr-2" />
              Uploading...
            </div>
          )}
          {uploadError && (
            <div className="mt-2 text-sm text-red-400">{uploadError}</div>
          )}
        </div>

        {/* Search and Sort Controls */}
        <div className="flex flex-col space-y-2">
          <input
            type="text"
            placeholder="Search subtitles..."
            value={subtitleSearch}
            onChange={(e) => setSubtitleSearch(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white text-sm"
          />
          <select
            value={subtitleSort}
            onChange={(e) => setSubtitleSort(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white text-sm"
          >
            <option value="name">Sort by Name</option>
            <option value="language">Sort by Language</option>
            <option value="size">Sort by Size</option>
          </select>
        </div>

        {/* Subtitle List */}
        <div className="max-h-[300px] overflow-y-auto">
          <button
            onClick={() => {
              handleSubtitleChange(null);
              setShowSubtitleMenu(false);
            }}
            className={`w-full text-left px-3 py-2 rounded text-sm ${!selectedSubtitle ? "bg-blue-600" : "hover:bg-gray-700"}`}
          >
            Off
          </button>

          {/* Uploaded Subtitles Section */}
          {uploadedSubtitles.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-gray-400 px-3 py-1">
                Uploaded Subtitles ({uploadedSubtitles.length})
              </div>
              {uploadedSubtitles.map((subtitle, idx) => (
                <button
                  key={subtitle.name + "-" + idx}
                  onClick={() => {
                    handleSubtitleChange({
                      name: subtitle.name,
                      downloadUrl: subtitle.path,
                      format: subtitle.name.endsWith(".vtt") ? "vtt" : "srt",
                    });
                    setShowSubtitleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    selectedSubtitle?.name === subtitle.name
                      ? "bg-blue-600"
                      : "hover:bg-gray-700"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="truncate">{subtitle.name}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      {(subtitle.size / 1024).toFixed(1)}KB
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Online Subtitles Section */}
          {Object.entries(groupedSubtitles).map(([language, subtitles]) => (
            <div key={language} className="mt-2">
              <div className="text-xs text-gray-400 px-3 py-1">
                {language} ({subtitles.length})
              </div>
              {subtitles.map((subtitle, idx) => (
                <button
                  key={subtitle.name + "-" + idx}
                  onClick={() => {
                    handleSubtitleChange(subtitle);
                    setShowSubtitleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    selectedSubtitle?.name === subtitle.name
                      ? "bg-blue-600"
                      : "hover:bg-gray-700"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="truncate">{subtitle.name}</span>
                    {subtitle.size && (
                      <span className="text-xs text-gray-400 ml-2">
                        {(subtitle.size / 1024).toFixed(1)}KB
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>

        {filteredSubtitles.length === 0 && uploadedSubtitles.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-2">
            No subtitles found
          </div>
        )}
      </div>
    </div>
  );

  // Update the subtitle menu button to use the new render function
  const subtitleButton = (
    <div className="relative" ref={subtitleMenuRef}>
      <button
        className={`text-white hover:text-blue-400 ${selectedSubtitle ? "text-blue-400" : ""}`}
        title="Subtitles"
        onClick={() => setShowSubtitleMenu(!showSubtitleMenu)}
      >
        <FaClosedCaptioning />
      </button>
      {showSubtitleMenu && renderSubtitleMenu()}
    </div>
  );

  // Add a retry button component
  const RetryButton = () => (
    <button
      onClick={handleTorrentSearch}
      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
    >
      Retry Search
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Torrent Stream</h1>

        {/* Debug Info */}
        <div className="mb-4 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Debug Info</h3>
          <div className="text-sm">
            <p>
              Status:{" "}
              {isLoading
                ? "Loading..."
                : isBuffering
                  ? "Buffering..."
                  : "Ready"}
            </p>
            <p>Current Time: {currentTime.toFixed(2)}s</p>
            <p>Duration: {duration.toFixed(2)}s</p>
            <p>
              Buffered:{" "}
              {videoRef.current?.buffered.length
                ? `${videoRef.current.buffered.start(0).toFixed(2)}s - ${videoRef.current.buffered.end(0).toFixed(2)}s`
                : "No buffered ranges"}
            </p>
            <p>Ready State: {videoRef.current?.readyState}</p>
            <p>Network State: {videoRef.current?.networkState}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-16 p-6 bg-gray-900 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">
            Stream Torrent Video
          </h2>
          <form
            onSubmit={handleTorrentSearch}
            className="flex flex-col md:flex-row gap-2 mb-4"
          >
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="p-2 rounded bg-gray-800 text-white"
            >
              <option value="yts">YTS</option>
              <option value="1337x">1337x</option>
              <option value="thepiratebay">The Pirate Bay</option>
              <option value="torlock">Torlock</option>
              <option value="tgx">Torrent Galaxy</option>
              <option value="kickass">KickAss</option>
              <option value="limetorrent">LimeTorrents</option>
              <option value="torrentfunk">TorrentFunk</option>
              <option value="glodls">Glodls</option>
              <option value="ybt">YourBittorrent</option>
              {/* Add more as needed */}
            </select>
            <input
              type="text"
              value={torrentSearch}
              onChange={(e) => setTorrentSearch(e.target.value)}
              placeholder="Search for movies, shows..."
              className="flex-1 p-2 rounded bg-gray-800 text-white"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Search
            </button>
          </form>
          {/* Search Results */}
          <div className="mt-4">
            {isSearching ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">
                  Fetching search results... This may take a while.
                </p>
              </div>
            ) : searchError ? (
              <div className="text-center py-4">
                <div className="text-red-500 mb-2">{searchError}</div>
                <RetryButton />
              </div>
            ) : torrentResults.length > 0 ? (
              <div className="space-y-2">
                {torrentResults.map((result, idx) => (
                  <div key={idx} className="p-4 border rounded bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{result.name}</h3>
                        <p className="text-sm text-gray-600">
                          {result.size ? `Size: ${result.size} | ` : ""}
                          Provider: {selectedSite}
                        </p>
                      </div>
                    </div>
                    {/* If YTS, show qualities */}
                    {Array.isArray(result.torrents) &&
                    result.torrents.length > 0 ? (
                      <div className="flex gap-2 mt-2">
                        {result.torrents.map((torrent, qidx) => (
                          <button
                            key={qidx}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded"
                            onClick={() => {
                              setMagnet(torrent.magnet);
                              setSubmittedMagnet(torrent.magnet);
                              setSelectedFile(null);
                              setSelectedSubtitle(null);
                              setShowSubtitleMenu(false);
                              setShowPlayer(false);
                              setTorrentFiles([]);
                            }}
                          >
                            {torrent.quality} ({torrent.size})
                          </button>
                        ))}
                      </div>
                    ) : (
                      // For non-YTS, click the card to set the magnet
                      <div
                        className="cursor-pointer mt-2"
                        onClick={() => {
                          if (result.magnet) {
                            setMagnet(result.magnet);
                            setSubmittedMagnet(result.magnet);
                            setSelectedFile(null);
                            setSelectedSubtitle(null);
                            setShowSubtitleMenu(false);
                            setShowPlayer(false);
                            setTorrentFiles([]);
                          }
                        }}
                      >
                        <span className="text-blue-600 underline">
                          Use Magnet
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
            <input
              type="text"
              className="p-3 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste magnet link here..."
              value={magnet}
              onChange={(e) => setMagnet(e.target.value)}
            />
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition-colors ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Fetching Files...
                </div>
              ) : (
                "Fetch Files"
              )}
            </button>
          </form>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-8">
              <FaSpinner className="text-4xl animate-spin mb-4" />
              <p className="text-lg">Fetching torrent files...</p>
            </div>
          )}

          {/* Show file list if available */}
          {!isLoading && torrentFiles.length > 0 && !showPlayer && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">
                Files in Torrent ({torrentFiles.length})
              </h2>
              <ul className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                {torrentFiles.map((file, idx) => (
                  <li
                    key={file.name}
                    className={`flex items-center justify-between py-3 px-4 rounded hover:bg-gray-700 cursor-pointer transition-colors ${selectedFile === file.name ? "bg-blue-700" : ""}`}
                    onClick={() => handleFileSelect(file.name)}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="truncate block text-sm font-medium">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-400">{file.type}</span>
                    </div>
                    <span className="ml-4 text-sm text-gray-400 whitespace-nowrap">
                      {(file.length / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* No Files Found Message */}
          {!isLoading &&
            submittedMagnet &&
            torrentFiles.length === 0 &&
            !showPlayer && (
              <div className="text-center p-8 bg-gray-800 rounded-lg">
                <p className="text-lg text-gray-400">
                  No files found in the torrent.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Please check the magnet link and try again.
                </p>
              </div>
            )}

          {/* Show video player only after file selection */}
          {showPlayer && selectedFile && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-2">
                Now Playing: {selectedFile}
              </h3>
              <div
                ref={containerRef}
                className="relative rounded-lg overflow-hidden bg-black"
              >
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <FaSpinner className="text-white text-4xl animate-spin" />
                  </div>
                )}
                {isBuffering && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <FaSpinner className="text-white text-4xl animate-spin" />
                  </div>
                )}
                <ReactPlayer
                  url={`http://localhost:3000/stream?magnet=${encodeURIComponent(submittedMagnet)}&file=${encodeURIComponent(selectedFile)}`}
                  controls
                  width="100%"
                  height="auto"
                  playing={isPlaying}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onBuffer={() => setIsBuffering(true)}
                  onBufferEnd={() => setIsBuffering(false)}
                  onReady={() => setIsLoading(false)}
                  config={{
                    file: {
                      tracks: captions_arr,
                    },
                  }}
                />
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block font-semibold mb-2">Select Subtitle:</label>
            <ul className="flex flex-wrap gap-2">
              {captions_arr.map((cap, idx) => (
                <li key={idx}>
                  <button
                    className={`px-2 py-1 rounded ${cap.default ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
                    onClick={() => {
                      setSelectedSubtitle({
                        name: cap.label,
                        isUploaded: cap.src.startsWith(
                          "http://localhost:3000/uploads",
                        ),
                      });
                    }}
                  >
                    {cap.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {uploadedSubtitles.length > 0 && (
            <div className="mb-4">
              <label className="block font-semibold mb-2">
                Uploaded Subtitles:
              </label>
              <ul>
                {uploadedSubtitles.map((sub, idx) => (
                  <li key={idx}>
                    <button
                      className="text-blue-500 underline"
                      onClick={() =>
                        setSelectedSubtitle({
                          name: sub.name,
                          url: `http://localhost:3000${sub.path}`,
                          isUploaded: true,
                        })
                      }
                    >
                      {sub.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TorrentStream;
