from google import genai
# from PIL import Image
import base64
from config import GOOGLE_API_KEY

client = genai.Client(api_key=GOOGLE_API_KEY)



async def generate_image(prompt: str,style_prompt: str, headshot_url: str) -> bytes:
    full_prompt = (
        f"{style_prompt}\n\n"
        f"user request: {prompt}\n\n"
    )

    interaction = await client.interactions.create(
        model="gemini-3.1-flash-image",
        input=[
            {"role": "user",
            "content":[
                  {"type": "text", "text": full_prompt},
                  {"type": "input_image", "url": headshot_url}
              ] }
        ]
        )

    for item in interaction.output:
        if item.type == "output_image":
            return base64.b64decode(interaction.output_image)

    raise RuntimeError("Image generation failed")