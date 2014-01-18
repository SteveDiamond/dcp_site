"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".

Replace this with more appropriate tests for your application.
"""

from django.db import models
from django.db.models import Q
from django.test import TestCase
import models as m


class TestQuiz(TestCase):
    def test_expression_types(self):
        """
        TODO make this actually work.
        Tests that every possible type of expression can be generated.
        """
        expr_type = {"positive": False,
                     "negative": False,
                     "convex": False,
                     "concave": False,
                     "terminal": False,
                    }
        expressions = m.Operator.objects.filter(
                            Q(positive=expr_type["positive"]) | Q(positive=True),
                            Q(negative=expr_type["negative"]) | Q(negative=True),
                            Q(convex=expr_type["convex"]) | Q(convex=True),
                            Q(concave=expr_type["concave"]) | Q(concave=True),
                            Q(terminal=expr_type["terminal"]) | Q(terminal=True),
                       ).all()
        print expressions
        assert len(expressions) > 0
