FROM python:3.8

RUN pip install pipenv \
    && pip install google.cloud.storage

WORKDIR /app

COPY . /app

RUN pipenv install --system

EXPOSE 5000

ENTRYPOINT ["python3"]
CMD ["main_service.py"]