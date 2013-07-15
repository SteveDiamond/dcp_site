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
Argument.objects.all().delete()

# Curvatures
convex = Curvature.objects.create(name="convex")
concave = Curvature.objects.create(name="concave")

# Signs
unknown = Sign.objects.create(name="unknown")
positive = Sign.objects.create(name="positive")
negative = Sign.objects.create(name="negative")

for curvature in [convex, concave]:
    # Variables
    for name in ["x","y","z"]:
        var = Operator.objects.create(prefix=name, infix="", suffix="", terminal=True,
                                      sign=unknown, curvature=curvature)
        var.save()

    # Positive constants
    for name in ["1","42","364"]:
        var = Operator.objects.create(prefix=name, infix="", suffix="", terminal=True,
                                      sign=positive, curvature=curvature)
        var.save()

    # Negative constants
    for name in ["-2","-35","-7"]:
        var = Operator.objects.create(prefix=name, infix="", suffix="", terminal=True,
                                      sign=negative, curvature=curvature)
        var.save()

# + and arguments.
for sign in [positive, negative, unknown]:
    for curvature in [convex, concave]:
        plus = Operator.objects.create(prefix="", infix=" + ", suffix="",
                                       terminal=False, curvature=curvature, sign=sign)
        if sign == unknown:
            arg = Argument.objects.create(operator=plus)
            arg.signs.add(unknown, positive)
            arg.curvatures.add(curvature)
            arg.save()

            arg = Argument.objects.create(operator=plus)
            arg.signs.add(unknown, negative)
            arg.curvatures.add(curvature)
            arg.save()
        else:
            for i in range(2):
                arg = Argument.objects.create(operator=plus)
                arg.signs.add(sign)
                arg.curvatures.add(curvature)
                arg.save()
        plus.save()

# - and arguments.
NEG_MAP = {"convex": concave, "concave": convex,
           "positive": negative, "negative": positive}
for sign in [positive, negative, unknown]:
    for curvature in [convex, concave]:
        minus = Operator.objects.create(prefix="", infix=" - ", suffix="",
                                       terminal=False, curvature=curvature, sign=sign)
        if sign == positive or sign == negative:
            arg = Argument.objects.create(operator=minus, position=0)
            arg.signs.add(sign)
            arg.curvatures.add(curvature)
            arg.save()

            arg = Argument.objects.create(operator=minus, position=1)
            arg.signs.add(NEG_MAP[sign.name])
            arg.curvatures.add(NEG_MAP[curvature.name])
            arg.save()
        else:
            arg = Argument.objects.create(operator=minus, position=0)
            arg.signs.add(unknown, positive)
            arg.curvatures.add(curvature)
            arg.save()

            arg = Argument.objects.create(operator=minus, position=1)
            arg.signs.add(unknown, positive)
            arg.curvatures.add(NEG_MAP[curvature.name])
            arg.save()
        minus.save()

# max and arguments
for sign in [positive, negative, unknown]:
    max = Operator.objects.create(prefix="max(", infix=", ", suffix=")",
                                  terminal=False, curvature=convex, sign=sign)
    if sign == positive:
        arg = Argument.objects.create(operator=max)
        arg.signs.add(positive)
        arg.curvatures.add(convex)
        arg.save()

        arg = Argument.objects.create(operator=max)
        arg.signs.add(unknown, negative, positive)
        arg.curvatures.add(convex)
        arg.save()
    elif sign == negative:
        for i in range(2):
            arg = Argument.objects.create(operator=max)
            arg.signs.add(negative)
            arg.curvatures.add(convex)
            arg.save()
    else:
        arg = Argument.objects.create(operator=max)
        arg.signs.add(unknown)
        arg.curvatures.add(convex)
        arg.save()

        arg = Argument.objects.create(operator=max)
        arg.signs.add(unknown, negative)
        arg.curvatures.add(convex)
        arg.save()
    max.save()