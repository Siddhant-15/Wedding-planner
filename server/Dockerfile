FROM python:3.12-slim

ARG CACHE_BUST=1

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY server/requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY server/ .

# ==========================
# DEBUG INFORMATION
# ==========================

RUN echo "===== Current Directory =====" && pwd

RUN echo "===== /app =====" && ls -la /app

RUN echo "===== /app/app =====" && ls -la /app/app

RUN echo "===== Directory Tree =====" && \
    find /app/app -maxdepth 2 -type d

RUN echo "===== Files =====" && \
    find /app/app -maxdepth 2 -type f

RUN echo "===== Python Path =====" && \
    python -c "import sys; print(sys.path)"

RUN echo "===== Import app =====" && \
    python -c "import app; print(app.__file__)"

RUN echo "===== Import app.db =====" && \
    python -c "import app.db; print(app.db.__file__)"

RUN echo "===== Import app.db.db =====" && \
    python -c "from app.db.db import startup_db; print('SUCCESS')"

# ==========================

EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]