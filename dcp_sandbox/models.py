from django.db import models
# The possible signs, i.e. positive, negative, or unknown.
class Sign(models.Model):
    name = models.CharField(max_length=30)

# The possible curvatures, i.e. convex, concave, affine, or constant.
class Curvature(models.Model):
    name = models.CharField(max_length=30)

# An arithmetic operator, atom, or parameterized atom.
class Operator(models.Model):
    prefix = models.CharField(max_length=30) # 'atom('
    infix = models.CharField(max_length=30) # ', ' or binary operator
    suffix = models.CharField(max_length=30) # ')' or 'parameter)'
    sign = models.ForeignKey(Sign, verbose_name = "the operator's sign")
    curvature = models.ForeignKey(Curvature, verbose_name = "the operator's curvature")
    terminal = models.BooleanField()
    weight = models.IntegerField(default=1) # Relative likelihood of being chosen

# An argument for an operator.
class Argument(models.Model):
    operator = models.ForeignKey(Operator)
    signs = models.ManyToManyField(Sign, verbose_name = "possible signs")
    curvatures = models.ManyToManyField(Curvature, verbose_name = "possible curvatures")
    position = models.IntegerField(default=0)