from flask import Flask, request, send_file, jsonify
from pymongo import MongoClient
from bson import ObjectId
from docx import Document
from dotenv import load_dotenv
import os
import tempfile
from docx.shared import Pt
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT

# Load environment variables from the .env file
load_dotenv()

app = Flask(__name__)

# Fetch sensitive data from environment variables
mongodb_connection_string = os.getenv('CONNECTION_STRING_MONGODB')
mongodb_db = os.getenv('DB')
mongodb_users = os.getenv('COLLECTION')

# Connect to MongoDB
client = MongoClient(mongodb_connection_string)
db = client[mongodb_db]
users = db[mongodb_users]

@app.route('/generate-doc', methods=['POST'])
def generate_doc():
    try:
        user_id = request.json.get('userId')
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        user = users.find_one({'_id': ObjectId(user_id)})
        if not user or 'resume' not in user or 'generatedResume' not in user['resume']:
            return jsonify({"error": "No resume found for this user"}), 404

        generated_resume = user['resume']['generatedResume']

        # Create a new Word document
        doc = Document()

        # Split the resume text by double newlines and further check if the next section contains a semicolon
        sections = generated_resume.split('\n\n')
        
        for section in sections:
            lines = section.split('\n')

            # Check if the first line contains a semicolon (indicating a section header)
            if len(lines) > 0 and ":" or "references" in lines[0] :
                # If not the first section, add a horizontal line
                if sections.index(section) > 0:
                    separator = doc.add_paragraph()
                    run = separator.add_run()
                    run.bold = True
                    run.add_text('_____________________________________________________________________________________')
                    separator_format = separator.paragraph_format
                    separator_format.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER

                # The first line after the separator should be bold (for section titles)
                first_line = doc.add_paragraph()
                run = first_line.add_run(lines[0])
                run.bold = True

                # Add the remaining lines normally within the same section
                for line in lines[1:]:
                    if line.strip():  # Avoid adding extra blank lines
                        doc.add_paragraph(line)
            else:
                # If there's no semicolon in the first line, treat it as a continuation of the previous section
                for line in lines:
                    if line.strip():
                        doc.add_paragraph(line)

        # Save to a temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".docx")
        doc.save(temp_file.name)

        # Return the generated document as a download
        return send_file(temp_file.name, as_attachment=True, download_name="resume.docx")

    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": f"An error occurred: {e}"}), 500


if __name__ == '__main__':
    app.run(debug=True)
