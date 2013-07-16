from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse, HttpResponseServerError
from django.core.urlresolvers import reverse
from django.core.mail import send_mail

from dcp_parser.parser import Parser
from dcp_parser.json.statement_encoder import StatementEncoder

from django.db.models import Q
from dcp_sandbox.models import *

import constants
import unicodedata
import json
import logging
import random

log = logging.getLogger(__name__)

# Load the analyzer.
def index(request):
    sorted_atoms = sorted(constants.ATOM_DEFINITIONS, key=lambda atom: atom["name"])
    return render(request, 'dcp_sandbox/index.html', 
                 {'functions': sorted_atoms})

# Parse an expression or constraint.
def parse(request):
    parser = Parser()
    for line in constants.PREAMBLE:
        parser.parse(line)
    unicode_text = request.POST['text']
    # Convert to standard Python string (ASCII)
    text = unicodedata.normalize('NFKD', unicode_text).encode('ascii','ignore')
    # Reject empty text
    if len(text) == 0:
        return HttpResponseServerError("The empty string is not a valid expression.")

    for line in str.split(text, '\r\n'):
        try:
            parser.parse(line)
        except Exception, e:
            log.debug('Parser error')
            log.error(e)
            return HttpResponseServerError(str(e))

    json_str = ""
    if len(parser.statements) > 0:
        expression = parser.statements[len(parser.statements)-1] # Return last statement
        json_str = StatementEncoder().encode(expression)
    return HttpResponse(json_str)

# Email the admins.
def send_feedback(request):
    unicode_text = request.POST['text']
    # Convert to standard Python string (ASCII)
    text = unicodedata.normalize('NFKD', unicode_text).encode('ascii','ignore')
    send_mail('DCP Analyzer Feedback', text, 'dcp.stanford.edu@gmail.com',
        ['diamond.po.central@gmail.com'], fail_silently=False)
    return HttpResponse("OK")

# TODO should be visible?
def test(request):
    return render(request, 'dcp_sandbox/test.html')


# Load quiz mode.
def quiz(request):
    sorted_atoms = sorted(constants.ATOM_DEFINITIONS, key=lambda atom: atom["name"])
    return render(request, 'dcp_sandbox/quiz.html', 
                 {'functions': sorted_atoms})

# Helper for quiz. Gets new random expression.
def new_expr(request):
    true_str = request.POST['true_str']
    name,expr = get_random_expression(request.POST['positive'] == true_str, 
                                 request.POST['negative'] == true_str,
                                 request.POST['convex'] == true_str,
                                 request.POST['concave'] == true_str,
                                 float(request.POST['prob_terminate']))
    print name 
    return HttpResponse(name)

# Generate a random expression.
# positive - must be positive?
# negative - must be negative?
# convex - must be convex?
# concave - must be concave?
# prob_terminate - probability of returning a terminal expression.
def get_random_expression(positive, negative, convex, concave, prob_terminate):
    terminal = random.random() < prob_terminate
    expr = weighted_choice( Operator.objects.filter(
                                Q(positive=positive) | Q(positive=True),
                                Q(negative=negative) | Q(negative=True),
                                Q(convex=convex) | Q(convex=True),
                                Q(concave=concave) | Q(concave=True),
                                terminal=terminal
                            ).all()
                          )
    names = []
    for i in range(expr.num_args):
        arg = random.choice( expr.argument_set.filter(position=i).all() )
        name,sub_expr = get_random_expression(arg.positive, arg.negative, 
                                              arg.convex, arg.concave, 
                                              2*prob_terminate)
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