# Use Python 3.12 as base image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir poetry==1.8.3

ENV POETRY_NO_INTERACTION=1 \
    POETRY_VENV_IN_PROJECT=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache
COPY pyproject.toml poetry.lock poetry.toml ./
RUN poetry install --no-dev && rm -rf $POETRY_CACHE_DIR
COPY app/ ./app/
EXPOSE 8080

CMD ["poetry", "run", "uvicorn", "app.api.main:app", "--reload", "--host", "0.0.0.0", "--port", "8080"]
