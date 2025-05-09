import os
from openai import OpenAI  # Updated import

# Initialize the OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def generate_summary(feedback_data):
    # Construct the input prompt for summarization
    prompt = f"Summarize the following customer feedback into a concise report:\n{feedback_data}"

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",  # Using GPT-3.5 Turbo model
        messages=[
            {"role": "system", "content": "You are a helpful assistant that summarizes feedback."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=250,
        temperature=0.7,
    )

    summary = response.choices[0].message.content.strip()
    return summary