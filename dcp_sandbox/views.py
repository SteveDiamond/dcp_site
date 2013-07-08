from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse, HttpResponseServerError
from django.core.urlresolvers import reverse

from dcp_parser.parser import Parser
from dcp_parser.json.statement_encoder import StatementEncoder
import unicodedata

import json

import logging
log = logging.getLogger(__name__)

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

# TODO should be visible?
def test(request):
    return render(request, 'dcp_sandbox/test.html')