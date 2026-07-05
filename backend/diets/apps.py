from django.apps import AppConfig


class DietsConfig(AppConfig):
    name = 'diets'

    def ready(self):
        import os
        # Only run the scheduler once (prevent it from running twice due to auto-reloader)
        if os.environ.get('RUN_MAIN', None) != 'true':
            from diets.scheduler import start_scheduler
            start_scheduler()
