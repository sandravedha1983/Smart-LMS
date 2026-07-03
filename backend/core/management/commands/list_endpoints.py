from django.core.management.base import BaseCommand
from django.urls import URLPattern, URLResolver, get_resolver
from django.conf import settings
from rest_framework.viewsets import ViewSet
from rest_framework.views import APIView
from rest_framework.generics import (
    ListAPIView, CreateAPIView, ListCreateAPIView,
    RetrieveAPIView, UpdateAPIView, DestroyAPIView,
    RetrieveUpdateAPIView, RetrieveDestroyAPIView, RetrieveUpdateDestroyAPIView
)
from collections import defaultdict


class Command(BaseCommand):
    help = 'Display all registered API endpoints'

    def add_arguments(self, parser):
        parser.add_argument(
            '--simple',
            action='store_true',
            help='Display in simple format without HTTP methods'
        )
        parser.add_argument(
            '--api-only',
            action='store_true',
            help='Show only API endpoints (exclude admin and static)'
        )
        parser.add_argument(
            '--debug',
            action='store_true',
            help='Show debug information'
        )

    def handle(self, *args, **options):
        endpoints = self.get_all_endpoints()
        
        if options.get('api_only'):
            # Filter to only API endpoints
            endpoints = [e for e in endpoints if '/api/' in e['path'] or e['path'] == '/admin/']
        
        self.display_endpoints(endpoints, simple=options.get('simple', False), api_only=options.get('api_only', False))

    def get_all_endpoints(self):
        """Extract all URL patterns from Django URL configuration."""
        resolver = get_resolver()
        endpoints = []
        
        self.recurse_resolver(resolver, '', endpoints)
        
        return sorted(endpoints, key=lambda x: x['path'])

    def recurse_resolver(self, resolver, prefix, endpoints):
        """Recursively traverse URL patterns to extract all endpoints."""
        for pattern in resolver.url_patterns:
            if isinstance(pattern, URLResolver):
                # Nested URL include
                new_prefix = prefix + str(pattern.pattern)
                self.recurse_resolver(pattern, new_prefix, endpoints)
            elif isinstance(pattern, URLPattern):
                # Actual endpoint
                full_path = prefix + str(pattern.pattern)
                full_path = full_path.replace('^', '').replace('$', '')
                
                view_name = self.get_view_name(pattern.callback)
                http_methods = self.get_http_methods(pattern.callback)
                
                endpoints.append({
                    'path': f'/{full_path}',
                    'methods': http_methods,
                    'view': view_name,
                    'name': pattern.name or 'N/A'
                })

    def get_view_name(self, view_func):
        """Extract view class/function name."""
        if hasattr(view_func, 'cls'):
            # Class-based view (e.g., from as_view())
            return view_func.cls.__name__
        elif hasattr(view_func, '__name__'):
            return view_func.__name__
        else:
            return str(view_func)

    def get_http_methods(self, view_func):
        """Determine HTTP methods supported by the view."""
        try:
            if not hasattr(view_func, 'cls'):
                # Function-based view
                return 'GET, POST'
            
            view_class = view_func.cls
            
            # Direct import and class checking
            from rest_framework.generics import (
                ListCreateAPIView, RetrieveUpdateDestroyAPIView,
                RetrieveUpdateAPIView, ListAPIView, CreateAPIView,
                RetrieveDestroyAPIView, RetrieveAPIView, UpdateAPIView,
                DestroyAPIView
            )
            
            # Check most specific classes first
            if ListCreateAPIView in view_class.__mro__:
                return 'GET, POST'
            elif RetrieveUpdateDestroyAPIView in view_class.__mro__:
                return 'DELETE, GET, PATCH, PUT'
            elif RetrieveUpdateAPIView in view_class.__mro__:
                return 'GET, PATCH, PUT'
            elif RetrieveDestroyAPIView in view_class.__mro__:
                return 'DELETE, GET'
            elif ListAPIView in view_class.__mro__:
                return 'GET'
            elif CreateAPIView in view_class.__mro__:
                return 'POST'
            elif RetrieveAPIView in view_class.__mro__:
                return 'GET'
            elif UpdateAPIView in view_class.__mro__:
                return 'PATCH, PUT'
            elif DestroyAPIView in view_class.__mro__:
                return 'DELETE'
            
            # Fallback: check methods on APIView subclasses
            from rest_framework.views import APIView
            if APIView in view_class.__mro__:
                methods = []
                if hasattr(view_class, 'get'):
                    methods.append('GET')
                if hasattr(view_class, 'post'):
                    methods.append('POST')
                if hasattr(view_class, 'put'):
                    methods.append('PUT')
                if hasattr(view_class, 'patch'):
                    methods.append('PATCH')
                if hasattr(view_class, 'delete'):
                    methods.append('DELETE')
                
                if methods:
                    return ', '.join(methods)
            
            return 'GET'
            
        except Exception as e:
            return 'GET'


    def categorize_endpoints(self, endpoints):
        """Organize endpoints by category."""
        categories = defaultdict(list)
        
        for endpoint in endpoints:
            path = endpoint['path']
            
            if path == '/admin/':
                category = 'Admin Panel'
            elif '/admin/' in path and not '/admin/auth' in path:
                category = 'Admin Interface'
            elif '/api/v1/auth/' in path:
                category = 'Authentication'
            elif '/api/v1/courses/' in path or '/api/v1/lessons/' in path:
                category = 'Courses & Lessons'
            elif '/api/v1/progress/' in path:
                category = 'Progress'
            elif '/api/v1/certificates/' in path:
                category = 'Certificates'
            elif '/api/v1/puzzles/' in path:
                category = 'Gamification'
            elif '/api/v1/ai/' in path:
                category = 'AI Features'
            elif '/api/schema/' in path or '/api/docs/' in path or '/api/redoc/' in path:
                category = 'API Documentation'
            elif '/api-auth/' in path:
                category = 'DRF Authentication'
            elif '/static/' in path or '/media/' in path:
                category = 'Static & Media'
            else:
                category = 'Other'
            
            categories[category].append(endpoint)
        
        return categories

    def display_endpoints(self, endpoints, simple=False, api_only=False):
        """Display endpoints in a formatted table."""
        categories = self.categorize_endpoints(endpoints)
        
        self.stdout.write(self.style.SUCCESS('\n'))
        self.stdout.write(self.style.SUCCESS('=' * 110))
        self.stdout.write(self.style.SUCCESS('SMART LEARNING PORTAL - API ENDPOINTS'))
        self.stdout.write(self.style.SUCCESS('=' * 110))
        self.stdout.write(self.style.SUCCESS('\n'))
        
        # Order categories for display
        category_order = [
            'Admin Panel',
            'Admin Interface', 
            'Authentication',
            'Courses & Lessons',
            'Progress',
            'Certificates',
            'Gamification',
            'AI Features',
            'API Documentation',
            'DRF Authentication',
            'Static & Media',
            'Other'
        ]
        
        # Display by category
        for category in category_order:
            if category not in categories:
                continue
            
            self.stdout.write(self.style.HTTP_INFO(f'\n{category}:'))
            self.stdout.write('-' * 110)
            
            for endpoint in categories[category]:
                if simple:
                    self.stdout.write(f"  {endpoint['path']}")
                else:
                    # Full format with methods
                    methods = endpoint['methods']
                    path = endpoint['path']
                    methods_display = f"[{methods}]".ljust(25)
                    view_display = f"({endpoint['view']})".ljust(35)
                    self.stdout.write(f"  {methods_display} {path}")
        
        self.stdout.write(self.style.SUCCESS('\n'))
        self.stdout.write(self.style.SUCCESS('=' * 110))
        self.stdout.write(self.style.SUCCESS(f'Total Endpoints: {len(endpoints)}'))
        self.stdout.write(self.style.SUCCESS('=' * 110))
        self.stdout.write(self.style.SUCCESS('\n'))
        
        # Server info
        protocol = 'https' if not settings.DEBUG else 'http'
        host = settings.ALLOWED_HOSTS[0] if settings.ALLOWED_HOSTS else 'localhost'
        port = '8000'
        
        self.stdout.write(self.style.WARNING(
            f'Server: {protocol}://{host}:{port}\n'
        ))
        
        if api_only:
            self.stdout.write(self.style.WARNING(
                'Tip: Use "python manage.py list_endpoints" to see all endpoints\n'
            ))

