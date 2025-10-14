const { parse } = require("subtitle");
const { promisify } = require("util");
const { gunzip } = require("zlib");
const gunzipAsync = promisify(gunzip);
const https = require("https");

// Subtitle search sources
const SUBTITLE_SOURCES = {
  OPENSUBTITLES: "opensubtitles",
  SUBSCENE: "subscene",
  SUBDB: "subdb",
};

// Cache for subtitle search results
const subtitleCache = new Map();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

class SubtitleController {
  // Search subtitles from multiple sources
  async searchSubtitles(req, res) {
    try {
      const { query, imdbId, season, episode, language = "en" } = req.query;

      if (!query && !imdbId) {
        return res.status(400).json({ error: "Query or IMDB ID is required" });
      }

      // Check cache first
      const cacheKey = `${query}-${imdbId}-${season}-${episode}-${language}`;
      const cachedResult = subtitleCache.get(cacheKey);
      if (
        cachedResult &&
        Date.now() - cachedResult.timestamp < CACHE_DURATION
      ) {
        return res.json(cachedResult.data);
      }

      // Search from multiple sources in parallel
      const searchPromises = [
        this.searchOpenSubtitles(query, imdbId, season, episode, language),
        this.searchSubDB(query, imdbId),
        // Add more subtitle sources here
      ];

      const results = await Promise.allSettled(searchPromises);

      // Combine and deduplicate results
      const subtitles = results
        .filter((result) => result.status === "fulfilled")
        .flatMap((result) => result.value)
        .filter(
          (subtitle, index, self) =>
            index === self.findIndex((s) => s.hash === subtitle.hash),
        );

      // Cache the results
      subtitleCache.set(cacheKey, {
        data: subtitles,
        timestamp: Date.now(),
      });

      res.json(subtitles);
    } catch (error) {
      console.error("Subtitle search error:", error);
      res.status(500).json({ error: "Failed to search subtitles" });
    }
  }

  // Search OpenSubtitles
  async searchOpenSubtitles(query, imdbId, season, episode, language) {
    try {
      const apiKey = process.env.OPENSUBTITLES_API_KEY;
      if (!apiKey) {
        console.warn("OpenSubtitles API key not configured");
        return [];
      }

      const params = new URLSearchParams({
        query,
        imdb_id: imdbId,
        season_number: season,
        episode_number: episode,
        languages: language,
      });

      const response = await fetch(
        `https://api.opensubtitles.com/api/v1/subtitles?${params}`,
        {
          headers: {
            "Api-Key": apiKey,
            "User-Agent": "MovieReviewApp/1.0",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`OpenSubtitles API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.map((sub) => ({
        id: sub.id,
        name: sub.attributes.release,
        language: sub.attributes.language,
        source: SUBTITLE_SOURCES.OPENSUBTITLES,
        downloadUrl: sub.attributes.files[0].file_url,
        format: sub.attributes.files[0].format,
        size: sub.attributes.files[0].file_size,
        hash: sub.attributes.files[0].file_hash,
        score: this.calculateSubtitleScore(sub.attributes),
      }));
    } catch (error) {
      console.error("OpenSubtitles search error:", error);
      return [];
    }
  }

  // Search SubDB
  async searchSubDB(query, imdbId) {
    try {
      // Implement SubDB search
      // This is a placeholder for SubDB implementation
      return [];
    } catch (error) {
      console.error("SubDB search error:", error);
      return [];
    }
  }

  // Calculate subtitle score based on various factors
  calculateSubtitleScore(attributes) {
    let score = 0;

    // Higher score for HD content
    if (attributes.moviehash_match) score += 10;
    if (attributes.hearing_impaired) score += 5;
    if (attributes.foreign_parts_only) score -= 5;

    // Score based on download count
    score += Math.min(attributes.download_count / 1000, 10);

    // Score based on upload date (newer is better)
    const uploadDate = new Date(attributes.upload_date);
    const now = new Date();
    const daysOld = (now - uploadDate) / (1000 * 60 * 60 * 24);
    score += Math.max(10 - daysOld, 0);

    return score;
  }

  // Download and parse subtitle
  async downloadSubtitle(req, res) {
    try {
      const { url, format } = req.query;

      if (!url) {
        return res.status(400).json({ error: "Subtitle URL is required" });
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download subtitle: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      let subtitleContent;

      if (format === "gz") {
        subtitleContent = await gunzipAsync(Buffer.from(buffer));
      } else {
        subtitleContent = Buffer.from(buffer);
      }

      const subtitles = parse(subtitleContent.toString());

      res.json(subtitles);
    } catch (error) {
      console.error("Subtitle download error:", error);
      res.status(500).json({ error: "Failed to download subtitle" });
    }
  }
}

module.exports = new SubtitleController();
