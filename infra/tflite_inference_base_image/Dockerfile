FROM python:3.8

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN apt-get -y update && apt-get install -y wget ffmpeg libsm6 libxext6 && pip3 install --no-cache-dir -r requirements.txt

COPY startup.sh ./
RUN chmod +x startup.sh

RUN curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-333.0.0-linux-x86_64.tar.gz && \
tar -xzf google-cloud-sdk-333.0.0-linux-x86_64.tar.gz && \
rm -f google-cloud-sdk-333.0.0-linux-x86_64.tar.gz && \
./google-cloud-sdk/install.sh --quiet --path-update true

ENTRYPOINT [ "sh", "./startup.sh" ]