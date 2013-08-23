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

log = logging.getLogger(__name__)

# Renders the target page, passing on function info.
def base_page(target, request):
    sorted_atoms = sorted(constants.ATOM_DEFINITIONS, key=lambda atom: atom["name"])
    return render(request, target, 
                 {'functions': sorted_atoms})

# Intro page.
def intro(request):
    return base_page('dcp_sandbox/intro.html', request)

# Load the analyzer.
def analyzer(request):
    return base_page('dcp_sandbox/analyzer.html', request)

# Load quiz mode.
def quiz(request):
    return base_page('dcp_sandbox/quiz.html', request)

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
            log.debug('Parsed %s' % line)
        except Exception, e:
            log.debug('Parser error on %s' % line)
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
    log.debug("Sent feedback %s" % text)
    send_mail('DCP Analyzer Feedback', text, 'dcp.stanford.edu@gmail.com',
        ['diamond.po.central@gmail.com'], fail_silently=False)
    return HttpResponse("OK")

# TODO should be visible?
def test(request):
    return render(request, 'dcp_sandbox/test.html')

# Helper for quiz. Gets new random expression.
def new_expr(request):
    true_str = request.POST['true_str']
    expr_type = {"positive": request.POST['positive'] == true_str,
                 "negative": request.POST['negative'] == true_str,
                 "convex": request.POST['convex'] == true_str,
                 "concave": request.POST['concave'] == true_str,
                }
    name = get_random_expression([expr_type],
                                 float(request.POST['prob_terminate']),
                                 float(request.POST['prob_increase']),
                                 request.POST['dcp'] == true_str)
    log.debug("Generated %s" % name)
    return HttpResponse(name)