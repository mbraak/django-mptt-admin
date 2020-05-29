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
        self.selenium.find_element_by_xpath(f"//*[contains(text(), '{text}')]")

    def node_titles(self):
        return [e.text for e in self.selenium.find_elements_by_class_name('jqtree-title')]

    def open_nodes(self):
        nodes = self.selenium.find_elements_by_xpath(
            f"""//li
                    [contains(@class, 'jqtree-folder') and
                      not(contains(@class, 'jqtree-closed'))
                    ]
                /div
                    [contains(@class, 'jqtree-element')]
                /span
                    [contains(@class, 'jqtree-title')]
            """
        )

        return [e.text for e in nodes]

    def find_title_element(self, title):
        return self.selenium.find_element_by_xpath(
            f"""//span
                    [contains(@class, 'jqtree-title') and text()='{title}']
            """
        )

    def find_node_element(self, title):
        return parent_element(parent_element(self.find_title_element(title)))

    def select_node(self, title):
        self.find_title_element(title).click()

        self.selenium.find_element_by_xpath(
            f"""//li
                    [contains(@class, 'jqtree-selected')]
                //span
                    [text()='{title}']
            """
        )

    def selected_node(self):
        return self.selenium.find_element_by_css_selector('.jqtree-selected > .jqtree-element > .jqtree-title')

    def open_node(self, title):
        element = self.selenium.find_element_by_xpath(
            f"""//li
                    [contains(@class, 'jqtree-closed')]
                /div
                    [contains(@class, 'jqtree-element')]
                /span
                    [text()='{title}']
            """
        )
        parent_element(element).find_element_by_css_selector('.jqtree-toggler').click()

        self.selenium.find_element_by_xpath(
            f"//span[contains(@class, 'jqtree-title') and @aria-expanded='true' and text()='{title}']"
        )

    def edit_node(self, title):
        self.find_edit_link(title, '(edit)').click()
        self.assert_page_contains_text('Change country')

    def find_edit_link(self, node_title, link_title):
        links = [
            e for e in self.find_node_element(node_title).find_elements_by_css_selector("a.edit")
            if e.text == link_title
        ]
        return links[0]

    def add_node(self, parent_title):
        self.find_edit_link(parent_title, '(add)').click()
        self.assert_page_contains_text('Add country')

    def grid_view(self):
        self.selenium.find_element_by_link_text('GRID VIEW').click()
        self.selenium.find_element_by_id('result_list')

    def tree_view(self):
        self.selenium.find_element_by_link_text('TREE VIEW').click()
        self.selenium.find_element_by_id('tree')

    def find_input(self, name):
        return self.selenium.find_element_by_css_selector(f"input[name='{name}']")

    def save_form(self):
        self.selenium.find_element_by_css_selector("input[value='Save']").click()

        self.selenium.find_element_by_css_selector('li.success')
