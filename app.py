from flask import Flask, render_template, request, jsonify
import io
import torch
from transformers import BertTokenizer, BertForSequenceClassification

app = Flask(__name__)
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased', do_lower_case=True)
model=torch.load('my_model.pth', map_location=torch.device('cpu'))

@app.route("/")
def home():
    return render_template('index.html')

@app.route("/contact")
def contact():
    return render_template('contact.html')

@app.route('/predict', methods=['POST'])
def predict():
    text_data = request.json.get('text')
    if not text_data:
        return jsonify({'error': 'Input text is empty'}), 400

    # Preprocess input text (e.g., tokenize)
    tokenized_input = tokenizer.encode_plus(text_data, padding=True, truncation=True, return_tensors='pt')

    # Perform inference
    with torch.no_grad():
        outputs = model(**tokenized_input)

    # Process outputs and generate response
    predicted_probability = torch.softmax(outputs.logits, dim=1).tolist()[0]

    predicted_class = torch.argmax(outputs.logits, dim=1).item() 

    ai_generated_probability = predicted_probability[1]
    response = round(ai_generated_probability * 100, 2)

    return jsonify({'aiPercentage': response})


if __name__ == "__main__":
    app.run(debug=True)
