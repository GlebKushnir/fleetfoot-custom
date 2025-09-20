import os
import re
import time
from collections import deque
from urllib.parse import urljoin, urlparse, urldefrag

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://fleetfoot-df010c0d8dc8.herokuapp.com"
MEDIA_PREFIX = "/media/product_images/"
LOCAL_MEDIA_ROOT = os.path.join(os.getcwd(), "media", "product_images")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; FleetfootCrawler/1.0; +https://example.com)"
}

# Куда ходим/не ходим
ALLOW_PATH_PREFIXES = ("/", "/products")
DISALLOW_PATH_PREFIXES = ("/admin", "/static", "/media", "/accounts/logout")

MAX_PAGES = 500  # страховка от бесконечного обхода
REQUEST_TIMEOUT = 15
CRAWL_DELAY = 0.2  # быть вежливыми

session = requests.Session()
session.headers.update(HEADERS)


def norm_url(href, base=BASE_URL):
    if not href:
        return None
    href = urljoin(base, href)
    href, _frag = urldefrag(href)  # убрать #anchors
    return href


def same_origin(url):
    return urlparse(url).netloc == urlparse(BASE_URL).netloc


def allowed_path(path):
    # Не лезем в admin/static/media, остальное разрешаем
    for bad in DISALLOW_PATH_PREFIXES:
        if path.startswith(bad):
            return False
    for good in ALLOW_PATH_PREFIXES:
        if path.startswith(good):
            return True
    return False


def fetch(url):
    resp = session.get(url, timeout=REQUEST_TIMEOUT)
    resp.raise_for_status()
    return resp.text


def extract_links_and_media(html, page_url):
    soup = BeautifulSoup(html, "html.parser")
    links = set()
    media = set()

    # A. собрать ссылки для краулинга
    for a in soup.find_all("a", href=True):
        u = norm_url(a["href"], page_url)
        if not u:
            continue
        if same_origin(u) and allowed_path(urlparse(u).path):
            links.add(u)

    # B. собрать картинки из <img src> и <img srcset>
    for img in soup.find_all("img"):
        src = img.get("src")
        if src and MEDIA_PREFIX in src:
            media.add(norm_url(src, page_url))
        srcset = img.get("srcset")
        if srcset:
            for part in srcset.split(","):
                u = part.strip().split(" ")[0]
                if MEDIA_PREFIX in u:
                    media.add(norm_url(u, page_url))

    # C. <picture><source srcset="...">
    for source in soup.find_all("source"):
        srcset = source.get("srcset")
        if srcset:
            for part in srcset.split(","):
                u = part.strip().split(" ")[0]
                if MEDIA_PREFIX in u:
                    media.add(norm_url(u, page_url))

    # (не трогаем CSS background и т.п., здесь всё через <img>/<source>)
    return links, media


def save_media(url):
    path = urlparse(url).path  # /media/product_images/...
    if not path.startswith(MEDIA_PREFIX):
        return False
    local_path = os.path.join(os.getcwd(), path.lstrip("/"))
    os.makedirs(os.path.dirname(local_path), exist_ok=True)

    if os.path.exists(local_path):
        # уже скачано
        return False

    r = session.get(url, stream=True, timeout=REQUEST_TIMEOUT)
    if r.status_code == 200:
        with open(local_path, "wb") as f:
            for chunk in r.iter_content(1024 * 16):
                if chunk:
                    f.write(chunk)

        print(f"✔ Downloaded: {url} -> {local_path}")
        return True
    else:
        print(f"✖ Failed ({r.status_code}): {url}")
        return False


def crawl(start_url=BASE_URL + "/"):
    q = deque([start_url])
    visited = set()
    found_media = set()
    pages_crawled = 0

    while q and pages_crawled < MAX_PAGES:
        url = q.popleft()
        if url in visited:
            continue
        visited.add(url)
        try:
            html = fetch(url)
        except Exception as e:
            print(f"✖ Error fetching {url}: {e}")
            continue

        pages_crawled += 1
        print(f"[{pages_crawled}] Crawled: {url}")

        links, media = extract_links_and_media(html, url)
        found_media.update(media)

        # кладём новые ссылки в очередь
        for u in links:
            if u not in visited:
                q.append(u)

        time.sleep(CRAWL_DELAY)

    print(f"\nCrawled pages: {pages_crawled}")
    print(f"Media links found: {len(found_media)}")
    return found_media


def main():
    # 1) Полный обход сайта
    media_links = crawl(BASE_URL + "/")

    # 2) Доп. точки входа (на случай если что-то не связано ссылками)
    extra_entrypoints = [
        "/products/department/mens",
        "/products/department/womens",
        "/products/department/kids",
    ]
    for ep in extra_entrypoints:
        try:
            html = fetch(urljoin(BASE_URL, ep))
            links, media = extract_links_and_media(html, urljoin(BASE_URL, ep))
            media_links.update(media)
        except Exception as e:
            print(f"Warn: cannot fetch {ep}: {e}")

    print(f"\nTotal unique media to download: {len(media_links)}")

    # 3) Скачивание
    downloaded = 0
    for m in sorted(media_links):
        if save_media(m):
            downloaded += 1

    print(f"\nDone. Downloaded {downloaded} files into {LOCAL_MEDIA_ROOT}")


if __name__ == "__main__":
    os.makedirs(LOCAL_MEDIA_ROOT, exist_ok=True)
    main()
