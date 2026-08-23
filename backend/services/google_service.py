import asyncio
import httpx
from google import genai
from google.genai import types
from config import GOOGLE_API_KEY

client = genai.Client(api_key=GOOGLE_API_KEY)

MODEL_NAME = "gemini-2.5-flash-image"


async def _fetch_image_bytes(url: str) -> tuple[bytes, str]:
    async with httpx.AsyncClient(timeout=30) as http_client:
        response = await http_client.get(url)
        response.raise_for_status()
        content_type = response.headers.get("content-type", "image/png")
        return response.content, content_type


def _call_gemini(full_prompt: str, image_bytes: bytes, mime_type: str) -> bytes:
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=[
            full_prompt,
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
        ],
    )

    for candidate in response.candidates or []:
        for part in candidate.content.parts or []:
            if getattr(part, "inline_data", None) is not None:
                return part.inline_data.data

    raise RuntimeError("Image generation failed")


async def generate_image(prompt: str, style_prompt: str, headshot_url: str) -> bytes:
    full_prompt = (
        f"{style_prompt}\n\n"
        f"user request: {prompt}\n\n"
        "Generate a single eye-catching YouTube thumbnail image featuring the "
        "person in the reference photo."
    )

    image_bytes, mime_type = await _fetch_image_bytes(headshot_url)

    return await asyncio.to_thread(_call_gemini, full_prompt, image_bytes, mime_type)
