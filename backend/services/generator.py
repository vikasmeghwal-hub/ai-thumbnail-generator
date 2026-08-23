import asyncio
import logging
from sqlmodel import Session, select
from models import Job, Thumbnail
from database import engine
from services.imagekit_service import upload_file
from services.google_service import generate_image

logger = logging.getLogger(__name__)

STYLES = {
    "bold-dramatic": (
        "Bold Dramatic"
    ),
    "minimal": (
        "Minimal"
    ),
    "pastel": (
        "Pastel"
    )
}

STYLES_ORDER = ["bold-dramatic", "minimal", "pastel"]


async def generate_single_thumbnail(thumbnail_id: str, prompt: str, headshot_url: str):
    # db session generating img
    with Session(engine) as session:
        thumbnail = session.get(Thumbnail, thumbnail_id)
        job_id = thumbnail.job_id
        style_name = thumbnail.style_name
        thumbnail.status = "generating"
        session.add(thumbnail)
        session.commit()

        style_prompt = STYLES[style_name]

    # ai call
    try:
        image_bytes = await generate_image(prompt, style_prompt, headshot_url)

        # upload this image
        url = upload_file(
            file_bytes=image_bytes,
            file_name=f"{thumbnail_id}.png",
            folder=f"/thumbnails/{job_id}"
        )
        # db call save the url and mark uploaded
        with Session(engine) as session:
            thumbnail = session.get(Thumbnail, thumbnail_id)
            thumbnail.imagekit_url = url
            thumbnail.status = "uploaded"
            session.add(thumbnail)
            session.commit()
        logger.info(f"Generated thumbnail {thumbnail_id} for job {job_id}")
    except Exception as e:
        logger.error(f"Error generating thumbnail {thumbnail_id} for job {job_id}: {e}")
        with Session(engine) as session:
            thumbnail = session.get(Thumbnail, thumbnail_id)
            thumbnail.status = "failed"
            thumbnail.error_message = str(e)[:400]
            session.add(thumbnail)
            session.commit()


async def process_job(job_id: str):
    # mark job as processing
    # find all thumbnails for this job
    # start one worker for each thumbnail
    # wait for all workers to finish
    # mark job as done
    with Session(engine) as session:
        jb = session.get(Job, job_id)
        jb.status = "processing"
        prompt = jb.prompt
        headshot_url = jb.headshot_url
        session.add(jb)
        session.commit()

        thumbnails = session.exec(
            select(Thumbnail).where(Thumbnail.job_id == job_id)
        ).all()
        thumbnail_ids = [t.id for t in thumbnails]

    tasks = [
        generate_single_thumbnail(t_id, prompt, headshot_url)
        for t_id in thumbnail_ids
    ]
    await asyncio.gather(*tasks, return_exceptions=True)

    with Session(engine) as session:
        thumbnails = session.exec(
            select(Thumbnail).where(Thumbnail.job_id == job_id)
        ).all()
        all_failed = all(t.status == "failed" for t in thumbnails)
        jb = session.get(Job, job_id)
        jb.status = "failed" if all_failed else "done"
        session.add(jb)
        session.commit()
