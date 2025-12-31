const axios = require('axios');

class YouTubeService {
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
  }

  /**
   * Search for YouTube videos
   * @param {string} query - Search query (song name + artist)
   * @param {number} maxResults - Maximum number of results (default: 5)
   * @returns {Promise<Array>} Array of video results
   */
  async searchVideos(query, maxResults = 5) {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          maxResults: maxResults,
          key: this.apiKey,
          videoCategoryId: '10' // Music category
        }
      });

      return response.data.items.map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        youtubeUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
      }));
    } catch (error) {
      console.error('YouTube API Error:', error.response?.data || error.message);
      throw new Error('Failed to search YouTube videos');
    }
  }

  /**
   * Get video details by ID
   * @param {string} videoId - YouTube video ID
   * @returns {Promise<Object>} Video details
   */
  async getVideoDetails(videoId) {
    try {
      const response = await axios.get(`${this.baseUrl}/videos`, {
        params: {
          part: 'snippet,contentDetails,statistics',
          id: videoId,
          key: this.apiKey
        }
      });

      if (response.data.items.length === 0) {
        throw new Error('Video not found');
      }

      const video = response.data.items[0];
      return {
        videoId: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high.url,
        channelTitle: video.snippet.channelTitle,
        duration: video.contentDetails.duration,
        viewCount: video.statistics.viewCount,
        likeCount: video.statistics.likeCount,
        youtubeUrl: `https://www.youtube.com/watch?v=${video.id}`
      };
    } catch (error) {
      console.error('YouTube API Error:', error.response?.data || error.message);
      throw new Error('Failed to get video details');
    }
  }

  /**
   * Extract video ID from YouTube URL
   * @param {string} url - YouTube URL
   * @returns {string|null} Video ID or null
   */
  extractVideoId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  /**
   * Get thumbnail URL for a video ID
   * @param {string} videoId - YouTube video ID
   * @param {string} quality - Thumbnail quality (default, medium, high, maxres)
   * @returns {string} Thumbnail URL
   */
  getThumbnailUrl(videoId, quality = 'high') {
    const qualityMap = {
      default: 'default.jpg',
      medium: 'mqdefault.jpg',
      high: 'hqdefault.jpg',
      maxres: 'maxresdefault.jpg'
    };
    return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality] || qualityMap.high}`;
  }
}

module.exports = new YouTubeService();
