#!/bin/sh

set -x
exec > >(tee /var/log/user-data.log|logger -t user-data ) 2>&1
./google-cloud-sdk/bin/gcloud auth activate-service-account --key-file=/etc/credentials/cloudsql-oauth-credentials.json
gsutil cp ${TFLITE_BUCKET}/${PROJECT_NAME}/modelfile/model.tflite .
gsutil cp ${TFLITE_BUCKET}/${PROJECT_NAME}/inferencefile/inference.py .
python3 inference.py
sleep infinity