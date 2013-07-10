from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse, HttpResponseServerError
from django.core.urlresolvers import reverse
from django.core.mail import send_mail

from dcp_parser.parser import Parser
from dcp_parser.json.statement_encoder import StatementEncoder

import constants
import unicodedata
import json
import logging
import random

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
    return render(request, 'dcp_sandbox/test.html')

# Generate a random expression.
# signs - valid signs for the expression.
# curvatures - valid curvature for the expression.
# prob_terminate - probability of returning a terminal expression.
def get_random_expression(signs, curvatures, prob_terminate):
    terminal = random.random() < prob_terminate
    # get set of expressions tbat match curvature, sign, terminal
    # randomly choose one based on weights
    # args = []
    # for i in range(num_args):
    #   select new argument that matches operator_signs, operator_curvatures
    #   args.append( get_random_expression(arg.sign, arg.curvature, prob_terminate) )
    # name = expr.prefix
    # for i in range(expr.num_args):
    #     if i != 0: name += expr.infix
    #     name += arg[i]
    # name += expr.suffix
    # return name

    return "test"
