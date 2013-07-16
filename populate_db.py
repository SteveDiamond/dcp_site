"""
Use to populate the quiz tables with atoms, arguments, etc. 
"""
from dcp_site import settings
from django.core.management import setup_environ
setup_environ(settings)

from dcp_sandbox.models import *

Operator.objects.all().delete()
Argument.objects.all().delete()

# Unknown sign variables.
for name in ["x","y","z"]:
    Operator.objects.create(prefix=name, infix="", suffix="", 
                            terminal=True, num_args=0,
                            weight=DEFAULT_WEIGHT,
                            positive=False, negative=False,
                            convex=True, concave=True)

# # Positive and negative variables.
# for name in ["u","v","w"]:
#     Operator.objects.create(prefix=name, infix="", suffix="", 
#                             terminal=True, num_args=0,
#                             weight=DEFAULT_WEIGHT,
#                             positive=True, negative=False,
#                             convex=True, concave=True)
#     Operator.objects.create(prefix=("-"+name), infix="", suffix="", 
#                             terminal=True, num_args=0,
#                             weight=DEFAULT_WEIGHT,
#                             positive=False, negative=True,
#                             convex=True, concave=True)

# Positive constants
for name in ["1","42","364"]:
    Operator.objects.create(prefix=name, infix="", suffix="", 
                            terminal=True, num_args=0,
                            weight=0.5*DEFAULT_WEIGHT/3,
                            positive=True, negative=False,
                            convex=True, concave=True)


# Negative constants
for name in ["-2","-35","-7"]:
    Operator.objects.create(prefix=name, infix="", suffix="", 
                            terminal=True, num_args=0,
                            weight=0.5*DEFAULT_WEIGHT/3,
                            positive=False, negative=True,
                            convex=True, concave=True)

# binary + and arguments.
for positive in [True, False]:
    for negative in [True, False]:
        for convex in [True, False]:
            for concave in [True, False]:
                if (not convex and not concave) or (positive and negative):
                    continue
                elif convex and concave:
                    weight = 0.05*DEFAULT_WEIGHT/3
                elif positive or negative:
                    weight = 0.15*DEFAULT_WEIGHT/4
                else:
                    weight = 0.8*DEFAULT_WEIGHT
                op = Operator.objects.create(prefix="", infix=" + ", suffix="",
                                             terminal=False, num_args=2,
                                             weight=weight,
                                             positive=positive, negative=negative,
                                             convex=convex, concave=concave)

                for i in range(2):
                    Argument.objects.create(operator=op, position=i,
                                            positive=positive, negative=negative,
                                            convex=convex, concave=concave)


# binary - and arguments.
for positive in [True, False]:
    for negative in [True, False]:
        for convex in [True, False]:
            for concave in [True, False]:
                if (not convex and not concave) or (positive and negative):
                    continue
                elif convex and concave:
                    weight = 0.05*DEFAULT_WEIGHT/3
                elif positive or negative:
                    weight = 0.15*DEFAULT_WEIGHT/4
                else:
                    weight = 0.8*DEFAULT_WEIGHT
                op = Operator.objects.create(prefix="", infix=" - ", suffix="",
                                             terminal=False, num_args=2,
                                             weight=weight,
                                             positive=positive, negative=negative,
                                             convex=convex, concave=concave)

                Argument.objects.create(operator=op, position=0,
                                        positive=positive, negative=negative,
                                        convex=convex, concave=concave)

                Argument.objects.create(operator=op, position=1,
                                        positive=negative, negative=positive,
                                        convex=concave, concave=convex)


# # max and arguments
# for positive in [True, False]:
#     for negative in [True, False]:
#         if positive and negative: 
#             continue
#         elif not positive and not negative:
#             weight = 0.5*DEFAULT_WEIGHT
#         else:
#             weight = 0.5*DEFAULT_WEIGHT/2
#         op = Operator.objects.create(prefix="max(", infix=", ", suffix=")",
#                                      terminal=False, num_args=2,
#                                      weight=weight,
#                                      positive=positive, negative=negative,
#                                      convex=True, concave=False)
#         Argument.objects.create(operator=op, position=0,
#                                 positive=positive, negative=negative,
#                                 convex=True, concave=False)
#         if negative:
#             Argument.objects.create(operator=op, position=1,
#                                     positive=False, negative=True,
#                                     convex=True, concave=False)
#         else:
#             Argument.objects.create(operator=op, position=1,
#                                     positive=False, negative=False,
#                                     convex=True, concave=False)

# min and arguments
for positive in [True, False]:
    for negative in [True, False]:
        if positive and negative: 
            continue
        elif not positive and not negative:
            weight = 0.5*DEFAULT_WEIGHT
        else:
            weight = 0.5*DEFAULT_WEIGHT/2
        op = Operator.objects.create(prefix="min(", infix=", ", suffix=")",
                                     terminal=False, num_args=2,
                                     weight=weight,
                                     positive=positive, negative=negative,
                                     convex=False, concave=True)
        Argument.objects.create(operator=op, position=0,
                                positive=positive, negative=negative,
                                convex=False, concave=True)
        if positive:
            Argument.objects.create(operator=op, position=1,
                                    positive=True, negative=False,
                                    convex=False, concave=True)
        else:
            Argument.objects.create(operator=op, position=1,
                                    positive=False, negative=False,
                                    convex=False, concave=True)

# log and arguments
op = Operator.objects.create(prefix="log(", infix=", ", suffix=")",
                             terminal=False, num_args=1,
                             weight=DEFAULT_WEIGHT,
                             positive=False, negative=False,
                             convex=False, concave=True)
Argument.objects.create(operator=op, position=0,
                        positive=False, negative=False,
                        convex=False, concave=True)

# abs and arguments
op = Operator.objects.create(prefix="abs(", infix=", ", suffix=")",
                             terminal=False, num_args=1,
                             weight=DEFAULT_WEIGHT,
                             positive=True, negative=False,
                             convex=True, concave=False)
Argument.objects.create(operator=op, position=0,
                        positive=True, negative=False,
                        convex=True, concave=False)
Argument.objects.create(operator=op, position=0,
                        positive=False, negative=True,
                        convex=False, concave=True)
Argument.objects.create(operator=op, position=0,
                        positive=False, negative=False,
                        convex=True, concave=True)

# berhu and arguments
op = Operator.objects.create(prefix="berhu(", infix=", ", suffix=", 2)",
                             terminal=False, num_args=1,
                             weight=DEFAULT_WEIGHT,
                             positive=True, negative=False,
                             convex=True, concave=False)
Argument.objects.create(operator=op, position=0,
                        positive=True, negative=False,
                        convex=True, concave=False)
Argument.objects.create(operator=op, position=0,
                        positive=False, negative=True,
                        convex=False, concave=True)
Argument.objects.create(operator=op, position=0,
                        positive=False, negative=False,
                        convex=True, concave=True)

# entr and arguments
op = Operator.objects.create(prefix="entr(", infix=", ", suffix=")",
                             terminal=False, num_args=1,
                             weight=DEFAULT_WEIGHT,
                             positive=False, negative=False,
                             convex=False, concave=True)
Argument.objects.create(operator=op, position=0,
                        positive=False, negative=False,
                        convex=True, concave=True)

# exp and arguments
op = Operator.objects.create(prefix="exp(", infix=", ", suffix=")",
                             terminal=False, num_args=1,
                             weight=DEFAULT_WEIGHT,
                             positive=True, negative=False,
                             convex=True, concave=False)
Argument.objects.create(operator=op, position=0,
                        positive=False, negative=False,
                        convex=True, concave=False)

# geo_mean and arguments
op = Operator.objects.create(prefix="geo_mean(", infix=", ", suffix=")",
                             terminal=False, num_args=2,
                             weight=DEFAULT_WEIGHT,
                             positive=True, negative=False,
                             convex=False, concave=True)
for i in range(op.num_args):
    Argument.objects.create(operator=op, position=i,
                            positive=True, negative=False,
                            convex=False, concave=True)

# huber and arguments
op = Operator.objects.create(prefix="huber(", infix=", ", suffix=", 1)",
                             terminal=False, num_args=1,
                             weight=DEFAULT_WEIGHT,
                             positive=True, negative=False,
                             convex=True, concave=False)
Argument.objects.create(operator=op, position=0,
                        positive=True, negative=False,
                        convex=True, concave=False)
Argument.objects.create(operator=op, position=0,
                        positive=False, negative=True,
                        convex=False, concave=True)
Argument.objects.create(operator=op, position=0,
                        positive=False, negative=False,
                        convex=True, concave=True)

# inv_pos and arguments
op = Operator.objects.create(prefix="inv_pos(", infix=", ", suffix=")",
                             terminal=False, num_args=1,
                             weight=DEFAULT_WEIGHT,
                             positive=True, negative=False,
                             convex=True, concave=False)
Argument.objects.create(operator=op, position=0,
                        positive=False, negative=False,
                        convex=False, concave=True)

# kl_div and arguments
op = Operator.objects.create(prefix="kl_div(", infix=", ", suffix=")",
                             terminal=False, num_args=2,
                             weight=DEFAULT_WEIGHT,
                             positive=False, negative=False,
                             convex=True, concave=False)
for i in range(op.num_args):
    Argument.objects.create(operator=op, position=i,
                            positive=False, negative=False,
                            convex=True, concave=True)

# log_sum_exp and arguments
op = Operator.objects.create(prefix="log_sum_exp(", infix=", ", suffix=")",
                             terminal=False, num_args=2,
                             weight=DEFAULT_WEIGHT,
                             positive=False, negative=False,
                             convex=True, concave=False)
for i in range(op.num_args):
    Argument.objects.create(operator=op, position=i,
                            positive=False, negative=False,
                            convex=True, concave=False)

# norm and arguments
op = Operator.objects.create(prefix="norm(", infix=", ", suffix=", 2)",
                             terminal=False, num_args=2,
                             weight=DEFAULT_WEIGHT,
                             positive=True, negative=False,
                             convex=True, concave=False)
for i in range(op.num_args):
    Argument.objects.create(operator=op, position=i,
                            positive=True, negative=False,
                            convex=True, concave=False)
    Argument.objects.create(operator=op, position=i,
                            positive=False, negative=True,
                            convex=False, concave=True)
    Argument.objects.create(operator=op, position=i,
                            positive=False, negative=False,
                            convex=True, concave=True)

# sqrt and arguments
op = Operator.objects.create(prefix="sqrt(", infix=", ", suffix=")",
                             terminal=False, num_args=1,
                             weight=DEFAULT_WEIGHT,
                             positive=True, negative=False,
                             convex=False, concave=True)
Argument.objects.create(operator=op, position=0,
                        positive=True, negative=False,
                        convex=False, concave=True)