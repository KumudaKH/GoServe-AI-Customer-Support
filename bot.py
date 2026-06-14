from openai import OpenAI

client = OpenAI(
  base_url = "https://integrate.api.nvidia.com/v1",
  api_key = "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"
)

completion = client.chat.completions.create(
  model="meta/llama-3.3-70b-instruct",
 messages=[
    {
        "role":"user",
        "content":"What is the capital of India?"
    }
],
  temperature=0.2,
  top_p=0.7,
  max_tokens=1024,
  stream=False
)

print(completion.choices[0].message.content)