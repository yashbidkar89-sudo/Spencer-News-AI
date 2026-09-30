# SpencerNews AI — Complex Finance. Simplified.

<div align="center">
  <img src="public/spencernews-logo.png" alt="SpencerNews AI Logo" width="140" style="border-radius: 24px;" />
  <p><strong>Complex Finance. Simplified.</strong></p>
</div>

An AI-powered full-stack application that transforms complex financial news, Federal Reserve announcements, and earnings releases into concise, jargon-free explanations for everyday citizens, students, and retail investors.

Powered by **Groq's Llama 3.3 70B Versatile** model and **NewsAPI**.

---

## 1. Project Objective & Overview

Financial journalism and central bank statements are frequently written in dense, specialized language filled with acronyms and technical terms (e.g., *basis points*, *yield curve inversion*, *quantitative tightening*, *CPI*, *hyperscaler capex*). 

**Chris News AI** bridges this accessibility gap by:
1. Ingesting live financial news through **NewsAPI**.
2. Passing structured article text through **Groq's Llama 3.3 70B Versatile** model using a custom prompt constraint system.
3. Extracting:
   - **Simple Summary**: Plain-English headline overview.
   - **What Happened**: Concrete factual actions, numbers, and dates.
   - **Why It Matters**: Practical implications for everyday household budgets, mortgages, and portfolios.
   - **Key Takeaways**: High-impact bulleted metrics.
   - **Financial Jargon Decoded**: Clickable glossaries explaining difficult terms in one sentence.
4. Upholding a strict **zero-hallucination and non-financial advice standard**.

---

## 2. Technology Stack

### Backend
- **Python 3.10+ / FastAPI**: Modern, fast RESTful API with automated OpenAPI schema generation.
- **Uvicorn**: Asynchronous ASGI web server.
- **Pydantic v2**: Strict data validation and typing.
- **Groq SDK**: High-speed inference using Llama 3.3 70B Versatile.
- **NewsAPI**: Real-time business and market news retrieval.
- **Node.js & Express / Vite (Full-Stack Alternative)**: Parallel full-stack runtime with Vite middleware for live preview environments.

### Frontend & Authentication
- **Google Login & Firebase Auth**: Secure authentication via official Google OAuth popup (`signInWithPopup`).
- **Cloud Bookmarking**: Authenticated users can bookmark and sync simplified financial summaries in personal Firestore collections protected by Attribute-Based Access Control (`firestore.rules`).
- **Dark Mode First with Toggle**: Modern dark slate (`#090D16`) theme with an emerald clarity accent (`#10B981`) and light theme switcher with persistent local storage.
- **Universal Design Standards**: 3-zone top bar contract, zero-pill metadata discipline with unboxed typographic separators (`·`), and accessible WCAG AA contrast.
- **Dynamic Category Navigation**: All Markets, Fed & Rates, Stocks & Equities, Inflation & Economy, Tech & Capex.
- **Real-Time Search & Direct Text Simplifier**: Instant filter and custom text paste modal.

---

## 3. Folder Structure

```
project-root/
├── backend/
│   ├── __init__.py           # Package initializer
│   ├── main.py               # FastAPI application, routing, and middleware
│   ├── config.py             # Settings, environment validation, and security
│   ├── news_service.py       # NewsAPI integration, article validation, and fallback
│   ├── ai_service.py         # Groq Llama 3.3 70B prompt engineering and parsing
│   ├── models.py             # Pydantic data schemas
│   ├── requirements.txt      # Python dependencies
│   └── tests/
│       └── test_backend.py   # Unit & integration test suite
├── frontend/
│   ├── index.html            # Standalone Vanilla HTML5 entry point
│   ├── style.css             # Vanilla CSS3 with dark/light variables & design system
│   └── script.js             # Vanilla JS state manager and API client
├── src/                      # Interactive React 19 UI
│   ├── App.tsx               # Production-grade React dashboard with dark toggle & tabs
│   ├── index.css             # Tailwind v4 styles with optical compensations
│   └── main.tsx              # React DOM mounting
├── server.ts                 # Full-stack Node/Express entry point with Groq integration
├── .env.example              # Template for API keys and configuration
├── .gitignore                # Excludes secrets, logs, pycache, and node_modules
├── metadata.json             # Applet metadata and permissions
├── package.json              # Node.js dependencies and scripts
└── README.md                 # Complete documentation
```

---

## 4. Environment Variables Setup

Copy the example template to create your `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and provide your API keys:

```env
# NewsAPI Key: Obtain free at https://newsapi.org/
NEWS_API_KEY="your_newsapi_key_here"

# Groq API Key: Obtain free at https://console.groq.com/
GROQ_API_KEY="your_groq_api_key_here"

# AI Model for Groq (Default: llama-3.3-70b-versatile)
GROQ_MODEL="llama-3.3-70b-versatile"

# Optional server configuration
PORT=8000
HOST="0.0.0.0"
CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000"
```

> **Security Note:** Never commit `.env` to Git. The `.gitignore` file is pre-configured to exclude all `.env*` files except `.env.example`.

---

## 5. Running the Application

### Option A: Python FastAPI Backend + Standalone Frontend

1. **Install Python dependencies:**
   ```bash
   pip install -r backend/requirements.txt
   ```

2. **Start the FastAPI backend:**
   ```bash
   uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   Interactive Swagger documentation will be available at `http://localhost:8000/docs`.

3. **Serve the frontend:**
   Open `frontend/index.html` in any browser, or serve it using Python's built-in HTTP server:
   ```bash
   python3 -m http.server 3000 --directory frontend
   ```

### Option B: Node.js & React Full-Stack App (Current Preview)

1. **Install Node dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to interact with the dashboard.

---

## 6. REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` / `/api/health` | Service health check and credential status |
| `GET` | `/api/status` | Safe configuration status (no secrets leaked) |
| `GET` | `/api/news` | Ingests and simplifies news (`?category=...&q=...&limit=...`) |
| `GET` | `/api/fetch-and-simplify` | One-click fetch and Groq Llama 3.3 70B simplification |
| `POST` | `/api/simplify` | Simplifies arbitrary text provided by the user |

### Sample POST `/api/simplify` Payload
```json
{
  "title": "Fed announces 25 bps rate hike amid sticky core PCE",
  "content": "The Federal Reserve lifted interest rates by 25 basis points...",
  "source": "Financial Wire",
  "category": "Fed & Rates"
}
```

---

## 7. Testing Instructions

### Run Python Backend Tests
Run the standalone test suite (built on Python standard `unittest`):
```bash
python3 -m unittest backend/tests/test_backend.py
```

Tests include:
- Credential leak prevention (verifies no API keys are returned by `/status` or logs)
- Pydantic schema validation
- NewsAPI filtering (rejection of `[Removed]` articles and blank bodies)
- AI system prompt constraint validation
- Offline rule-based fallback verification (accurate term extraction for basis points, CPI, capex, etc.)
- Full end-to-end article simplification pipeline

### Run Frontend Linting & Build Verification
```bash
npm run lint
npm run build
```

---

## 8. Security & Vulnerability Analysis

A comprehensive audit was performed across all dependencies and implementation patterns:

1. **No Frontend Key Exposure:** All API requests to Groq and NewsAPI originate exclusively from server-side handlers (`backend/main.py` and `server.ts`). No secrets are bundled into client-side JS or accessible via dev tools.
2. **CORS Hardening:** Configured with explicit allowed origins (`CORS_ORIGINS`), with wildcard only enabled during local development.
3. **Prompt Injection Mitigation:** System instructions explicitly restrict Groq's output to valid JSON matching an enforced schema, with strict grounding that forbids hallucinating facts outside the provided text.
4. **Resilient Fallback Protection:** If upstream APIs encounter rate limits, outages, or missing keys, the application does not crash. It displays high-fidelity educational data with clear advisory banners.

---

## 9. Legal Disclaimer

**Not Financial Advice:** Chris News AI is strictly an educational tool designed to foster financial literacy by simplifying publicly available journalism. It does not provide personalized investment advice, tax counseling, fiduciary services, or recommendations to purchase, sell, or hold any security, commodity, cryptocurrency, or derivative.
