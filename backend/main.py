from fastapi import FastAPI, Query, Depends, HTTPException

from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from dotenv import load_dotenv
import os
from openai import OpenAI
from textblob import TextBlob
from collections import Counter
import re

# ─── Load environment ─────────────────────────────────────────────
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
# ─── App setup ──────────────────────────────────────────────────
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # for dev; lock this down in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Load data ─────────────────────────────────────────────────
df = pd.read_csv("feedback.csv")

@app.get("/")
def read_root():
    return {"message": "Customer Feedback API is running"}

@app.get("/feedback")
def get_feedback():
    return df.to_dict(orient="records")

# ─── Generate AI summary ────────────────────────────────────────
@app.post("/generate-summary")
def generate_summary():
    try:
        # Combine all feedback into one string (trim to ~4000 chars)
        feedback_data = "\n".join(df["Feedback Text"].dropna().astype(str).tolist())
        feedback_data = feedback_data[:3800]

        # Build prompt
        prompt = (
            "You are an expert analyst. Summarize the following customer feedback "
            "into concise bullet points, highlighting: overall sentiment, "
            "common praises, and recurring issues.\n\n"
            f"{feedback_data}"
        )

        # Call OpenAI with updated API
        resp = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You summarize customer feedback."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=300,
        )
        summary_text = resp.choices[0].message.content.strip()
        return {"summary": summary_text}

    except Exception as e:
        return {"error": str(e)}


# Modified feedback-summary endpoint with Radar chart and Filters
@app.get("/feedback-summary")
def feedback_summary():
    df_copy = df.copy()

    # Sentiment Analysis
    df_copy['sentiment'] = df_copy['Feedback Text'].apply(lambda x: TextBlob(str(x)).sentiment.polarity)
    df_copy['sentiment_label'] = df_copy['sentiment'].apply(
        lambda s: 'positive' if s > 0.1 else 'negative' if s < -0.1 else 'neutral'
    )

    # Sentiment distribution
    sentiment_counts = df_copy['sentiment_label'].value_counts().to_dict()

    # Average rating by product (if available)
    if 'product' in df_copy.columns and 'rating' in df_copy.columns:
        avg_rating = df_copy.groupby('product')['rating'].mean().reset_index()
        avg_rating_data = avg_rating.to_dict(orient="records")
    else:
        avg_rating_data = []

    # Sentiment trend over time
    if 'date' in df_copy.columns:
        df_copy['date'] = pd.to_datetime(df_copy['date'], errors='coerce')
        trend = df_copy.groupby(df_copy['date'].dt.to_period('M'))['sentiment'].mean().reset_index()
        trend['date'] = trend['date'].astype(str)
        sentiment_trend_data = trend.to_dict(orient="records")
    else:
        sentiment_trend_data = []

    # Common keywords from feedback
    words = []
    for feedback in df_copy['Feedback Text'].dropna():
        tokens = re.findall(r'\b\w+\b', str(feedback).lower())
        words += [word for word in tokens if word not in ['the', 'is', 'was', 'and', 'i', 'to', 'a']]
    common_words = Counter(words).most_common(5)
    keyword_data = [{'word': word, 'count': count} for word, count in common_words]

    # Radar Chart Data: Average Sentiment by Category
    if 'category' in df_copy.columns:
        radar_data = df_copy.groupby('category')['sentiment'].mean().reset_index()
        radar_data['sentiment'] = radar_data['sentiment'].round(2)
        radar_chart_data = radar_data.to_dict(orient='records')
    else:
        radar_chart_data = []

    return {
        "average_rating": avg_rating_data,
        "sentiment_distribution": sentiment_counts,
        "sentiment_trend": sentiment_trend_data,
        "common_words": keyword_data,
        "radar_data": radar_chart_data
    }

# New endpoint to handle filtered feedback based on date range and category
@app.get("/filtered-feedback")
def filtered_feedback(
    start: str = Query(None), 
    end: str = Query(None),
    category: str = Query(None)
):
    df_copy = df.copy()
    df_copy['date'] = pd.to_datetime(df_copy['date'], errors='coerce')

    # Apply date filters if provided
    if start:
        df_copy = df_copy[df_copy['date'] >= pd.to_datetime(start)]
    if end:
        df_copy = df_copy[df_copy['date'] <= pd.to_datetime(end)]

    # Apply category filter if provided
    if category:
        df_copy = df_copy[df_copy['category'] == category]

    # Re-apply sentiment analysis to filtered data
    df_copy['sentiment'] = df_copy['Feedback Text'].apply(lambda x: TextBlob(str(x)).sentiment.polarity)
    df_copy['sentiment_label'] = df_copy['sentiment'].apply(
        lambda s: 'positive' if s > 0.1 else 'negative' if s < -0.1 else 'neutral'
    )

    # Sentiment distribution for filtered data
    sentiment_counts = df_copy['sentiment_label'].value_counts().to_dict()

    # Average rating by product for filtered data
    if 'product' in df_copy.columns and 'rating' in df_copy.columns:
        avg_rating = df_copy.groupby('product')['rating'].mean().reset_index()
        avg_rating_data = avg_rating.to_dict(orient="records")
    else:
        avg_rating_data = []

    # Sentiment trend over time for filtered data
    if 'date' in df_copy.columns:
        trend = df_copy.groupby(df_copy['date'].dt.to_period('M'))['sentiment'].mean().reset_index()
        trend['date'] = trend['date'].astype(str)
        sentiment_trend_data = trend.to_dict(orient="records")
    else:
        sentiment_trend_data = []

    # Common keywords from filtered feedback
    words = []
    for feedback in df_copy['Feedback Text'].dropna():
        tokens = re.findall(r'\b\w+\b', str(feedback).lower())
        words += [word for word in tokens if word not in ['the', 'is', 'was', 'and', 'i', 'to', 'a']]
    common_words = Counter(words).most_common(5)
    keyword_data = [{'word': word, 'count': count} for word, count in common_words]

    # Radar chart data for filtered data
    if 'category' in df_copy.columns:
        radar_data = df_copy.groupby('category')['sentiment'].mean().reset_index()
        radar_data['sentiment'] = radar_data['sentiment'].round(2)
        radar_chart_data = radar_data.to_dict(orient='records')
    else:
        radar_chart_data = []

    return {
        "average_rating": avg_rating_data,
        "sentiment_distribution": sentiment_counts,
        "sentiment_trend": sentiment_trend_data,
        "common_words": keyword_data,
        "radar_data": radar_chart_data
    }
