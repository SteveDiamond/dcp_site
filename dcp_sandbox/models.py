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

# Generates a random expression.
# possibilities - an array of dicts signifying possible expression types.
# prob_terminate - probability of returning a terminal expression.
# prob_increase - the factor by which the probability of terminating increases every
#                 level.
# dcp - is the expression dcp?
def get_random_expression(possibilities, prob_terminate, prob_increase, dcp=False):
    root = get_random_expression_tree(possibilities, 
                                      prob_terminate, 
                                      prob_increase)
    if not dcp:
        add_dcp_error(root)
    return tree_to_string(*root)

# Generates a random parse tree representing an expression.
# possibilities - an array of dicts signifying possible expression types.
# prob_terminate - probability of returning a terminal expression.
# prob_increase - the factor by which the probability of terminating increases every
#                 level.
def get_random_expression_tree(possibilities, prob_terminate, prob_increase):
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
    children = []
    for i in range(expr.num_args):
        possible_args = expr.argument_set.filter(position=i).all()
        possible_types = []
        for arg in possible_args:
            possible_types.append({"positive": arg.positive,
                                   "negative": arg.negative,
                                   "convex": arg.convex,
                                   "concave": arg.concave,
                                   })
        children.append(get_random_expression_tree(possible_types, 
                                                   prob_increase*prob_terminate,
                                                   prob_increase)
                       )
    return [expr, children]

# Randomly select an operator from the list,
# taking operator weight into account.
# operators - a list of operators.
def weighted_choice(operators):
    choice = sum(op.weight for op in operators) * random.random()
    total = 0
    for op in operators:
        total += op.weight
        if total > choice:
            return op
    assert False

# Converts a parse tree into a string.
# expression - the current node.
# children - the arguments of the expression.
def tree_to_string(expression, children):
    names = []
    for i in range(len(children)):
        name = tree_to_string(*children[i])
        names.append( add_parens(name, expression, children[i][0], i) )
    return expression.prefix + expression.infix.join(names) + expression.suffix

# Add surrounding parentheses if needed for order of operations.
# name - the name without parentheses.
# expression - the parent expression.
# arg - the argument of the expression.
# arg_position - the position of the argument.
def add_parens(name, expression, arg, arg_position):
    if expression.infix == " - " and \
    arg.infix in [" - ", " + "] and arg_position == 1:
        return "(" + name + ")"
    else:
        return name

# Add a DCP error by randomly replacing a non-root, non-terminal node.
# root - a list with the top level operator and its arguments.
def add_dcp_error(root):
    total = count_non_terminals(*root)
    if total > 1:
        choice = random.randint(2, total)
        replace_non_terminal(root, choice, 0)

# Count the number of non-terminals in the sub-tree rooted at the given node.
# node - the root node.
# children - the children of the root.
def count_non_terminals(node, children):
    if len(children) == 0:
        return 0
    return 1 + sum(count_non_terminals(*child) for child in children)

# Traverse the tree in a pre-order traversal and 
# replace the non-terminal where choice == count with a random
# Operator with the same number of arguments but different curvature.
# root - a list with the top level operator and its arguments.
# choice - the number of the node to replace.
# count - the number of non-terminal nodes visited.
def replace_non_terminal(root, choice, count):
    if len(root[1]) == 0:
        return count
    count += 1
    if count == choice:
        options = Operator.objects.filter(num_args=root[0].num_args,
                                          convex=root[0].concave,
                                          concave=root[0].convex
                                          ).all()
        root[0] = weighted_choice(options)
    for child in root[1]:
        count = replace_non_terminal(child, choice, count)
    return count