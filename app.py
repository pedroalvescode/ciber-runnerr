import os
import json
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

DATA_FILE = os.path.join(os.path.dirname(__file__), 'scores.json')

def load_scores():
    if not os.path.exists(DATA_FILE):
        return {"highscore": 0}
    try:
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    except Exception:
        return {"highscore": 0}

def save_scores(data):
    try:
        with open(DATA_FILE, 'w') as f:
            json.dump(data, f, indent=4)
    except Exception as e:
        print(f"Erro ao salvar recorde: {e}")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/highscore', methods=['GET'])
def get_highscore():
    scores = load_scores()
    return jsonify(scores)

@app.route('/api/highscore', methods=['POST'])
def update_highscore():
    data = request.get_json() or {}
    try:
        new_score = int(data.get('score', 0))
    except (TypeError, ValueError):
        new_score = 0
    scores = load_scores()
    
    if new_score > scores.get('highscore', 0):
        scores['highscore'] = new_score
        save_scores(scores)
        return jsonify({"status": "new_record", "highscore": new_score})
    
    return jsonify({"status": "ok", "highscore": scores.get('highscore', 0)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
