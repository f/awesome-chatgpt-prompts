"""Flask application for Subtitle Downloader"""

import os
import logging
from flask import Flask, render_template, request, jsonify, send_file
from io import BytesIO
from config import config
from subtitle_handler import OpenSubtitlesHandler, validate_input, get_language_code

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)

# Load configuration
env = os.environ.get('FLASK_ENV', 'development')
app.config.from_object(config[env])

# Initialize OpenSubtitles handler
handler = OpenSubtitlesHandler()


@app.route('/')
def index():
    """Render main page"""
    return render_template('index.html')


@app.route('/api/search', methods=['POST'])
def search_subtitles():
    """
    API endpoint to search for subtitles

    Expected JSON:
    {
        "series_name": "Breaking Bad",
        "season_episode": "S01E01",
        "language": "English"
    }
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400

        series_name = data.get('series_name', '').strip()
        season_episode = data.get('season_episode', '').strip()
        language = data.get('language', '').strip()

        # Validate input
        validation = validate_input(series_name, season_episode, language)
        if not validation['valid']:
            return jsonify({
                'error': 'Validation failed',
                'errors': validation['errors']
            }), 400

        # Get language code
        language_code = get_language_code(language)

        # Search for subtitles
        subtitles = handler.search_subtitles(series_name, season_episode, language_code)

        if not subtitles:
            return jsonify({
                'success': True,
                'message': 'No subtitles found for this series and episode',
                'results': []
            }), 200

        return jsonify({
            'success': True,
            'message': f'Found {len(subtitles)} subtitle(s)',
            'results': subtitles
        }), 200

    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        return jsonify({'error': 'An error occurred during search'}), 500


@app.route('/api/download/<subtitle_id>', methods=['GET'])
def download_subtitle(subtitle_id):
    """
    API endpoint to download a subtitle file

    Args:
        subtitle_id: ID of the subtitle to download
    """
    try:
        # Download subtitle
        content, file_name = handler.download_subtitle(subtitle_id)

        if content is None:
            return jsonify({'error': 'Failed to download subtitle'}), 500

        # Return file as attachment
        return send_file(
            BytesIO(content),
            mimetype='text/plain',
            as_attachment=True,
            download_name=file_name
        )

    except Exception as e:
        logger.error(f"Download error: {str(e)}")
        return jsonify({'error': 'An error occurred during download'}), 500


@app.route('/api/languages', methods=['GET'])
def get_languages():
    """API endpoint to get list of supported languages"""
    try:
        languages = handler.get_supported_languages()
        return jsonify({
            'success': True,
            'languages': languages
        }), 200
    except Exception as e:
        logger.error(f"Languages error: {str(e)}")
        return jsonify({'error': 'Failed to fetch languages'}), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def server_error(error):
    """Handle 500 errors"""
    logger.error(f"Server error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    # Create downloads folder if it doesn't exist
    os.makedirs(app.config['DOWNLOAD_FOLDER'], exist_ok=True)

    # Run the Flask app
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=app.config['DEBUG']
    )
