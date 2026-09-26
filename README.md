# Secure Telecom Engineering Assistant

A portfolio prototype for controlled engineering support. It demonstrates a small retrieval workflow, role-based access, human approval before a report is approved, audit records, and a compact evaluation view.

## What is included

- `app/`: React and TypeScript workspace UI using seeded demo data.
- `backend/`: FastAPI demo service with role checks, reports, audit events, and tests.
- `backend/main.py`: Uses an `X-Demo-Role` header only for learning. It is not production authentication.

## Run the interface

```bash
npm install
npm run dev
```

Open the local address shown in the terminal (normally `http://localhost:5173`).

## Run the local API

```bash
cd backend
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Test the local API

```bash
cd backend
pytest
```

## Next improvements

1. Replace the sample documents with a versioned public telecom corpus.
2. Add JWT authentication, password hashing, and persistent storage.
3. Connect the user interface to the FastAPI service.
4. Add a documented retrieval pipeline and run a repeatable evaluation set.
