from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from .views import landing_page, health_check

urlpatterns = [
    # Landing & Health
    path('', landing_page, name='landing-page'),
    path('health/', health_check, name='health-check'),

    path('admin/', admin.site.urls),
    
    # API V1 Endpoints
    path('api/v1/', include('courses.urls')),
    
    # AI Features (Future integration)
    path('api/v1/ai/', include('ai_features.urls')),

    # API Documentation (Swagger/OpenAPI)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path('api-auth/', include('rest_framework.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
