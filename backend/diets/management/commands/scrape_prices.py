from django.core.management.base import BaseCommand
from diets.scraper import scrape_all_prices

class Command(BaseCommand):
    help = 'Actualiza los precios de los alimentos en el catálogo usando web scraping de Plaza Vea (VTEX API).'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Iniciando el scraping de precios...'))
        
        updated, failed = scrape_all_prices()
        
        self.stdout.write(self.style.SUCCESS(f'Scraping completado. {updated} actualizados, {failed} fallidos o sin datos.'))
