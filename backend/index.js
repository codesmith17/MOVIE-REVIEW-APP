const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const mongoose = require("mongoose");
const app = express();
const process = require("process");
const path = require("path");
require('dotenv').config();
const WebTorrent = require('webtorrent');
const multer = require('multer');
const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const TorrentSearchApi = require('torrent-search-api');
// const http = require('http');
// const socketIo = require('socket.io');
// const { Server } = require("socket.io");
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', // Replace with your React app's URL
    credentials: true
}));

const port = process.env.PORT || 3000;

// Create an HTTP server using the Express app


const authRoutes = require("./routes/Auth.route");
const reviewRoutes = require("./routes/Review.route");
const movieRoutes = require("./routes/Movie.route");
const commentRoutes = require("./routes/Comment.route");
const listRoutes = require("./routes/List.route");
const subtitleRoutes = require('./routes/subtitleRoutes');

mongoose.connect("mongodb+srv://krishna170902:44AueKgqHr2eDL8o@clusteracademind.ub2btq6.mongodb.net/movies-app?retryWrites=true&w=majority&appName=ClusterAcademind", {
        family: 4,
    })
    .then(_ => {
        console.log("CONNECTED");
        // Start the server
        app.listen(port, () => console.log(`Dolphin app listening on port ${port}!`));
    })
    .catch(err => console.log(err));

app.use(bodyParser.urlencoded({ extended: false }));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'test.html'));
});
app.use("/api/auth", authRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/movie", movieRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/list", listRoutes);
app.use('/api/subtitles', subtitleRoutes);

// Initialize WebTorrent client
const client = new WebTorrent({
  maxConns: 55, // Limit concurrent connections
  tracker: {
    announce: [
      'wss://tracker.openwebtorrent.com',
      'wss://tracker.btorrent.xyz'
    ]
  }
});

// Log when client is ready
client.on('ready', () => {
  console.log('WebTorrent client ready');
});

// Log when new torrent is added
client.on('torrent', (torrent) => {
  console.log('New torrent added:', torrent.infoHash);
});

// Enhanced /stream route: if no 'file' param, return file list; if 'file' param, stream that file
app.get('/stream', (req, res) => {
  console.log('Stream request received');
  console.log('Headers:', req.headers);
  
  const magnetURI = req.query.magnet;
  const fileName = req.query.file;
  
  // Validate magnet URI
  if (!magnetURI) {
    return res.status(400).json({ error: 'Magnet link is required' });
  }
  
  // Check for malformed magnet links (multiple magnet:? prefixes)
  if (magnetURI.split('magnet:?').length > 2) {
    return res.status(400).json({ error: 'Invalid magnet link: Multiple magnet links detected' });
  }
  
  if (!magnetURI.startsWith('magnet:?')) {
    return res.status(400).json({ error: 'Invalid magnet link format' });
  }

  // Validate magnet link structure
  try {
    const url = new URL(magnetURI);
    if (!url.searchParams.has('xt')) {
      return res.status(400).json({ error: 'Invalid magnet link: Missing xt parameter' });
    }
    const xt = url.searchParams.get('xt');
    if (!xt.startsWith('urn:btih:')) {
      return res.status(400).json({ error: 'Invalid magnet link: Invalid xt parameter' });
    }
  } catch (err) {
    return res.status(400).json({ error: 'Invalid magnet link format' });
  }

  // Get range header for seeking
  const range = req.headers.range;
  console.log('Range header:', range);

  // Helper to return file list
  function sendFileList(torrent) {
    const files = torrent.files.map(f => ({
      name: f.name,
      length: f.length,
      type: f.name.split('.').pop()
    }));
    res.json({ files });
  }

  // Helper to stream a specific file
  function streamTorrentFile(torrent, res, range, fileName) {
    let file;
    if (fileName) {
      file = torrent.files.find(f => f.name === fileName);
    } else {
      file = torrent.files.find(f => f.name.endsWith('.mp4') || f.name.endsWith('.mkv'));
    }
    if (!file) {
      console.error('No video file found in torrent');
      return res.status(404).send('No video file found in torrent');
    }

    console.log('Found video file:', file.name);
    console.log('File size:', file.length);
    
    // Calculate 5-minute chunk size (assuming average bitrate of 2Mbps)
    const FIVE_MINUTES_IN_BYTES = 2 * 1024 * 1024 * 5 * 60; // 2Mbps * 5 minutes
    const fileSize = file.length;
    
    let start = 0;
    let end = Math.min(FIVE_MINUTES_IN_BYTES, fileSize - 1);

    if (range) {
      console.log('Range header received:', range);
      const parts = range.replace(/bytes=/, "").split("-");
      start = parseInt(parts[0], 10);
      // If end is specified, use it; otherwise, stream next 5 minutes
      end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + FIVE_MINUTES_IN_BYTES, fileSize - 1);
      console.log('Parsed range:', { start, end });
    }

    if (start >= fileSize || end >= fileSize) {
      console.error('Invalid range:', { start, end, fileSize });
      res.status(416).send('Requested range not satisfiable');
      return;
    }

    res.status(206);
    res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
    res.setHeader('Content-Length', end - start + 1);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', 'video/mp4');

    console.log('Streaming chunk:', {
      start,
      end,
      chunkSize: end - start + 1,
      totalSize: fileSize,
      progress: ((end / fileSize) * 100).toFixed(2) + '%'
    });

    const cleanup = () => {
      console.log('Cleaning up stream');
      if (stream) {
        stream.destroy();
      }
      torrent.removeListener('error', handleError);
    };

    const handleError = (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) {
        res.status(500).send('Stream error occurred');
      }
      cleanup();
    };

    const stream = file.createReadStream({ start, end });
    
    // Log streaming progress
    let bytesStreamed = 0;
    stream.on('data', (chunk) => {
      bytesStreamed += chunk.length;
      const progress = ((bytesStreamed / (end - start + 1)) * 100).toFixed(2);
      console.log(`Streaming progress: ${progress}% (${bytesStreamed} bytes)`);
    });

    stream.on('error', handleError);
    torrent.on('error', handleError);
    
    res.on('close', () => {
      console.log('Client disconnected');
      cleanup();
    });

    stream.pipe(res);
    
    stream.on('end', () => {
      console.log('Chunk streaming completed');
      cleanup();
    });
  }

  // Check if torrent already exists
  let torrent = client.get(magnetURI);
  if (torrent) {
    console.log('Using existing torrent');
    if (torrent.ready) {
      if (!fileName && !range) {
        // No file param, no range: return file list
        sendFileList(torrent);
      } else {
        // Stream the requested file
        streamTorrentFile(torrent, res, range, fileName);
      }
    } else {
      console.log('Waiting for torrent to be ready');
      torrent.once('ready', () => {
        if (!fileName && !range) {
          sendFileList(torrent);
        } else {
          streamTorrentFile(torrent, res, range, fileName);
        }
      });
    }
  } else {
    console.log('Adding new torrent');
    try {
      client.add(magnetURI, { maxConns: 55 }, (torrent) => {
        console.log('New torrent added');
        
        // Handle torrent errors
        torrent.on('error', (err) => {
          console.error('Torrent error:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to load torrent' });
          }
        });

        torrent.once('ready', () => {
          if (!fileName && !range) {
            sendFileList(torrent);
          } else {
            streamTorrentFile(torrent, res, range, fileName);
          }
        });
      });
    } catch (err) {
      console.error('Error adding torrent:', err);
      res.status(500).json({ error: 'Failed to add torrent' });
    }
  }
});

// Helper function to convert SRT to VTT format
function convertSRTtoVTT(srtContent) {
  // Add VTT header
  let vttContent = 'WEBVTT\n\n';
  
  // Split into subtitle blocks
  const blocks = srtContent.trim().split(/\r?\n\r?\n/);
  
  blocks.forEach(block => {
    // Skip empty blocks
    if (!block.trim()) return;
    
    const lines = block.split(/\r?\n/);
    if (lines.length < 3) return; // Skip invalid blocks
    
    // Convert timestamp format
    const timestamp = lines[1].replace(/,/g, '.');
    const [start, end] = timestamp.split(' --> ');
    
    // Add timestamp and text
    vttContent += `${start} --> ${end}\n`;
    vttContent += lines.slice(2).join('\n') + '\n\n';
  });
  
  return vttContent;
}

// Route to list available subtitle files in the torrent
app.get('/subtitles', (req, res) => {
  const magnetURI = req.query.magnet;
  if (!magnetURI) {
    return res.status(400).send('Magnet link required');
  }

  let torrent = client.get(magnetURI);
  if (torrent) {
    if (torrent.ready) {
      const subtitleFiles = torrent.files.filter(f => f.name.endsWith('.srt') || f.name.endsWith('.vtt'));
      res.json(subtitleFiles.map(f => ({ name: f.name })));
    } else {
      torrent.once('ready', () => {
        const subtitleFiles = torrent.files.filter(f => f.name.endsWith('.srt') || f.name.endsWith('.vtt'));
        res.json(subtitleFiles.map(f => ({ name: f.name })));
      });
    }
  } else {
    client.add(magnetURI, (torrent) => {
      torrent.once('ready', () => {
        const subtitleFiles = torrent.files.filter(f => f.name.endsWith('.srt') || f.name.endsWith('.vtt'));
        res.json(subtitleFiles.map(f => ({ name: f.name })));
      });
    });
  }
});

// Route to stream a specific subtitle file
app.get('/subtitle', (req, res) => {
  const magnetURI = req.query.magnet;
  const fileName = req.query.name;
  if (!magnetURI || !fileName) {
    return res.status(400).send('Magnet link and file name required');
  }

  let torrent = client.get(magnetURI);
  function sendSubtitleFile(torrent) {
    const file = torrent.files.find(f => f.name === fileName);
    if (!file) {
      return res.status(404).send('Subtitle file not found');
    }

    // Set appropriate content type based on file extension
    const ext = fileName.split('.').pop().toLowerCase();
    const contentType = ext === 'vtt' ? 'text/vtt' : 'application/x-subrip';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const stream = file.createReadStream();
    
    // If it's an SRT file, convert to VTT
    if (ext === 'srt') {
      let srtContent = '';
      stream.on('data', chunk => {
        srtContent += chunk.toString();
      });
      
      stream.on('end', () => {
        const vttContent = convertSRTtoVTT(srtContent);
        res.send(vttContent);
      });
    } else {
      // For VTT files, stream directly
      stream.pipe(res);
    }
    
    stream.on('error', (err) => {
      console.error('Error streaming subtitle:', err);
      if (!res.headersSent) {
        res.status(500).send('Error streaming subtitle file');
      }
    });
  }

  if (torrent) {
    if (torrent.ready) {
      sendSubtitleFile(torrent);
    } else {
      torrent.once('ready', () => sendSubtitleFile(torrent));
    }
  } else {
    client.add(magnetURI, (torrent) => {
      torrent.once('ready', () => sendSubtitleFile(torrent));
    });
  }
});

// Configure multer for subtitle uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads', 'subtitles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow .srt and .vtt files, case-insensitive
  const ext = file.originalname.split('.').pop().toLowerCase();
  if (ext === 'srt' || ext === 'vtt') {
    cb(null, true);
  } else {
    cb(new Error('Only .srt and .vtt files are allowed'));
  }
};

const upload = multer({ storage, fileFilter });

// Add subtitle upload endpoint
app.post('/api/subtitles/upload', upload.single('subtitle'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No subtitle file uploaded' });
    }

    const ext = req.file.originalname.split('.').pop().toLowerCase();
    let subtitleInfo = {
      name: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      language: req.body.language || 'en',
      uploadedAt: new Date()
    };

    // If SRT, convert to VTT and update info
    if (ext === 'srt') {
      const srtPath = req.file.path;
      const vttPath = srtPath.replace(/\.srt$/i, '.vtt');
      const srtContent = fs.readFileSync(srtPath, 'utf8');
      const vttContent = convertSRTtoVTT(srtContent);
      fs.writeFileSync(vttPath, vttContent, 'utf8');
      // Optionally, delete the original .srt file
      fs.unlinkSync(srtPath);
      subtitleInfo = {
        ...subtitleInfo,
        name: req.file.originalname.replace(/\.srt$/i, '.vtt'),
        path: vttPath,
        mimetype: 'text/vtt',
      };
    }

    res.json({
      message: 'Subtitle uploaded successfully',
      subtitle: subtitleInfo
    });
  } catch (error) {
    console.error('Error uploading subtitle:', error);
    res.status(500).json({ error: 'Failed to upload subtitle' });
  }
});

// Add endpoint to get uploaded subtitles (only .vtt)
app.get('/api/subtitles/uploaded', (req, res) => {
  const subtitlesDir = path.join(__dirname, 'uploads', 'subtitles');
  try {
    if (!fs.existsSync(subtitlesDir)) {
      return res.json({ subtitles: [] });
    }
    const files = fs.readdirSync(subtitlesDir).filter(f => f.endsWith('.vtt'));
    const subtitles = files.map(file => ({
      name: file,
      path: `/uploads/subtitles/${file}`,
      size: fs.statSync(path.join(subtitlesDir, file)).size,
      uploadedAt: fs.statSync(path.join(subtitlesDir, file)).mtime
    }));
    res.json({ subtitles });
  } catch (error) {
    console.error('Error getting uploaded subtitles:', error);
    res.status(500).json({ error: 'Failed to get uploaded subtitles' });
  }
});

// Serve uploaded subtitles
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// List all available providers and their categories
app.get('/api/torrents/providers', (req, res) => {
  const providers = TorrentSearchApi.getProviders();
  res.json(providers);
});

// YTS API configuration
const YTS_API_BASE = 'https://yts.mx/api/v2';
const YTS_API_KEY = process.env.YTS_API_KEY || ''; // Optional API key

// Helper function to search YTS
async function searchYTS(query, limit = 20) {
  try {
    const response = await fetch(`${YTS_API_BASE}/list_movies.json?query_term=${encodeURIComponent(query)}&limit=${limit}`);
    const data = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error(data.status_message || 'Failed to fetch from YTS');
    }

    return data.data.movies.map(movie => {
      // Get the best quality torrent
      const torrents = movie.torrents || [];
      const bestTorrent = torrents.reduce((best, current) => {
        const bestQuality = parseInt(best.quality.replace('p', ''));
        const currentQuality = parseInt(current.quality.replace('p', ''));
        return currentQuality > bestQuality ? current : best;
      }, torrents[0]);

      return {
        name: movie.title_long || movie.title,
        size: bestTorrent?.size || '',
        quality: bestTorrent?.quality || '',
        seeders: bestTorrent?.seeds || 0,
        magnet: bestTorrent?.hash ? `magnet:?xt=urn:btih:${bestTorrent.hash}&dn=${encodeURIComponent(movie.title)}` : null,
        provider: 'YTS',
        year: movie.year,
        rating: movie.rating,
        language: movie.language,
        genres: movie.genres,
        synopsis: movie.synopsis,
        runtime: movie.runtime,
        coverImage: movie.large_cover_image,
        allTorrents: torrents.map(t => ({
          quality: t.quality,
          size: t.size,
          seeds: t.seeds,
          peers: t.peers,
          magnet: `magnet:?xt=urn:btih:${t.hash}&dn=${encodeURIComponent(movie.title)}`
        }))
      };
    });
  } catch (error) {
    console.error('YTS API Error:', error);
    throw error;
  }
}

// Replace the old search endpoint with YTS API
app.get('/api/torrents/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Missing search query' });

  try {
    const results = await searchYTS(query);
    
    if (results.length === 0) {
      return res.json([]);
    }

    // Sort by quality and then by seeders
    results.sort((a, b) => {
      const qualityOrder = {
        '4K': 3,
        '2160P': 3,
        '1080P': 2,
        '720P': 1
      };
      const aQuality = (a.quality || '').toUpperCase();
      const bQuality = (b.quality || '').toUpperCase();
      const qualityDiff = (qualityOrder[bQuality] || 0) - (qualityOrder[aQuality] || 0);
      if (qualityDiff !== 0) return qualityDiff;
      return (b.seeders || 0) - (a.seeders || 0);
    });

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Failed to search movies',
      message: 'The search service is temporarily unavailable. Please try again in a few minutes.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/subtitles/search', async (req, res) => {
  try {
    // ... your subtitle search logic ...
    // Assume subtitlesArray is the result (should be an array)
    res.json(Array.isArray(subtitlesArray) ? subtitlesArray : []);
  } catch (err) {
    console.error('Subtitle search error:', err);
    res.json([]); // Always return an array
  }
});

module.exports = app;
// // Video call room functionality

// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: ["http://localhost:5173", "https://29lgn497-5173.euw.devtunnels.ms"], // Your React app's URL
//         methods: ["GET", "POST"],
//     },
// });

// const emailToSocketIdMap = new Map();
// const socketidToEmailMap = new Map();

// io.on("connection", (socket) => {
//     console.log(`Socket Connected`, socket.id);
//     socket.on("room:join", (data) => {
//         const { email, room } = data;
//         emailToSocketIdMap.set(email, socket.id);
//         socketidToEmailMap.set(socket.id, email);
//         io.to(room).emit("user:joined", { email, id: socket.id });
//         socket.join(room);
//         io.to(socket.id).emit("room:join", data);
//     });

//     socket.on("user:call", ({ to, offer }) => {
//         io.to(to).emit("incomming:call", { from: socket.id, offer });
//     });

//     socket.on("call:accepted", ({ to, ans }) => {
//         io.to(to).emit("call:accepted", { from: socket.id, ans });
//     });

//     socket.on("peer:nego:needed", ({ to, offer }) => {
//         console.log("peer:nego:needed", offer);
//         io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
//     });

//     socket.on("peer:nego:done", ({ to, ans }) => {
//         console.log("peer:nego:done", ans);
//         io.to(to).emit("peer:nego:final", { from: socket.id, ans });
//     });
// });