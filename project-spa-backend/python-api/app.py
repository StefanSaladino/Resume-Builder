from flask import Flask, request, send_file
from pymongo import MongoClient
from docx import Document
from dotenv import load_dotenv
import os

# Load environment variables from the .env file
load_dotenv()

app = Flask(__name__)

# Fetch sensitive data from environment variables
mongodb_connection_string = os.getenv('CONNECTION_STRING_MONGODB')
mongodb_db=os.getenv('DB')
mongodb_users=os.getenv('COLLECTION')

# Connect to MongoDB using the connection string from .env
client = MongoClient(mongodb_connection_string)
db = client[mongodb_db]
users = db[mongodb_users]

try:
    client = MongoClient(mongodb_connection_string)
    print("Connected to MongoDB")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")


@app.route('/generate-doc', methods=['POST'])
def generate_doc():
    # Extract the userID from the request or authentication header
    user_id = request.json.get('userId')
    
    # Fetch the user data from MongoDB
    user = users.find_one({'_id': user_id})
    
    if not user or 'generatedResume' not in user['resume']:
        return "No resume found for this user.", 404

    generated_resume = user['resume']['generatedResume']
    
    # Create a new Word document
    doc = Document()
    
    # Split the resume content into lines and add to the Word document
    lines = generated_resume.split('\n')
    for line in lines:
        doc.add_paragraph(line)

    # Save the document
    file_path = "generated_resume.docx"
    doc.save(file_path)

    return send_file(file_path, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
