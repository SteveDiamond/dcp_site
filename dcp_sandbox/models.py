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
    infix = models.CharField(max_length=30) # ',' or binary operator
    suffix = models.CharField(max_length=30) # ')' or 'parameter)'
    signs = models.ManyToManyField(Sign, verbose_name = "possible signs")
    curvatures = models.ManyToManyField(Curvature, verbose_name = "possible curvatures")
    num_args = models.IntegerField() # number of arguments (no varargs)
    terminal = models.BooleanField()
    weight = models.IntegerField() # Relative likelihood of being chosen

# A signature for an operator (i.e. a list of arguments).
class Signature(models.Model):
    operator = models.ForeignKey(Operator)
    operator_signs = models.ManyToManyField(Sign, verbose_name = "possible signs for the operator")
    operator_curvatures = models.ManyToManyField(Curvature, verbose_name = "possible curvatures for the operator")

# An argument in a signature.
class Argument(models.Model):
    signature = models.ForeignKey(Signature)
    sign = models.ForeignKey(Sign, related_name="+")
    curvature = models.ForeignKey(Curvature, related_name="+")
    position = models.IntegerField()