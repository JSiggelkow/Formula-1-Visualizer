import requests
from bs4 import BeautifulSoup
import time
import re
import json
import os
from typing import Optional, Dict


class WikipediaScraper:

    def __init__(self, cache_file: str = "scraped_driver_bios.json", delay: float = 0.5):
        self.cache_file = cache_file
        self.delay = delay
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.scraped_data = {}
        self._load_cache()
    
    def _load_cache(self) -> None:
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, 'r', encoding='utf-8') as f:
                    self.scraped_data = json.load(f)
                print(f"Loaded {len(self.scraped_data)} cached entries from {self.cache_file}")
            except (json.JSONDecodeError, IOError) as e:
                print(f"Warning: Could not load cache file {self.cache_file}: {e}")
                self.scraped_data = {}
    
    def _save_cache(self) -> None:
        try:
            with open(self.cache_file, 'w', encoding='utf-8') as f:
                json.dump(self.scraped_data, f, indent=2, ensure_ascii=False)
            print(f"Saved {len(self.scraped_data)} entries to {self.cache_file}")
        except IOError as e:
            print(f"Warning: Could not save cache file {self.cache_file}: {e}")
    
    def fetch_wikipedia_about(self, url: str, driver_name: str = "") -> Optional[str]:
        if not url or url == '\\N' or url.strip() == '':
            return None
        
        if url in self.scraped_data:
            print(f"  Using cached content for {driver_name}")
            return self.scraped_data[url]
        
        try:
            # Add delay to be respectful to Wikipedia
            time.sleep(self.delay)
            
            print(f"  Fetching content from Wikipedia for {driver_name}...")
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find the main content area
            content = soup.find('div', {'id': 'mw-content-text'})
            if not content:
                print(f"  Warning: No content area found for {driver_name}")
                self.scraped_data[url] = ""
                return None
            
            # Get all content before the first h2 heading (entire overview section)
            overview_text = []
            for element in content.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
                # Stop when we hit a major heading (h2)
                if element.name == 'h2':
                    break
                    
                # Only process paragraphs
                if element.name == 'p':
                    text = element.get_text().strip()
                    # Skip short paragraphs, coordinate paragraphs, or disambiguation notes
                    if (len(text) > 50 and 
                        not text.startswith('Coordinates:') and
                        'may refer to:' not in text and
                        'disambiguation' not in text.lower() and
                        not text.startswith('This article is about')):
                        
                        overview_text.append(text)
            
            if overview_text:
                # Join all paragraphs with double newlines
                full_text = '\n\n'.join(overview_text)
                
                # Clean up the text - remove reference markers like [1], [2]
                clean_text = re.sub(r'\[\d+]', '', full_text)
                # Remove extra whitespace but preserve paragraph breaks
                clean_text = re.sub(r'\n\n+', '\n\n', clean_text)
                clean_text = re.sub(r'[ \t]+', ' ', clean_text)
                clean_text = clean_text.strip()
                
                # Limit to reasonable length (first 2000 characters for full-text search)
                if len(clean_text) > 2000:
                    clean_text = clean_text[:1997] + '...'
                
                # Cache the result
                self.scraped_data[url] = clean_text
                print(f"  Successfully scraped {len(clean_text)} characters for {driver_name}")
                return clean_text
            else:
                print(f"  Warning: No overview content found for {driver_name}")
                self.scraped_data[url] = ""
                return None
            
        except Exception as e:
            print(f"  Warning: Could not fetch Wikipedia content for {driver_name} ({url}): {e}")
            self.scraped_data[url] = ""
            return None
    
    def scrape_drivers_from_csv(self, csv_file_path: str, force_refresh: bool = False) -> Dict[str, str]:
        import csv

        if force_refresh:
            print("Force refresh enabled - clearing cache")
            self.scraped_data = {}

        drivers_to_scrape = []

        # Read CSV and collect drivers that need scraping
        with open(csv_file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                url = row.get('url', '').strip()
                if url and url != '\\N':
                    driver_name = f"{row.get('forename', '')} {row.get('surname', '')}".strip()
                    if force_refresh or url not in self.scraped_data:
                        drivers_to_scrape.append((url, driver_name))
        
        if not drivers_to_scrape:
            print("All drivers already cached - no scraping needed")
            return self.scraped_data
        
        print(f"Scraping biographical information for {len(drivers_to_scrape)} drivers...")

        # Scrape each driver
        for i, (url, driver_name) in enumerate(drivers_to_scrape):
            print(f"Processing driver {i+1}/{len(drivers_to_scrape)}: {driver_name}")
            self.fetch_wikipedia_about(url, driver_name)

        self._save_cache()
        return self.scraped_data

    def get_cached_content(self, url: str) -> Optional[str]:
        return self.scraped_data.get(url)
