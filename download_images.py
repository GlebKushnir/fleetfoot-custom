import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

BASE_URL = "https://fleetfoot-df010c0d8dc8.herokuapp.com"
MEDIA_PATH = "media/product_images"
LOCAL_MEDIA_DIR = os.path.join(os.getcwd(), "media", "product_images")

# страницы для обхода (главная + категории + пагинация)
START_URLS = [
    BASE_URL + "/",
    BASE_URL + "/products/department/mens",
    BASE_URL + "/products/department/womens",
    BASE_URL + "/products/department/kids",
]


def fetch_page(url):
    print(f"Fetching: {url}")
    r = requests.get(url)
    r.raise_for_status()
    return r.text


def extract_media_links(html):
    soup = BeautifulSoup(html, "html.parser")
    links = []
    for img in soup.find_all("img"):
        src = img.get("src", "")
        if MEDIA_PATH in src:
            full_url = urljoin(BASE_URL, src)
            links.append(full_url)
    return links


def download_file(url):
    parsed = urlparse(url)
    rel_path = parsed.path.lstrip("/")  # media/product_images/...
    local_path = os.path.join(os.getcwd(), rel_path)

    os.makedirs(os.path.dirname(local_path), exist_ok=True)

    if not os.path.exists(local_path):
        print(f"Downloading {url} -> {local_path}")
        r = requests.get(url, stream=True)
        if r.status_code == 200:
            with open(local_path, "wb") as f:
                for chunk in r.iter_content(1024):
                    f.write(chunk)
    else:
        print(f"Already exists: {local_path}")


def main():
    all_links = set()
    for url in START_URLS:
        html = fetch_page(url)
        links = extract_media_links(html)
        all_links.update(links)

    print(f"Found {len(all_links)} images")
    for link in sorted(all_links):
        download_file(link)


if __name__ == "__main__":
    main()
