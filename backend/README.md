# Site-416 Banking Backend

## Setup

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
set ALLOWED_ORIGINS=http://localhost:3000
set DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.amcodmqzewbzkfhegztv.supabase.co:5432/postgres
set JWT_SECRET=change-me
python init_db.py
uvicorn main:app --reload --port 8000
```

## Demo credentials

- player: `demo` / `demo123`
- faction: `faction` / `faction123`
- admin: `admin` / `admin123`

The API will be available at `http://localhost:8000`.

### Environment variables

- `ALLOWED_ORIGINS`: Comma-separated list of allowed frontend origins (e.g. `http://localhost:3000,https://your-app.vercel.app`).
- `DATABASE_URL`: Postgres connection string.
- `JWT_SECRET`: Secret key for signing JWT tokens.
