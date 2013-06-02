from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse

from dcp_parser.parser import Parser
from dcp_parser.json.statement_encoder import StatementEncoder
import unicodedata

from cvxopt import matrix, solvers


# Pre-declared variables and parameters
preamble = ['variable x y z', 'variable positive u v w',
            'parameter a b c', 'parameter positive d e f']

def index(request):
    return render(request, 'dcp_sandbox/index.html')

def parse(request):
    parser = Parser()
    for line in preamble:
        parser.parse(line)
    unicode_text = request.POST['text']
    # Convert to standard Python string (ASCII)
    text = unicodedata.normalize('NFKD', unicode_text).encode('ascii','ignore')

    for line in str.split(text, '\r\n'):
        parser.parse(line)

    json_str = ""
    if len(parser.statements) > 0:
        expression = parser.statements[len(parser.statements)-1] # Return last statement
        json_str = StatementEncoder().encode(expression)
    return HttpResponse(json_str)

def solveLP(request):
    if request.is_ajax():
        if request.method == 'POST':
            print 'Raw Data: "%s"' % request.raw_post_data  
    return HttpResponse("OK")