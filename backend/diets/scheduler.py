from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import logging

logger = logging.getLogger(__name__)

def start_scheduler():
    scheduler = BackgroundScheduler()
    
    # Import inside the function to avoid circular imports during Django startup
    from diets.scraper import scrape_all_prices
    
    # Add job to run every day at 3:00 AM
    scheduler.add_job(
        scrape_all_prices,
        trigger=CronTrigger(hour=3, minute=0),
        id='scrape_prices_daily_job',
        replace_existing=True,
        name='Daily scraping of supermarket prices at 3:00 AM'
    )
    
    # Optionally: Run once at startup for testing (uncomment to test during dev)
    # scheduler.add_job(scrape_all_prices, trigger='date', run_date=None, id='scrape_prices_startup_job')
    
    try:
        scheduler.start()
        logger.info("APScheduler started automatically. Price scraping scheduled for 3:00 AM every day.")
        print("APScheduler iniciado. Scraping diario programado a las 3:00 AM.")
    except Exception as e:
        logger.error(f"Failed to start APScheduler: {e}")
