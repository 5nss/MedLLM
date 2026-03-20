import sqlite3

db_path = "medical_intake.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE assessments ADD COLUMN speaker_roles_json TEXT")
    conn.commit()
    print("Successfully added speaker_roles_json column to assessments table.")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e).lower():
        print("Column already exists.")
    else:
        print(f"Error: {e}")
finally:
    conn.close()
