# EcoCollect - Flask + SQLite

This version adds a real local SQLite database to the e-waste pickup form.

## Project structure

EcoCollect_Flask_SQLite/
├── app.py
├── requirements.txt
├── README.txt
├── templates/
│   ├── index.html
│   └── admin.html
└── static/
    ├── style.css
    └── script.js

## Run on Windows

Open Command Prompt in this folder:

1. Create a virtual environment:
   `python -m venv venv`

2. Activate it:
   `venv\Scripts\activate`

3. Install Flask:
   `pip install -r requirements.txt`

4. Start the website:
   `python app.py`

5. Open:
   `http://127.0.0.1:5000`

## Database

The first time the application runs, it creates:

`ecocollect.db`

The table is:

`pickup_requests`

It stores:
- id
- name
- phone
- area
- pincode
- address
- items
- preferred_date
- notes
- volunteer
- status
- created_at

## View submitted responses

Open:

`http://127.0.0.1:5000/admin`

This displays all submitted pickup requests.

## Important

This is a local prototype. The database is stored on the computer running Flask. It is not yet a cloud database and the volunteer assignment is not automated.
