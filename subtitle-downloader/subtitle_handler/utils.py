"""Utility functions for subtitle handling"""

import re
from config import Config


def validate_input(series_name, season_episode, language):
    """
    Validate user input for subtitle search

    Args:
        series_name: Name of the TV series
        season_episode: Season and episode in format "S01E01" or "1x1"
        language: Language name

    Returns:
        dict: {'valid': bool, 'error': str or None}
    """
    errors = []

    # Validate series name
    if not series_name or not isinstance(series_name, str):
        errors.append("Series name is required")
    elif len(series_name.strip()) == 0:
        errors.append("Series name cannot be empty")
    elif len(series_name) > 100:
        errors.append("Series name is too long (max 100 characters)")

    # Validate season/episode format
    if not season_episode or not isinstance(season_episode, str):
        errors.append("Season and episode information is required")
    else:
        # Try to parse S01E01 or 1x1 format
        se_pattern = r'^[sS](\d{1,2})[eE](\d{1,2})$|^(\d{1,2})[xX](\d{1,2})$'
        if not re.match(se_pattern, season_episode):
            errors.append("Invalid format. Use S01E01 or 1x1 format (e.g., S01E05 or 1x5)")

    # Validate language
    if not language or not isinstance(language, str):
        errors.append("Language is required")
    elif language not in Config.LANGUAGES:
        errors.append(f"Language not supported. Supported languages: {', '.join(Config.LANGUAGES.keys())}")

    return {
        'valid': len(errors) == 0,
        'errors': errors
    }


def get_language_code(language_name):
    """
    Convert language name to ISO 639-1 code

    Args:
        language_name: Full name of language (e.g., "English")

    Returns:
        str: Language code (e.g., "en") or None if not found
    """
    return Config.LANGUAGES.get(language_name)


def parse_season_episode(season_episode):
    """
    Parse season and episode from string

    Args:
        season_episode: String in format S01E01 or 1x1

    Returns:
        dict: {'season': int, 'episode': int} or {'valid': False}
    """
    # Try S01E01 format
    match = re.match(r'^[sS](\d{1,2})[eE](\d{1,2})$', season_episode)
    if match:
        return {'season': int(match.group(1)), 'episode': int(match.group(2)), 'valid': True}

    # Try 1x1 format
    match = re.match(r'^(\d{1,2})[xX](\d{1,2})$', season_episode)
    if match:
        return {'season': int(match.group(1)), 'episode': int(match.group(2)), 'valid': True}

    return {'valid': False}
