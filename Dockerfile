FROM python:3.11-slim
WORKDIR /app

COPY automation /app/automation
COPY samples /app/samples

RUN python3 -m pip install --no-cache-dir --upgrade pip
RUN python3 -m pip install --no-cache-dir -r /app/automation/requirements.txt

# Default command: run the API
CMD ["python3", "/app/automation/api.py"]
