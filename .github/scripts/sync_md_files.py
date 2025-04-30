import os
import git
import logging
import yaml
import hashlib
import json
from pathlib import Path
from deep_translator import GoogleTranslator
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Translation cache file
TRANSLATION_CACHE = Path('.translation_cache.json')

def load_translation_cache():
    """Load translation cache from file."""
    if TRANSLATION_CACHE.exists():
        try:
            with open(TRANSLATION_CACHE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logging.warning("Failed to load translation cache: %s", e)
    return {'translations': {}, 'hashes': {}}

def save_translation_cache(cache):
    """Save translation cache to file."""
    try:
        with open(TRANSLATION_CACHE, 'w', encoding='utf-8') as f:
            json.dump(cache, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logging.error("Failed to save translation cache: %s", e)

def clean_translation_cache(cache, zh_files):
    """Remove cache entries for non-existent zh files."""
    valid_files = {str(f) for f in zh_files}
    cleaned_translations = {
        k: v for k, v in cache['translations'].items()
        if any(k.startswith(f) for f in valid_files)
    }
    cleaned_hashes = {
        k: v for k, v in cache['hashes'].items()
        if k in valid_files
    }
    return {'translations': cleaned_translations, 'hashes': cleaned_hashes}

def get_file_hash(file_path):
    """Calculate SHA256 hash of file content."""
    sha256 = hashlib.sha256()
    try:
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b''):
                sha256.update(chunk)
        return sha256.hexdigest()
    except Exception as e:
        logging.error("Failed to calculate hash for %s: %s", file_path, e)
        return None

def translate_text(text, translator, cache_key, cache):
    """Translate text from Chinese to English, using cache if available."""
    cache_key = f"{cache_key}:{text}"
    if cache_key in cache['translations']:
        logging.info("Using cached translation for %s", cache_key)
        return cache['translations'][cache_key]

    logging.info("Starting translation of text (length: %d)", len(text))
    try:
        max_length = 5000  # Google Translate API limit
        if len(text) > max_length:
            parts = [text[i:i + max_length] for i in range(0, len(text), max_length)]
            translated_parts = []
            for i, part in enumerate(parts):
                logging.info("Translating part %d (length: %d)", i + 1, len(part))
                translated_parts.append(translator.translate(part))
            translated = ''.join(translated_parts)
        else:
            translated = translator.translate(text)
        logging.info("Translation completed successfully")
        cache['translations'][cache_key] = translated
        return translated
    except Exception as e:
        logging.error("Translation error: %s", e)
        return text  # Fallback to original text

def process_markdown_content(content, translator, file_name, cache):
    """Preserve Markdown structure, translate title, tags, and content."""
    logging.info("Processing Markdown content for %s", file_name)
    front_matter = ''
    body = content
    front_matter_dict = {}

    # Extract Front Matter
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            front_matter = parts[1]
            body = parts[2].lstrip()
            try:
                front_matter_dict = yaml.safe_load(front_matter)
            except Exception as e:
                logging.warning("Invalid Front Matter: %s", e)
        else:
            logging.warning("Invalid Front Matter detected")

    # Translate title and tags if present
    translated_front_matter = front_matter_dict.copy() if front_matter_dict else {}
    if 'title' in translated_front_matter:
        translated_front_matter['title'] = translate_text(
            translated_front_matter['title'], translator, f"{file_name}:title", cache
        )
        logging.info("Translated title: %s", translated_front_matter['title'])
    if 'tags' in translated_front_matter and isinstance(translated_front_matter['tags'], list):
        translated_front_matter['tags'] = [
            translate_text(tag, translator, f"{file_name}:tag:{i}", cache)
            for i, tag in enumerate(translated_front_matter['tags'])
        ]
        logging.info("Translated tags: %s", translated_front_matter['tags'])
    # Ensure lang is set to 'en'
    translated_front_matter['lang'] = 'en'

    # Reconstruct Front Matter
    if translated_front_matter:
        front_matter_yaml = yaml.dump(translated_front_matter, allow_unicode=True, sort_keys=False)
        front_matter = f"---\n{front_matter_yaml}---\n"

    # Translate body
    translated_body = translate_text(body, translator, f"{file_name}:body", cache)
    return front_matter + translated_body

def sync_folders(zh_path, en_path, changed_files=None):
    zh_path = Path(zh_path)
    en_path = Path(en_path)

    logging.info("Syncing folders: zh=%s, en=%s", zh_path, en_path)

    # Check if zh folder exists
    if not zh_path.exists():
        logging.warning("Folder %s does not exist", zh_path)
        return

    # Ensure en folder exists
    en_path.mkdir(parents=True, exist_ok=True)

    # Initialize translator and cache
    translator = GoogleTranslator(source='zh-CN', target='en')
    cache = load_translation_cache()

    # Get list of zh and en files
    zh_files = set(zh_path.glob('*.md'))
    en_files = set(en_path.glob('*-en.md'))  # Only match files with -en suffix

    logging.info("Found %d zh files and %d en files", len(zh_files), len(en_files))
    logging.info("zh files: %s", [f.name for f in zh_files])
    logging.info("en files: %s", [f.name for f in en_files])

    # Clean up non-standard en files
    for invalid_file in en_path.glob('*'):
        if not invalid_file.name.endswith('-en.md'):
            try:
                invalid_file.unlink()
                logging.info("Deleted invalid file %s", invalid_file)
            except Exception as e:
                logging.error("Error deleting invalid file %s: %s", invalid_file, e)

    # Normalize changed_files to handle encoded filenames
    normalized_changed_files = set()
    if changed_files:
        for f in changed_files:
            try:
                # Decode escaped filenames (e.g., \346\231\250\351\227\264\346\274\253\346\255\245)
                normalized_f = f.encode().decode('unicode_escape') if '\\' in f else f
                normalized_changed_files.add(normalized_f.strip('"'))
            except Exception as e:
                logging.warning("Failed to decode changed file %s: %s", f, e)

    logging.info("Normalized changed files: %s", normalized_changed_files)

    # Clean translation cache
    cache = clean_translation_cache(cache, zh_files)
    save_translation_cache(cache)

    # Filter zh files to process only changed or new ones
    files_to_process = set()
    for zh_file in zh_files:
        en_filename = f"{zh_file.stem}-en.md"
        en_file = en_path / en_filename
        zh_hash = get_file_hash(zh_file)
        cached_hash = cache['hashes'].get(str(zh_file), None)

        # Check if zh file is in changed_files, has changed content, or en file is missing
        zh_path_str = str(zh_file)
        zh_rel_path = str(zh_file.relative_to(zh_path))
        if (normalized_changed_files and
            (zh_path_str in normalized_changed_files or zh_rel_path in normalized_changed_files)) or \
           zh_hash != cached_hash or \
           not en_file.exists():
            files_to_process.add(zh_file)
            logging.info("Added %s to process (changed, different content, or missing en)", zh_file.name)
        else:
            logging.info("Skipped %s (unchanged and up-to-date)", zh_file.name)

    logging.info("Files to process: %s", [f.name for f in files_to_process])

    # Process zh files (add or update)
    for zh_file in files_to_process:
        en_filename = f"{zh_file.stem}-en.md"
        en_file = en_path / en_filename
        logging.info("Processing zh file: %s", zh_file)
        try:
            with open(zh_file, 'r', encoding='utf-8') as f:
                zh_content = f.read()

            # Check for merge conflict markers
            if '>>>>>>>' in zh_content or '<<<<<<<' in zh_content:
                logging.warning("Merge conflict detected in %s, skipping translation", zh_file)
                continue

            # Translate content
            en_content = process_markdown_content(zh_content, translator, zh_file.name, cache)

            # Write to en file
            with open(en_file, 'w', encoding='utf-8') as f:
                f.write(en_content)

            # Update hash in cache
            cache['hashes'][str(zh_file)] = get_file_hash(zh_file)

            if en_file in en_files:
                logging.info("Updated %s", en_file)
            else:
                logging.info("Created %s", en_file)
        except Exception as e:
            logging.error("Error processing %s: %s", zh_file, e)

    # Remove en files that no longer exist in zh
    for en_file in en_files:
        zh_filename = en_file.stem.replace('-en', '') + '.md'
        if zh_filename not in {f.name for f in zh_files}:
            try:
                en_file.unlink()
                logging.info("Deleted %s", en_file)
            except Exception as e:
                logging.error("Error deleting %s: %s", en_file, e)

    # Save translation cache
    save_translation_cache(cache)

def main():
    # Set UTF-8 encoding to handle Chinese filenames
    os.environ['LC_ALL'] = 'en_US.UTF-8'
    os.environ['LANG'] = 'en_US.UTF-8'
    logging.info("Environment set to UTF-8")

    try:
        repo = git.Repo('.')
        # Get changed files from the last commit
        changed_files = repo.git.diff_tree('--no-commit-id', '--name-only', '-r', 'HEAD^', 'HEAD').splitlines()
        logging.info("Changed files: %s", changed_files)

        # Check if any zh files changed
        folders_to_sync = set()
        for file in changed_files:
            # Normalize file path for matching
            try:
                normalized_file = file.encode().decode('unicode_escape') if '\\' in file else file
                normalized_file = normalized_file.strip('"')
            except Exception as e:
                logging.warning("Failed to decode file %s: %s", file, e)
                normalized_file = file
            if normalized_file.startswith('_posts/zh/') or normalized_file.startswith('_fragments/zh/'):
                folder = normalized_file.split('/')[0]  # _posts or _fragments
                folders_to_sync.add(folder)

        logging.info("Folders to sync: %s", folders_to_sync)

        # If no zh changes detected, check for missing or outdated en files
        if not folders_to_sync:
            logging.info("No zh changes detected, checking for missing or outdated en files")
            if Path('_posts/zh').exists() and any(Path('_posts/zh').glob('*.md')):
                folders_to_sync.add('_posts')
            if Path('_fragments/zh').exists() and any(Path('_fragments/zh').glob('*.md')):
                folders_to_sync.add('_fragments')

        # Sync changed folders
        for folder in folders_to_sync:
            logging.info("Syncing %s...", folder)
            sync_folders(f'{folder}/zh', f'{folder}/en', changed_files)
    except Exception as e:
        logging.error("Error in main: %s", e)
        raise

if __name__ == '__main__':
    main()