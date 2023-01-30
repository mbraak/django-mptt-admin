from uuid import uuid4
from playwright.sync_api import ElementHandle, sync_playwright
from .utils import wait_until, write_json


class PlaywrightPage:
    def __init__(self, live_server_url):
        self.live_server_url = live_server_url

        self.playwright = sync_playwright().start()
        self.browser = self.playwright.chromium.launch(headless=True)
        self.page = self.browser.new_page()

    def abort_requests(self):
        self.page.route("**", lambda route, _request: route.abort())

    def reset_abort_requests(self):
        self.page.unroute("**")

    def add_node(self, parent_title):
        self.find_edit_link(parent_title, "(add)").click()
        self.wait_for_text("Add country")

    def close(self):
        self.browser.close()
        self.playwright.stop()

    def close_node(self, title):
        self.toggle_node(title)

    def drag_and_drop(self, from_title, to_title):
        from_rect = self.find_title_element(from_title).bounding_box()
        to_rect = self.find_title_element(to_title).bounding_box()

        self.page.mouse.move(
            from_rect["x"] + from_rect["width"] / 2,
            from_rect["y"] + from_rect["height"] / 2,
        )
        self.page.mouse.down()
        self.page.wait_for_timeout(200)
        self.page.mouse.move(
            to_rect["x"] + to_rect["width"] / 2, to_rect["y"] + to_rect["height"] / 2
        )
        self.page.mouse.up()

    def edit_node(self, title):
        self.find_edit_link(title, "(edit)").click()
        self.page.wait_for_selector('text="Change country"')

    def find_edit_link(self, node_title, link_title):
        links = [
            e
            for e in self.find_node_element(node_title).query_selector_all("a.edit")
            if e.text_content() == link_title
        ]
        return links[0]

    def find_input(self, name):
        return self.page.query_selector(f"input[name='{name}']")

    def find_link(self, label):
        return self.page.query_selector(f'css=a >> text="{label}"')

    def find_node_element(self, title) -> ElementHandle:
        node_element = self.find_title_element(title).evaluate_handle(
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
        element = self.page.query_selector(f'css=.jqtree-title >> text="{title}"')
        assert element
        return element

    def find_toggler(self, node_element: ElementHandle) -> ElementHandle:
        toggler = node_element.query_selector(".jqtree-toggler")
        assert toggler
        return toggler

    def grid_view(self):
        self.find_link("Grid view").click()
        self.page.wait_for_selector("#result_list")

    def login(self, username, password):
        page = self.page

        page.goto(self.live_server_url + "/login/")
        page.wait_for_selector("text=Username:")

        page.fill("#id_username", username)
        page.fill("#id_password", password)
        page.click("input[type=submit]")
        page.wait_for_load_state("load")
        page.wait_for_selector("text=Site administration")

    def node_titles(self):
        return [e.text_content() for e in self.page.query_selector_all(".jqtree-title")]

    def open_node(self, title):
        self.toggle_node(title)
        node_element = self.find_node_element(title)

        if "jqtree-loading" in node_element.get_attribute("class"):
            wait_until(
                lambda: "jqtree-loading" not in node_element.get_attribute("class")
            )

    def save_coverage(self):
        coverage = self.page.evaluate_handle(
            """
            function() {
                return window.__coverage__;
            }
            """
        ).json_value()

        filename = uuid4().hex
        write_json(f"js_coverage/{filename}.json", coverage)

    def save_form(self):
        self.page.query_selector("input[value='Save']").click()
        self.page.wait_for_selector("li.success")

    def select_node(self, title):
        self.find_title_element(title).click()

    def selected_node(self):
        return self.page.query_selector(
            ".jqtree-selected > .jqtree-element > .jqtree-title"
        )

    def toggle_node(self, title):
        node_element = self.find_node_element(title)
        toggler = self.find_toggler(node_element)
        toggler.click()

    def tree_view(self):
        self.find_link("Tree view").click()
        self.page.wait_for_selector("css=#tree >> text=Oceania")

    def visit_countries_page(self, expected_text="Select country to change"):
        page = self.page
        page.goto(self.live_server_url + "/django_mptt_example/country/")
        page.wait_for_selector(f"text={expected_text}")
        page.wait_for_selector("css=#tree >> text=Oceania")

    def wait_for_node(self, title):
        self.page.wait_for_selector(f'css=#tree .jqtree-title >> text="{title}"')

    def wait_for_text(self, text):
        self.page.wait_for_selector(f'text="{text}"')
