from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse, HttpResponseServerError
from django.core.urlresolvers import reverse
from django.core.mail import send_mail

from dcp_parser.parser import Parser
from dcp_parser.json.statement_encoder import StatementEncoder
from dcp_sandbox.models import *

import constants
import unicodedata
import json
import logging
from random import random, choice

log = logging.getLogger(__name__)

def index(request):
    sorted_atoms = sorted(constants.ATOM_DEFINITIONS, key=lambda atom: atom["name"])
    return render(request, 'dcp_sandbox/index.html', 
                 {'functions': sorted_atoms})

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
    expr = get_rand_expr(Sign.objects.all(), 
                         Curvature.objects.all(), 0.1)
    return render(request, 'dcp_sandbox/test.html', {'random_expression':expr})

# Generate a random expression.
# signs - valid signs for the expression.
# curvatures - valid curvature for the expression.
# prob_terminate - probability of returning a terminal expression.
def get_rand_expr(signs, curvatures, prob_terminate):
    print random()
    terminal = random() < prob_terminate
    expr = choice( Operator.objects.filter(sign__in=signs, 
                                      curvature__in=curvatures, 
                                      terminal=terminal).all() )
    # TODO randomly choose one based on weights
    names = []
    for arg in sorted(expr.argument_set.all(), 
                      key=lambda arg: arg.position + 0.5*random()):
        names.append( get_rand_expr(arg.signs.all(), 
                                    arg.curvatures.all(), 
                                    prob_terminate+0.2)
                     )
    return expr.prefix + expr.infix.join(names) + expr.suffix
