FROM python:3.8

WORKDIR /usr/src/app

COPY requirements.txt startup.sh ./
RUN pip3 install --no-cache-dir -r requirements.txt && chmod +x startup.sh

ENTRYPOINT [ "sh", "./startup.sh" ]