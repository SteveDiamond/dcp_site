from django.db import models

# The default operator weight.
DEFAULT_WEIGHT = 1000

# An arithmetic operator, atom, or parameterized atom.
class Operator(models.Model):
    prefix = models.CharField(max_length=30) # 'atom('
    infix = models.CharField(max_length=30) # ', ' or binary operator
    suffix = models.CharField(max_length=30) # ')' or 'parameter)'
    positive = models.BooleanField()
    negative = models.BooleanField()
    convex = models.BooleanField()
    concave = models.BooleanField()
    terminal = models.BooleanField()
    num_args = models.IntegerField()
    weight = models.FloatField(default=DEFAULT_WEIGHT) # Relative likelihood of being chosen

# An argument for an operator.
class Argument(models.Model):
    operator = models.ForeignKey(Operator)
    positive = models.BooleanField()
    negative = models.BooleanField()
    convex = models.BooleanField()
    concave = models.BooleanField()
    position = models.IntegerField(default=0)