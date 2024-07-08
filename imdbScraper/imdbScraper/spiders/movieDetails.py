import scrapy


class IMDbMovieSpider(scrapy.Spider):
    name = 'imdb_movie'
    start_urls = ['https://www.imdb.com/title/tt0085896/']

    custom_headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Safari/537.36'
    }

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(url=url, headers=self.custom_headers, callback=self.parse)

    def parse(self, response):
        # Using CSS selector to locate the elements
        target_elements = response.css(
            'section[data-testid="MoreLikeThis"] div.ipc-poster-card')

        for element in target_elements:
            href = element.css('a::attr(href)').get()
            text = element.css('a::attr(aria-label)').get()
            poster = element.css('img.ipc-image::attr(src)').get()

            if (text is not None):
                yield {
                    'href': href,
                    'text': text,
                    'poster': poster,
                    'full_url': response.urljoin(href) if href else None
                }

        if not target_elements:
            self.logger.warning('Target elements not found on the page')
