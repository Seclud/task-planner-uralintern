FROM python:3.12

WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir -r requirements.txt

ENV PYTHONPATH=/app

RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]