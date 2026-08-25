from flask import Flask, render_template, request, jsonify
import sqlite3
from pathlib import Path

app = Flask(__name__)
DB_PATH = Path(__file__).with_name("ecocollect.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS pickup_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            area TEXT NOT NULL,
            pincode TEXT NOT NULL,
            address TEXT NOT NULL,
            items TEXT NOT NULL,
            preferred_date TEXT,
            notes TEXT,
            volunteer TEXT,
            status TEXT DEFAULT 'Requested',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

@app.route("/")
def home():
    return render_template("index.html")

@app.post("/api/requests")
def create_request():
    data = request.get_json(silent=True) or request.form

    required = ["name", "phone", "area", "pincode", "address", "items"]
    if any(not str(data.get(field, "")).strip() for field in required):
        return jsonify({"success": False, "message": "Please fill all required fields."}), 400

    conn = get_db()
    cursor = conn.execute("""
        INSERT INTO pickup_requests
        (name, phone, area, pincode, address, items, preferred_date, notes, volunteer)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["name"].strip(),
        data["phone"].strip(),
        data["area"].strip(),
        data["pincode"].strip(),
        data["address"].strip(),
        data["items"].strip(),
        str(data.get("preferredDate", "")).strip(),
        str(data.get("notes", "")).strip(),
        "Coordinator will assign a volunteer"
    ))
    conn.commit()
    request_id = cursor.lastrowid
    conn.close()

    return jsonify({
        "success": True,
        "id": request_id,
        "message": f"Pickup request #{request_id} saved successfully."
    })

@app.get("/api/requests")
def list_requests():
    conn = get_db()
    rows = conn.execute("""
        SELECT id, name, phone, area, pincode, address, items,
               preferred_date, notes, volunteer, status, created_at
        FROM pickup_requests
        ORDER BY id DESC
    """).fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.get("/admin")
def admin():
    conn = get_db()
    rows = conn.execute("SELECT * FROM pickup_requests ORDER BY id DESC").fetchall()
    conn.close()
    return render_template("admin.html", requests=rows)

if __name__ == "__main__":
    init_db()
    app.run(debug=True)
