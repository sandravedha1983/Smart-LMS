import datetime
from django.shortcuts import render
from django.http import JsonResponse
from django.db import connection
from django.db.utils import OperationalError

def landing_page(request):
    """
    Renders the professional landing page for the root URL.
    """
    return render(request, 'core/landing.html')

def health_check(request):
    """
    Health check endpoint returning the status of the API and Database.
    """
    db_status = "unhealthy"
    try:
        connection.ensure_connection()
        db_status = "healthy"
    except OperationalError:
        pass

    return JsonResponse({
        "status": "healthy",
        "database": db_status,
        "api": "running",
        "version": "1.0.0",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    })
