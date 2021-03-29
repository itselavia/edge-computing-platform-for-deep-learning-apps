#!/bin/sh
gcloud auth activate-service-account --key-file=/etc/credentials/cloudsql-oauth-credentials.json
gsutil cp ${TFLITE_BUCKET}/${USER_NAME}/${PROJECT_NAME}/model.tflite .
gsutil cp ${TFLITE_BUCKET}/${USER_NAME}/${PROJECT_NAME}/inference.py .
python3 inference.py