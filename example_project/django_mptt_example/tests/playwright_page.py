from playwright import sync_playwright


class PlaywrightPage:
    def __init__(self, live_server_url):
        self.live_server_url = live_server_url

        self.playwright = sync_playwright().start()
        self.browser = self.playwright.chromium.launch()
        self.page = self.browser.newPage()

    def close(self):
        self.browser.close()
        self.playwright.stop()

    def find_title_element(self, title):
        element = self.page.querySelector(f'css=.jqtree-title >> text="{title}"')
        assert element
        return element

    def login(self, username, password):
        page = self.page

        page.goto(self.live_server_url + '/login/')
        page.waitForSelector('text=Username:')

        page.fill('#id_username', username)
        page.fill('#id_password', password)
        page.click('input[type=submit]')
        page.waitForLoadState('load')
        page.waitForSelector('text=Site administration')

    def node_titles(self):
        return [e.textContent() for e in self.page.querySelectorAll('.jqtree-title')]

    def visit_countries_page(self):
        page = self.page
        page.goto(self.live_server_url + '/django_mptt_example/country/')
        page.waitForSelector('text=Select country to change')
