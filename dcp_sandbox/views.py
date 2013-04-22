from django.shortcuts import render

def index(request):
    return render(request, 'dcp_sandbox/index.html')