from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse

from dcp_parser.parser import Parser
from dcp_parser.json.statement_encoder import StatementEncoder
import unicodedata

import json 
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

# Solves the LP minimize c*x subject to A*x <= b, C*x == d.
# All vectors passed in as arrays.
def solveLP(request):
    if request.is_ajax():
        if request.method == 'POST':
            rec = json.loads(request.body)
            c = matrix(rec['c'], tc='d')
            A = matrix(rec['A'], tc='d')
            b = matrix(rec['b'], tc='d')
            C = matrix(rec['C'], tc='d')
            d = matrix(rec['d'], tc='d')
            # Convert from row-major to column major order if necessary
            rowMajor = rec['rowMajor']
            if rowMajor:
                A = A.T
                C = C.T
            result = solvers.lp(c, A, b, C, d)
            x = [i for i in result['x']]
            return HttpResponse(json.dumps(x))
    return HttpResponse("OK")