from playwright import sync_playwright
from playwright.sync_api import ElementHandle
from .utils import wait_until


class PlaywrightPage:
    def __init__(self, live_server_url):
        self.live_server_url = live_server_url

        self.playwright = sync_playwright().start()
        self.browser = self.playwright.chromium.launch()
        self.page = self.browser.newPage()

    def close(self):
        self.browser.close()
        self.playwright.stop()

    def edit_node(self, title):
        self.find_edit_link(title, '(edit)').click()
        self.page.waitForSelector('text="Change country"')

    def find_edit_link(self, node_title, link_title):
        links = [
            e for e in self.find_node_element(node_title).querySelectorAll('a.edit')
            if e.textContent() == link_title
        ]
        return links[0]

    def find_input(self, name):
        return self.page.querySelector(f"input[name='{name}']")

    def find_link(self, label):
        return self.page.querySelector(f'css=a >> text="{label}"')

    def find_node_element(self, title) -> ElementHandle:
        node_element = self.find_title_element(title).evaluateHandle(
            """
            function(el) {
                const li = el.closest("li");
    
                if (!li) {
                    throw Error("Node element not found");
                }
    
                return li;
            }
            """
        )
        assert node_element
        return node_element

    def find_title_element(self, title) -> ElementHandle:
        element = self.page.querySelector(f'css=.jqtree-title >> text="{title}"')
        assert element
        return element

    def find_toggler(self, node_element: ElementHandle) -> ElementHandle:
        toggler = node_element.querySelector('.jqtree-toggler')
        assert toggler
        return toggler

    def grid_view(self):
        self.find_link('Grid view').click()
        self.page.waitForSelector('#result_list')

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

    def open_node(self, title):
        node_element = self.find_node_element(title)
        toggler = self.find_toggler(node_element)
        toggler.click()

        if 'jqtree-loading' in node_element.getAttribute('class'):
            wait_until(lambda: 'jqtree-loading' not in node_element.getAttribute('class'))

    def save_form(self):
        self.page.querySelector("input[value='Save']").click()
        self.page.waitForSelector('li.success')

    def select_node(self, title):
        self.find_title_element(title).click()

    def selected_node(self):
        return self.page.querySelector('.jqtree-selected > .jqtree-element > .jqtree-title')

    def tree_view(self):
        self.find_link('Tree view').click()
        self.page.waitForSelector('css=#tree >> text=Oceania')

    def visit_countries_page(self):
        page = self.page
        page.goto(self.live_server_url + '/django_mptt_example/country/')
        page.waitForSelector('text=Select country to change')
        page.waitForSelector('css=#tree >> text=Oceania')

    def wait_for_text(self, text):
        self.page.waitForSelector(f'text="{text}"')
