"""OpenSubtitles API handler"""

import requests
import logging
from config import Config
from .utils import parse_season_episode

logger = logging.getLogger(__name__)


class OpenSubtitlesHandler:
    """Handler for OpenSubtitles API interactions"""

    def __init__(self):
        self.api_url = Config.OPENSUBTITLES_API_URL
        self.user_agent = Config.OPENSUBTITLES_USER_AGENT
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': self.user_agent
        })

    def search_subtitles(self, series_name, season_episode, language_code):
        """
        Search for subtitles on OpenSubtitles

        Args:
            series_name: Name of the TV series
            season_episode: Season and episode (e.g., S01E01)
            language_code: Language code (e.g., en, es, fr)

        Returns:
            list: List of subtitle results or empty list if none found
        """
        try:
            se_info = parse_season_episode(season_episode)
            if not se_info.get('valid'):
                logger.error(f"Invalid season/episode format: {season_episode}")
                return []

            season = se_info['season']
            episode = se_info['episode']

            # Build search parameters for OpenSubtitles API
            params = {
                'query': series_name,
                'season_number': season,
                'episode_number': episode,
                'languages': language_code,
            }

            logger.info(f"Searching subtitles: {series_name} S{season:02d}E{episode:02d} ({language_code})")

            # Make API request
            response = self.session.get(
                f"{self.api_url}/search",
                params=params,
                timeout=10
            )
            response.raise_for_status()

            data = response.json()

            # Parse and format results
            subtitles = []
            if 'data' in data:
                for item in data['data']:
                    subtitle = {
                        'id': item.get('id'),
                        'file_name': item.get('attributes', {}).get('files', [{}])[0].get('file_name', ''),
                        'language': item.get('attributes', {}).get('language', ''),
                        'release_name': item.get('attributes', {}).get('release', ''),
                        'upload_date': item.get('attributes', {}).get('upload_date', ''),
                        'downloads': item.get('attributes', {}).get('download_count', 0),
                        'url': item.get('attributes', {}).get('url', ''),
                    }
                    subtitles.append(subtitle)

            logger.info(f"Found {len(subtitles)} subtitles")
            return subtitles

        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Error searching subtitles: {str(e)}")
            return []

    def download_subtitle(self, subtitle_id):
        """
        Download subtitle file from OpenSubtitles

        Args:
            subtitle_id: ID of the subtitle to download

        Returns:
            tuple: (content, file_name) or (None, None) on failure
        """
        try:
            # Get download link for subtitle
            response = self.session.get(
                f"{self.api_url}/subtitles/{subtitle_id}/download",
                timeout=10
            )
            response.raise_for_status()

            data = response.json()

            if 'link' in data:
                # Download the actual subtitle file
                download_response = self.session.get(
                    data['link'],
                    timeout=30
                )
                download_response.raise_for_status()

                # Extract filename from response headers if available
                file_name = subtitle_id + '.srt'
                if 'content-disposition' in download_response.headers:
                    import re
                    match = re.search(r'filename="?(.+?)"?(?:;|$)', download_response.headers['content-disposition'])
                    if match:
                        file_name = match.group(1)

                logger.info(f"Downloaded subtitle: {file_name}")
                return download_response.content, file_name

            logger.error(f"No download link found for subtitle {subtitle_id}")
            return None, None

        except requests.exceptions.RequestException as e:
            logger.error(f"Download failed: {str(e)}")
            return None, None
        except Exception as e:
            logger.error(f"Error downloading subtitle: {str(e)}")
            return None, None

    def get_supported_languages(self):
        """
        Get list of supported languages from OpenSubtitles API

        Returns:
            dict: Dictionary of language codes and names
        """
        try:
            response = self.session.get(
                f"{self.api_url}/languages",
                timeout=10
            )
            response.raise_for_status()

            data = response.json()
            languages = {}

            if 'data' in data:
                for lang in data['data']:
                    languages[lang.get('code')] = lang.get('name')

            return languages

        except Exception as e:
            logger.error(f"Error fetching languages: {str(e)}")
            return Config.LANGUAGES
