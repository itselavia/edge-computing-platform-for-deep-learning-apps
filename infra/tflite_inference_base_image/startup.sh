#!/bin/sh

gsutil cp -r ${TFLITE_BUCKET}/${FOLDER_NAME} .
python3 inference.py