"""
Use to populate the quiz tables with atoms, arguments, etc. 
"""
from dcp_site import settings
from django.core.management import setup_environ
setup_environ(settings)

from dcp_sandbox.models import *

Sign.objects.all().delete()
Curvature.objects.all().delete()
Operator.objects.all().delete()
Signature.objects.all().delete()
Argument.objects.all().delete()

# Curvatures
convex = Curvature.objects.create(name="convex")
concave = Curvature.objects.create(name="concave")
affine = Curvature.objects.create(name="affine")
constant = Curvature.objects.create(name="constant")

# Signs
unknown = Sign.objects.create(name="unknown")
positive = Sign.objects.create(name="positive")
negative = Sign.objects.create(name="negative")

# Variables
for name in ["x","y","z"]:
    var = Operator.objects.create(prefix=name, infix="", suffix="", weight=1, num_args=0, terminal=True)
    var.signs.add(unknown)
    var.curvatures.add(affine, convex, concave)
    var.save()

# Positive constants
for name in ["1","42","364"]:
    var = Operator.objects.create(prefix=name, infix="", suffix="", weight=1, num_args=0, terminal=True)
    var.signs.add(positive)
    var.curvatures.add(constant, affine, convex, concave)
    var.save()

# Negative constants
for name in ["-2","-35","-7"]:
    var = Operator.objects.create(prefix=name, infix="", suffix="", weight=1, num_args=0, terminal=True)
    var.signs.add(positive)
    var.curvatures.add(constant, affine, convex, concave)
    var.save()

# + and arguments.
plus = Operator.objects.create(prefix="", infix="+", suffix="", weight=1, num_args=2, terminal=False)
plus.signs.add(positive, negative, unknown)
plus.curvatures.add(constant, affine, convex, concave)

# affine + affine
sig = Signature.objects.create(operator=plus)

plus.save()