FROM tensorflow/tensorflow:2.4.0

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

COPY startup.sh ./
RUN chmod +x startup.sh

RUN curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-333.0.0-linux-x86_64.tar.gz && \
tar -xzf google-cloud-sdk-333.0.0-linux-x86_64.tar.gz && \
rm -f google-cloud-sdk-333.0.0-linux-x86_64.tar.gz && \
./google-cloud-sdk/install.sh --quiet --path-update true

ENTRYPOINT [ "sh", "./startup.sh" ]