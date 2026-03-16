FROM python:3.14

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

COPY ./main.py /app/main.py
COPY ./gunicorn_conf.py /app/gunicorn_conf.py

CMD ["gunicorn", "--conf", "gunicorn_conf.py", "--bind", "0.0.0.0:8080", "main:app"]
