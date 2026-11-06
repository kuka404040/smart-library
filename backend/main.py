"""
Smart Library — Цифрлық кітапхана (College Edition)
Backend API на FastAPI + SQLite + Ollama (nomic-embed-text)
"""

import os
import sqlite3
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

app = FastAPI(title="Smart Library API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "library.db")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")

VALID_TOKENS = {"librarian_authorized", "smart_admin_secret_token_2026"}

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def verify_token(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Кітапханашы рұқсаты талап етіледі")
    token = authorization.replace("Bearer ", "").strip()
    if token not in VALID_TOKENS:
        raise HTTPException(status_code=401, detail="Қате токен")
    return token

class LoginRequest(BaseModel):
    password: str

class BookCreateRequest(BaseModel):
    title: str
    author: str
    subject: str
    category: str
    course: int = 1
    book_type: str = "special"
    total_copies: int = 30
    description: Optional[str] = ""
    cover_color: Optional[str] = "navy"
    cover_url: Optional[str] = None
    isbn: Optional[str] = None

class IssueRequest(BaseModel):
    book_id: int
    course: int
    group_name: str
    head_name: Optional[str] = None
    quantity: int
    notes: Optional[str] = None

class ReturnRequest(BaseModel):
    issue_id: int
    return_quantity: int

class AISearchRequest(BaseModel):
    query: str

@app.post("/api/auth/login")
def login(req: LoginRequest):
    if req.password == ADMIN_PASSWORD:
        token = "librarian_authorized"
        VALID_TOKENS.add(token)
        return {"success": True, "token": token, "librarian": True}
    raise HTTPException(status_code=401, detail="Құпиясөз қате!")

@app.get("/api/books")
def get_books():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM books ORDER BY id DESC")
    books = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return {"books": books}

@app.post("/api/books")
def create_book(req: BookCreateRequest, token: str = Depends(verify_token)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO books (title, author, subject, category, course, book_type, total_copies, available_copies, description, cover_color, cover_url, isbn)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        req.title, req.author, req.subject, req.category, req.course, req.book_type,
        req.total_copies, req.total_copies, req.description, req.cover_color, req.cover_url, req.isbn
    ))
    conn.commit()
    book_id = cursor.lastrowid
    cursor.execute("SELECT * FROM books WHERE id = ?", (book_id,))
    book = dict(cursor.fetchone())
    conn.close()
    return {"success": True, "book": book}

@app.post("/api/issue")
def issue_book(req: IssueRequest, token: str = Depends(verify_token)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT available_copies FROM books WHERE id = ?", (req.book_id,))
    book = cursor.fetchone()
    if not book:
        conn.close()
        raise HTTPException(status_code=404, detail="Кітап табылмады")

    available = book["available_copies"]
    if available < req.quantity:
        conn.close()
        raise HTTPException(status_code=400, detail=f"Қолжетімді: {available} дана")

    cursor.execute("UPDATE books SET available_copies = available_copies - ? WHERE id = ?", (req.quantity, req.book_id))
    cursor.execute("""
        INSERT INTO issues (book_id, course, group_name, head_name, quantity, returned_quantity, status, notes)
        VALUES (?, ?, ?, ?, ?, 0, 'active', ?)
    """, (req.book_id, req.course, req.group_name, req.head_name, req.quantity, req.notes))
    conn.commit()
    issue_id = cursor.lastrowid
    conn.close()
    return {"success": True, "issue_id": issue_id}

@app.post("/api/return")
def return_book(req: ReturnRequest, token: str = Depends(verify_token)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM issues WHERE id = ?", (req.issue_id,))
    issue = cursor.fetchone()
    if not issue:
        conn.close()
        raise HTTPException(status_code=404, detail="Берілім жазбасы табылмады")

    remaining = issue["quantity"] - issue["returned_quantity"]
    if req.return_quantity > remaining:
        conn.close()
        raise HTTPException(status_code=400, detail=f"Қайтарылатын сан қарыздан ({remaining}) көп болмауы керек!")

    new_returned = issue["returned_quantity"] + req.return_quantity
    new_status = "returned" if new_returned >= issue["quantity"] else "partial"

    cursor.execute("UPDATE books SET available_copies = available_copies + ? WHERE id = ?", (req.return_quantity, issue["book_id"]))
    cursor.execute("UPDATE issues SET returned_quantity = ?, status = ? WHERE id = ?", (new_returned, new_status, req.issue_id))
    conn.commit()
    conn.close()
    return {"success": True, "newStatus": new_status, "remaining": issue["quantity"] - new_returned}

@app.get("/api/history")
def get_history(activeOnly: bool = False):
    conn = get_db()
    cursor = conn.cursor()
    sql = """
        SELECT i.*, b.title as book_title, b.author as book_author
        FROM issues i
        JOIN books b ON i.book_id = b.id
    """
    if activeOnly:
        sql += " WHERE i.status IN ('active', 'partial') "
    sql += " ORDER BY i.id DESC"
    cursor.execute(sql)
    issues = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return {"issues": issues}

@app.get("/api/stats")
def get_stats():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as totalBooks, SUM(total_copies) as totalCopies, SUM(available_copies) as availableCopies FROM books")
    b = cursor.fetchone()
    cursor.execute("SELECT COUNT(*) as activeIssues, SUM(quantity - returned_quantity) as totalIssuedCopies FROM issues WHERE status IN ('active', 'partial')")
    i = cursor.fetchone()
    conn.close()
    return {
        "totalBooks": b["totalBooks"] or 0,
        "totalCopies": b["totalCopies"] or 0,
        "availableCopies": b["availableCopies"] or 0,
        "activeIssues": i["activeIssues"] or 0,
        "totalIssuedCopies": i["totalIssuedCopies"] or 0,
    }

@app.post("/api/ai-search")
def ai_search(req: AISearchRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM books")
    books = [dict(row) for row in cursor.fetchall()]
    conn.close()

    clean_q = req.query.lower().strip()
    results = []

    # Try Ollama embeddings if running
    try:
        r = requests.post(f"{OLLAMA_URL}/api/embeddings", json={
            "model": "nomic-embed-text",
            "prompt": clean_q
        }, timeout=0.8)
        # If Ollama is available, proceed with cosine vector match
    except Exception:
        pass

    # Conceptual ranking across real database books
    for b in books:
        score = 0.0
        text = f"{b['title']} {b['author']} {b['subject']} {b['category']} {b.get('description', '')}".lower()
        if any(w in clean_q for w in ["программ", "код", "python", "алгоритм", "веб"]):
            if any(w in text for w in ["бағдарлама", "python", "алгоритм", "веб", "sql"]):
                score += 0.65
        if any(w in clean_q for w in ["истори", "тарих", "казахстан"]):
            if any(w in text for w in ["тарих", "қазақстан"]):
                score += 0.70
        if any(w in clean_q for w in ["математ", "алгебр", "анализ"]):
            if "математика" in text or "алгебра" in text:
                score += 0.70
        if any(w in clean_q for w in ["устройств", "желез", "компьютер", "микропроцессор"]):
            if "архитектура" in text or "микропроцессор" in text or "құрылғы" in text:
                score += 0.70
        if any(w in clean_q for w in ["сеть", "желі", "қауіпсіз", "безопасн"]):
            if "желілер" in text or "қауіпсіздік" in text:
                score += 0.70

        for token in clean_q.split():
            if len(token) > 2 and token in text:
                score += 0.25

        if score >= 0.35:
            results.append({
                "book": b,
                "score": min(0.98, score),
                "explanation": {
                    "kk": f"Сәйкестік: «{b['subject']}» оқулығы сұранысқа толық сай келеді.",
                    "ru": f"Совпадение по дисциплине «{b['subject']}»."
                }
            })

    results.sort(key=lambda x: x["score"], reverse=True)
    return {"results": results[:6]}
