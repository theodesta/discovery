from django.test import tag

from test import cases as case
from test import fixtures as data


@tag('keyword')
class MetadataTest(case.APITestCase, metaclass = case.MetaAPISchema):
    
    fixtures = data.get_category_fixtures()
    schema = {
        'search': {
            'tags': ('keyword_search',),
            '*search1': ('name', 'istartswith', 'Edu'),
            '*search2': ('name', 'istartswith', 'Financial'),
            '-search3': ('name', 'istartswith', '0000000000000')
        }
    }
    
    def initialize(self):
        self.router = 'keywords'
