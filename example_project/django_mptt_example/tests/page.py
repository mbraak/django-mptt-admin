def parent_element(element):
    return element.get_property('parentElement')


class Page:
    def __init__(self, live_server_url, selenium):
        self.live_server_url = live_server_url
        self.selenium = selenium

    def login(self, username, password):
        selenium = self.selenium

        selenium.get('%s%s' % (self.live_server_url, '/login/'))

        selenium.find_element_by_name('username').send_keys(username)
        selenium.find_element_by_name('password').send_keys(password)
        selenium.find_element_by_css_selector("input[value='Log in']").click()

        self.assert_page_contains_text('Site administration')

    def visit_countries_page(self):
        selenium = self.selenium

        selenium.get(self.live_server_url)
        selenium.find_element_by_link_text('Countries').click()
        self.assert_page_contains_text('Select country to change')

    def assert_page_contains_text(self, text):
        self.selenium.find_element_by_xpath("//*[contains(text(), '%s')]" % text)

    def node_titles(self):
        return [e.text for e in self.selenium.find_elements_by_class_name('jqtree-title')]

    def find_title_element(self, title):
        return self.selenium.find_element_by_xpath(f"//span[text()='{title}']")

    def find_node_element(self, title):
        return parent_element(parent_element(self.find_title_element(title)))

    def select_node(self, title):
        self.find_title_element(title).click()

        self.selenium.find_element_by_class_name('jqtree-selected')

    def selected_node(self):
        return self.selenium.find_element_by_css_selector('.jqtree-selected > .jqtree-element > .jqtree-title')

    def toggle_node(self, title):
        node_element = self.find_node_element(title)

        node_element.find_element_by_class_name('jqtree-toggler').click()



