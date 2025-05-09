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
def generate_summary(request: dict):
    try:
        summary_type = request.get("type", "general")
        
        # Combine all feedback into one string (trim to ~4000 chars)
        feedback_data = "\n".join(df["Feedback Text"].dropna().astype(str).tolist())
        feedback_data = feedback_data[:3800]

        # Build prompt based on summary type
        if summary_type == "general":
            prompt = (
                "You are an expert analyst. Summarize the following customer feedback "
                "into concise bullet points, highlighting: overall sentiment, "
                "common praises, and recurring issues.\n\n"
                f"{feedback_data}"
            )
        elif summary_type == "actionable":
            prompt = (
                "You are an expert business consultant. Review the following customer feedback "
                "and provide actionable recommendations for improving products/services. "
                "Focus on specific changes, prioritizing high-impact items, and "
                "provide concrete next steps for the business.\n\n"
                f"{feedback_data}"
            )
        elif summary_type == "sentiment":
            prompt = (
                "You are an expert in sentiment analysis. Analyze the following customer feedback "
                "and provide a detailed sentiment breakdown. Include: overall sentiment score, "
                "emotional tone analysis, positive/negative language patterns, and "
                "sentiment trends or shifts if apparent.\n\n"
                f"{feedback_data}"
            )
        else:
            prompt = (
                "Summarize the following customer feedback in a helpful way:\n\n"
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

    # Print column names for debugging
    print("Available columns:", df_copy.columns.tolist())

    # Sentiment Analysis
    df_copy['sentiment'] = df_copy['Feedback Text'].apply(lambda x: TextBlob(str(x)).sentiment.polarity)
    df_copy['sentiment_label'] = df_copy['sentiment'].apply(
        lambda s: 'positive' if s > 0.1 else 'negative' if s < -0.1 else 'neutral'
    )

    # Sentiment distribution
    sentiment_counts = df_copy['sentiment_label'].value_counts().to_dict()
    
    # Ensure all categories exist (positive, negative, neutral)
    for cat in ['positive', 'negative', 'neutral']:
        if cat not in sentiment_counts:
            sentiment_counts[cat] = 0

    # Average rating by product (if available)
    avg_rating_data = []
    if 'Product/Service' in df_copy.columns and 'Rating' in df_copy.columns:
        avg_rating = df_copy.groupby('Product/Service')['Rating'].mean().reset_index()
        avg_rating.columns = ['product', 'rating']  # Ensure column names match frontend expectations
        avg_rating_data = avg_rating.to_dict(orient="records")
    elif 'Product' in df_copy.columns and 'Rating' in df_copy.columns:
        avg_rating = df_copy.groupby('Product')['Rating'].mean().reset_index()
        avg_rating.columns = ['product', 'rating']
        avg_rating_data = avg_rating.to_dict(orient="records")
    elif 'product' in df_copy.columns and 'rating' in df_copy.columns:
        avg_rating = df_copy.groupby('product')['rating'].mean().reset_index()
        avg_rating_data = avg_rating.to_dict(orient="records")
    
    # Sentiment trend over time
    sentiment_trend_data = []
    if 'Date' in df_copy.columns:
        df_copy['Date'] = pd.to_datetime(df_copy['Date'], errors='coerce')
        df_copy = df_copy.dropna(subset=['Date'])  # Drop rows with invalid dates
        if not df_copy.empty:
            trend = df_copy.groupby(df_copy['Date'].dt.to_period('M'))['sentiment'].mean().reset_index()
            trend['date'] = trend['Date'].astype(str)
            sentiment_trend_data = trend[['date', 'sentiment']].to_dict(orient="records")
    elif 'date' in df_copy.columns:
        df_copy['date'] = pd.to_datetime(df_copy['date'], errors='coerce')
        df_copy = df_copy.dropna(subset=['date'])  # Drop rows with invalid dates
        if not df_copy.empty:
            trend = df_copy.groupby(df_copy['date'].dt.to_period('M'))['sentiment'].mean().reset_index()
            trend['date'] = trend['date'].astype(str)
            sentiment_trend_data = trend.to_dict(orient="records")
    
    # Common keywords from feedback
    words = []
    for feedback in df_copy['Feedback Text'].dropna():
        tokens = re.findall(r'\b\w+\b', str(feedback).lower())
        words += [word for word in tokens if word not in ['the', 'is', 'was', 'and', 'i', 'to', 'a']]
    common_words = Counter(words).most_common(5)
    keyword_data = [{'word': word, 'count': count} for word, count in common_words]

    # Radar Chart Data: Average Sentiment by Category
    radar_chart_data = []
    if 'Category' in df_copy.columns:
        radar_data = df_copy.groupby('Category')['sentiment'].mean().reset_index()
        radar_data.columns = ['name', 'sentiment']  # Ensure column names match frontend expectations
        radar_data['sentiment'] = radar_data['sentiment'].round(2)
        radar_chart_data = radar_data.to_dict(orient='records')
    elif 'category' in df_copy.columns:
        radar_data = df_copy.groupby('category')['sentiment'].mean().reset_index()
        radar_data.columns = ['name', 'sentiment']  # Change column name to match frontend
        radar_data['sentiment'] = radar_data['sentiment'].round(2)
        radar_chart_data = radar_data.to_dict(orient='records')

    response_data = {
        "average_rating": avg_rating_data,
        "sentiment_distribution": sentiment_counts,
        "sentiment_trend": sentiment_trend_data,
        "common_words": keyword_data,
        "radar_data": radar_chart_data
    }
    
    print("API Response:", response_data)
    
    return response_data

# New endpoint to handle filtered feedback based on date range and category
# ...existing code...

@app.get("/filtered-feedback")
def filtered_feedback(
    start: str = Query(None), 
    end: str = Query(None),
    category: str = Query(None)
):
    df_copy = df.copy()
    
    # Check for date column case
    date_col = None
    if 'Date' in df_copy.columns:
        date_col = 'Date'
    elif 'date' in df_copy.columns:
        date_col = 'date'
    
    # Check for category column case
    cat_col = None
    if 'Category' in df_copy.columns:
        cat_col = 'Category'
    elif 'category' in df_copy.columns:
        cat_col = 'category'
        
    # Apply date filtering if date column exists
    if date_col:
        df_copy[date_col] = pd.to_datetime(df_copy[date_col], errors='coerce')
        if start:
            df_copy = df_copy[df_copy[date_col] >= pd.to_datetime(start)]
        if end:
            df_copy = df_copy[df_copy[date_col] <= pd.to_datetime(end)]

    # Apply category filter if provided and if category column exists
    if category and cat_col:
        df_copy = df_copy[df_copy[cat_col] == category]

    # Re-apply sentiment analysis to filtered data
    df_copy['sentiment'] = df_copy['Feedback Text'].apply(lambda x: TextBlob(str(x)).sentiment.polarity)
    df_copy['sentiment_label'] = df_copy['sentiment'].apply(
        lambda s: 'positive' if s > 0.1 else 'negative' if s < -0.1 else 'neutral'
    )

    # Sentiment distribution for filtered data
    sentiment_counts = df_copy['sentiment_label'].value_counts().to_dict()
    
    # Ensure all categories exist (positive, negative, neutral)
    for cat in ['positive', 'negative', 'neutral']:
        if cat not in sentiment_counts:
            sentiment_counts[cat] = 0

    # Average rating by product for filtered data
    avg_rating_data = []
    if 'Product/Service' in df_copy.columns and 'Rating' in df_copy.columns:
        avg_rating = df_copy.groupby('Product/Service')['Rating'].mean().reset_index()
        avg_rating.columns = ['product', 'rating']
        avg_rating_data = avg_rating.to_dict(orient="records")
    elif 'Product' in df_copy.columns and 'Rating' in df_copy.columns:
        avg_rating = df_copy.groupby('Product')['Rating'].mean().reset_index()
        avg_rating.columns = ['product', 'rating']
        avg_rating_data = avg_rating.to_dict(orient="records")
    elif 'product' in df_copy.columns and 'rating' in df_copy.columns:
        avg_rating = df_copy.groupby('product')['rating'].mean().reset_index()
        avg_rating_data = avg_rating.to_dict(orient="records")

    # Sentiment trend over time for filtered data
    sentiment_trend_data = []
    if date_col and not df_copy.empty:
        # Fix: Simplify the trend data creation
        trend = df_copy.groupby(df_copy[date_col].dt.to_period('M'))['sentiment'].mean().reset_index()
        trend['date'] = trend[date_col].dt.strftime('%Y-%m')  # Format date as string
        sentiment_trend_data = trend[['date', 'sentiment']].to_dict(orient="records")

    # Common keywords from filtered feedback
    words = []
    for feedback in df_copy['Feedback Text'].dropna():
        tokens = re.findall(r'\b\w+\b', str(feedback).lower())
        words += [word for word in tokens if word not in ['the', 'is', 'was', 'and', 'i', 'to', 'a']]
    common_words = Counter(words).most_common(5)
    keyword_data = [{'word': word, 'count': count} for word, count in common_words]

    # Radar chart data for filtered data
    radar_chart_data = []
    if cat_col:
        radar_data = df_copy.groupby(cat_col)['sentiment'].mean().reset_index()
        radar_data.columns = ['name', 'sentiment']
        radar_data['sentiment'] = radar_data['sentiment'].round(2)
        radar_chart_data = radar_data.to_dict(orient='records')

    response_data = {
        "average_rating": avg_rating_data,
        "sentiment_distribution": sentiment_counts,
        "sentiment_trend": sentiment_trend_data,
        "common_words": keyword_data,
        "radar_data": radar_chart_data
    }
    
    print("Filtered API Response:", response_data)
    
    return response_data