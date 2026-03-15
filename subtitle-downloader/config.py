import os

class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    DEBUG = False
    TESTING = False

    # OpenSubtitles API settings
    OPENSUBTITLES_API_URL = 'https://api.opensubtitles.com/api/v1'
    OPENSUBTITLES_USER_AGENT = 'DownloadSubtitles v1.0'

    # Supported languages mapping
    LANGUAGES = {
        'English': 'en',
        'Spanish': 'es',
        'French': 'fr',
        'German': 'de',
        'Italian': 'it',
        'Portuguese': 'pt',
        'Russian': 'ru',
        'Japanese': 'ja',
        'Korean': 'ko',
        'Chinese': 'zh',
        'Dutch': 'nl',
        'Polish': 'pl',
        'Turkish': 'tr',
        'Greek': 'el',
        'Swedish': 'sv',
        'Norwegian': 'no',
        'Danish': 'da',
        'Finnish': 'fi',
        'Arabic': 'ar',
        'Hebrew': 'he',
    }

    # File settings
    DOWNLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'downloads')
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50 MB max file size


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
