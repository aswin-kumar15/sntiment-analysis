import os
from flask import Flask, render_template, request, jsonify
from textblob import TextBlob
import json
from datetime import datetime

app = Flask(__name__)

# Store analysis history (in-memory for now)
analysis_history = []

def analyze_sentiment(text):
    """
    Analyze sentiment of given text using TextBlob
    Returns sentiment classification, polarity, and subjectivity
    """
    if not text or text.strip() == "":
        return None
    
    # Create TextBlob object
    blob = TextBlob(text)
    
    # Get polarity and subjectivity
    polarity = blob.sentiment.polarity
    subjectivity = blob.sentiment.subjectivity
    
    # Classify sentiment based on polarity
    if polarity > 0.1:
        sentiment = "Positive"
        emoji = "😊"
        color = "success"
    elif polarity < -0.1:
        sentiment = "Negative"
        emoji = "😔"
        color = "danger"
    else:
        sentiment = "Neutral"
        emoji = "😐"
        color = "secondary"
    
    return {
        'text': text,
        'sentiment': sentiment,
        'emoji': emoji,
        'color': color,
        'polarity': round(polarity, 4),
        'subjectivity': round(subjectivity, 4),
        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

@app.route('/')
def index():
    """Render home page"""
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    """Analyze sentiment of submitted text"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Perform sentiment analysis
        result = analyze_sentiment(text)
        
        if result:
            # Add to history
            analysis_history.append(result)
            # Keep only last 10 analyses
            if len(analysis_history) > 10:
                analysis_history.pop(0)
            
            return jsonify({
                'success': True,
                'result': result
            })
        else:
            return jsonify({'error': 'Invalid text'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/history')
def history():
    """Get analysis history"""
    return jsonify({
        'success': True,
        'history': list(reversed(analysis_history))
    })

@app.route('/batch-analyze', methods=['POST'])
def batch_analyze():
    """Analyze multiple texts at once"""
    try:
        data = request.get_json()
        texts = data.get('texts', [])
        
        if not texts:
            return jsonify({'error': 'No texts provided'}), 400
        
        results = []
        for text in texts:
            result = analyze_sentiment(text)
            if result:
                results.append(result)
        
        return jsonify({
            'success': True,
            'results': results
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/stats')
def stats():
    """Get statistics from analysis history"""
    if not analysis_history:
        return jsonify({
            'success': True,
            'stats': {
                'total': 0,
                'positive': 0,
                'negative': 0,
                'neutral': 0
            }
        })
    
    stats = {
        'total': len(analysis_history),
        'positive': sum(1 for item in analysis_history if item['sentiment'] == 'Positive'),
        'negative': sum(1 for item in analysis_history if item['sentiment'] == 'Negative'),
        'neutral': sum(1 for item in analysis_history if item['sentiment'] == 'Neutral'),
        'avg_polarity': round(sum(item['polarity'] for item in analysis_history) / len(analysis_history), 4),
        'avg_subjectivity': round(sum(item['subjectivity'] for item in analysis_history) / len(analysis_history), 4)
    }
    
    return jsonify({
        'success': True,
        'stats': stats
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)