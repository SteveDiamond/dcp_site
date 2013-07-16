from django.db import models
from django.db.models import Q
import random

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

# Generate a random expression.
# possibilities - an array of dicts with possible expression types.
# prob_terminate - probability of returning a terminal expression.
def get_random_expression(possibilities, prob_terminate):
    terminal = random.random() < prob_terminate
    expressions = []
    for expr_type in possibilities:
        expressions += Operator.objects.filter(
                            Q(positive=expr_type["positive"]) | Q(positive=True),
                            Q(negative=expr_type["negative"]) | Q(negative=True),
                            Q(convex=expr_type["convex"]) | Q(convex=True),
                            Q(concave=expr_type["concave"]) | Q(concave=True),
                            Q(terminal=terminal) | Q(terminal=True),
                       ).all()
    expr = weighted_choice(expressions)
    names = []
    for i in range(expr.num_args):
        possible_args = expr.argument_set.filter(position=i).all()
        possible_types = []
        for arg in possible_args:
            possible_types.append({"positive": arg.positive,
                                   "negative": arg.negative,
                                   "convex": arg.convex,
                                   "concave": arg.concave,
                                   })
        name,sub_expr = get_random_expression(possible_types, 2*prob_terminate)
        names.append(add_parens(name, expr, sub_expr, i))
    return (expr.prefix + expr.infix.join(names) + expr.suffix, expr)

# Randomly select an operator from the list,
# taking operator weight into account.
def weighted_choice(operators):
    choice = sum(op.weight for op in operators) * random.random()
    total = 0
    for op in operators:
        total += op.weight
        if total > choice:
            return op
    assert False

# Add surrounding parentheses if needed for order of operations.
def add_parens(name, expression, sub_expression, position):
    if expression.infix == " - " and \
    sub_expression.infix in [" - ", " + "] and position == 1:
        return "(" + name + ")"
    else:
        return name