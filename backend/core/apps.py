from django.apps import AppConfig
from django.core.management import call_command
import sys
import atexit


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        """Called when Django is ready. Display endpoints if running server."""
        # Only show endpoints when running the development server
        if 'runserver' in sys.argv:
            # Delay execution to ensure all apps are loaded
            import threading
            thread = threading.Thread(target=self.display_endpoints_on_start)
            thread.daemon = True
            thread.start()

    @staticmethod
    def display_endpoints_on_start():
        """Display API endpoints on server start."""
        import time
        time.sleep(1)  # Give Django time to fully start
        
        try:
            # Import here to avoid circular imports
            from django.core.management import call_command
            from io import StringIO
            
            call_command('list_endpoints')
        except Exception as e:
            print(f"Error displaying endpoints: {e}")
