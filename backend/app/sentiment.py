import os
from transformers import pipeline

MODEL_NAME = os.getenv(
    "MODEL_NAME",
    "distilbert-base-uncased-finetuned-sst-2-english"
)

sentiment_pipeline = None


def load_model():
    global sentiment_pipeline

    if sentiment_pipeline is None:
        sentiment_pipeline = pipeline(
            "sentiment-analysis",
            model=MODEL_NAME,
            tokenizer=MODEL_NAME
        )

    return sentiment_pipeline


def analyze_sentiment(text: str):
    model = load_model()
    result = model(text)[0]

    return {
        "sentiment": result["label"],
        "confidence": float(result["score"])
    }
