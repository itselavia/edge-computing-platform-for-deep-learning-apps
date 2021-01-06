import tensorflow as tf
from google.cloud import storage
from flask import abort
import os
from pathlib import Path

def model_converter(request):

  saved_model_dir_gcs = ""
  saved_model_dir_local = "/tmp"

  if request.method == 'POST':
    request_json = request.get_json(silent=True)

    if request_json and 'saved_model_dir_gcs' in request_json:
      saved_model_dir_gcs = request_json['saved_model_dir_gcs']

    # Downloading the SavedModel
    storage_client = storage.Client()
    source_bucket = os.getenv('SOURCE_BUCKET')
    destination_bucket = os.getenv('DESTINATION_BUCKET')

    tf_source_bucket = storage_client.bucket(source_bucket)
    tflite_destination_bucket = storage_client.bucket(destination_bucket)

    blobs = tf_source_bucket.list_blobs(prefix=saved_model_dir_gcs)  # Get list of files
    for blob in blobs:
      file_split = blob.name.split("/")
      directory = "/".join(file_split[0:-1])
      Path("/tmp/" + directory).mkdir(parents=True, exist_ok=True)
      blob.download_to_filename("/tmp/" + blob.name)

    # Convert the model
    converter = tf.lite.TFLiteConverter.from_saved_model("/tmp/" + saved_model_dir_gcs) # path to the SavedModel directory
    tflite_model = converter.convert()

    # Save the model.
    with open(saved_model_dir_local + '/model.tflite', 'wb') as f:
      f.write(tflite_model)

    tflite_blob = tflite_destination_bucket.blob(saved_model_dir_gcs + "/model.tflite")

    tflite_blob.upload_from_filename(saved_model_dir_local + '/model.tflite')
  else:
      return abort(405)