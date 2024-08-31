from flask import Flask, render_template, request, jsonify
import torch
from transformers import BertTokenizer, BertForSequenceClassification
import PyPDF2

app = Flask(__name__)

# Load pre-trained model and tokenizer
model = torch.load("my_model.pth", map_location=torch.device('cpu'))
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased', do_lower_case=True)

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

    # Split text data into paragraphs
    paragraphs = text_data.split('\n')

    # Perform inference on each paragraph
    paragraph_classifications = []
    for paragraph in paragraphs:
        if not paragraph.strip():  # Skip empty paragraphs
            continue

        # Preprocess the paragraph
        encoded_input = tokenizer(paragraph, padding=True, truncation=True, return_tensors="pt")

        # Perform inference
        with torch.no_grad():
            model.eval()
            outputs = model(**encoded_input)

        # Get predicted class probabilities
        predicted_probabilities = torch.softmax(outputs.logits, dim=1).tolist()[0]

        # Get predicted class (class with highest probability)
        predicted_class = torch.argmax(outputs.logits, dim=1).item()

        paragraph_classifications.append((paragraph, predicted_class, predicted_probabilities))

    # Aggregate paragraph classifications to classify the whole text
    pdf_class_probabilities = [0.0] * model.config.num_labels
    for _, class_label, class_probs in paragraph_classifications:
        for i, prob in enumerate(class_probs):
            pdf_class_probabilities[i] += prob

    pdf_class_probabilities = [prob / len(paragraph_classifications) for prob in pdf_class_probabilities]
    pdf_predicted_class = torch.argmax(torch.tensor(pdf_class_probabilities)).item()

    # Prepare the final response
    response_data = {
        'paragraphs': [
            {
                'paragraph': para,
                'predicted_class': cls,
                'probabilities': probs
            } for para, cls, probs in paragraph_classifications
        ],
        'final_class': pdf_predicted_class,
        'final_probabilities': pdf_class_probabilities
    }

    return jsonify(response_data)


if __name__ == "__main__":
    app.run(debug=True)
