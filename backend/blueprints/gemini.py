from flask import Blueprint, request, jsonify
import os
import google.generativeai as genai
from flask_cors import cross_origin

gemini_bp = Blueprint('gemini', __name__)

# Configure Gemini
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

@gemini_bp.route('/api/generate-text', methods=['POST', 'OPTIONS'])
@cross_origin()
def generate_text():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
            
        prompt = data.get('prompt', '').strip()
        
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400
        
        # Check if API key is configured
        if not GEMINI_API_KEY:
            return jsonify({
                'error': 'Gemini API not configured',
                'text': '⚠️ AI service is currently unavailable. Please try again later.'
            }), 503
        
        # Initialize the model
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        
        return jsonify({
            'text': response.text,
            'success': True
        })
        
    except Exception as e:
        print(f"Gemini API error: {str(e)}")
        return jsonify({
            'error': 'Failed to generate response',
            'text': '⚠️ Something went wrong. Please try again.',
            'success': False
        }), 500

# Health check for Gemini service
@gemini_bp.route('/api/gemini/health', methods=['GET'])
@cross_origin()
def health_check():
    return jsonify({
        'status': 'available' if GEMINI_API_KEY else 'unconfigured',
        'service': 'Gemini AI'
    })