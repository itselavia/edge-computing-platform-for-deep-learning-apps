"""
link followed:
                https://www.tensorflow.org/lite/guide/inference
                https://towardsdatascience.com/how-to-download-an-image-using-python-38a75cfa21c
                https://stackoverflow.com/questions/59143641/how-to-get-useful-data-from-tflite-object-detection-python
                
"""

import tensorflow as tf
import cv2
import requests
import shutil
import argparse
import numpy as np
import os
import time

from flask import Flask, request, flash, redirect, url_for
from flask import jsonify, json
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

app = Flask(__name__)


@app.route("/")
def index():
    return "Home"


@app.after_request
def after_request(response):
    addr = "http://"
    addr += str(os.environ.get('FRONT_END_ADDRESS', 'localhost'))
    if (str(os.environ.get('FRONT_END_ADDRESS', 'localhost')) == 'localhost'):
        addr += ":3001"
    else:
        addr += ":30001"
    response.headers.add('Access-Control-Allow-Origin', addr)
    response.headers.add('Access-Control-Allow-Headers',
                         'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods',
                         'GET,PUT,POST,DELETE,OPTIONS,HEAD')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response


@app.route("/getResults")
def getResults():
    start_time = time.time()
    image_url = request.args.get('image_url')
    filename = download_image(image_url)
    objects = inference(filename)
    print("Via URL --- %s seconds ---" % (time.time() - start_time))
    return json.dumps(objects), 200


@app.route("/uploadImage", methods=['POST'])
def uploadImage():
    start_time = time.time()
    if 'file' not in request.files:
        flash('No file part')
        return redirect(request.url)
    file = request.files['file']
    # if user does not select file, browser also
    # submit an empty part without filename
    if file.filename == '':
        flash('No selected file')
        return redirect(request.url)
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(filename)
        objects = inference(filename)
        print("Via Image --- %s seconds ---" % (time.time() - start_time))
        return json.dumps(objects), 200


@app.route("/checkGPUsupport")
def gpu_support_check():
    gups = tf.config.list_physical_devices('GPU')
    if (len(gups) > 0):
        return "True", 200
    else:
<<<<<<< Updated upstream
        return "False", 200


LABELS_DICT = {
    -1: '???',
    0: 'person',
    1: 'bicycle',
    2: 'car',
    3: 'motorcycle',
    4: 'airplane',
    5: 'bus',
    6: 'train',
    7: 'truck',
    8: 'boat',
    9: 'traffic',
    10: 'fire',
    11: '???',
    12: 'stop',
    13: 'parking',
    14: 'bench',
    15: 'bird',
    16: 'cat',
    17: 'dog',
    18: 'horse',
    19: 'sheep',
    20: 'cow',
    21: 'elephant',
    22: 'bear',
    23: 'zebra',
    24: 'giraffe',
    25: '???',
    26: 'backpack',
    27: 'umbrella',
    28: '???',
    29: '???',
    30: 'handbag',
    31: 'tie',
    32: 'suitcase',
    33: 'frisbee',
    34: 'skis',
    35: 'snowboard',
    36: 'sports',
    37: 'kite',
    38: 'baseball',
    39: 'baseball',
    40: 'skateboard',
    41: 'surfboard',
    42: 'tennis',
    43: 'bottle',
    44: '???',
    45: 'wine',
    46: 'cup',
    47: 'fork',
    48: 'knife',
    49: 'spoon',
    50: 'bowl',
    51: 'banana',
    52: 'apple',
    53: 'sandwich',
    54: 'orange',
    55: 'broccoli',
    56: 'carrot',
    57: 'hot',
    58: 'pizza',
    59: 'donut',
    60: 'cake',
    61: 'chair',
    62: 'couch',
    63: 'potted',
    64: 'bed',
    65: '???',
    66: 'dining',
    67: '???',
    68: '???',
    69: 'toilet',
    70: '???',
    71: 'tv',
    72: 'laptop',
    73: 'mouse',
    74: 'remote',
    75: 'keyboard',
    76: 'cell',
    77: 'microwave',
    78: 'oven',
    79: 'toaster',
    80: 'sink',
    81: 'refrigerator',
    82: '???',
    83: 'book',
    84: 'clock',
    85: 'vase',
    86: 'scissors',
    87: 'teddy',
    88: 'hair',
    89: 'toothbrush'
}

TFLITE_FILE_PATH = "model.tflite"


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def download_image(url: str):
=======
        return "False" , 200





LABELS_DICT = {-1: '???',
 0: 'person',
 1: 'bicycle',
 2: 'car',
 3: 'motorcycle',
 4: 'airplane',
 5: 'bus',
 6: 'train',
 7: 'truck',
 8: 'boat',
 9: 'traffic',
 10: 'fire',
 11: '???',
 12: 'stop',
 13: 'parking',
 14: 'bench',
 15: 'bird',
 16: 'cat',
 17: 'dog',
 18: 'horse',
 19: 'sheep',
 20: 'cow',
 21: 'elephant',
 22: 'bear',
 23: 'zebra',
 24: 'giraffe',
 25: '???',
 26: 'backpack',
 27: 'umbrella',
 28: '???',
 29: '???',
 30: 'handbag',
 31: 'tie',
 32: 'suitcase',
 33: 'frisbee',
 34: 'skis',
 35: 'snowboard',
 36: 'sports',
 37: 'kite',
 38: 'baseball',
 39: 'baseball',
 40: 'skateboard',
 41: 'surfboard',
 42: 'tennis',
 43: 'bottle',
 44: '???',
 45: 'wine',
 46: 'cup',
 47: 'fork',
 48: 'knife',
 49: 'spoon',
 50: 'bowl',
 51: 'banana',
 52: 'apple',
 53: 'sandwich',
 54: 'orange',
 55: 'broccoli',
 56: 'carrot',
 57: 'hot',
 58: 'pizza',
 59: 'donut',
 60: 'cake',
 61: 'chair',
 62: 'couch',
 63: 'potted',
 64: 'bed',
 65: '???',
 66: 'dining',
 67: '???',
 68: '???',
 69: 'toilet',
 70: '???',
 71: 'tv',
 72: 'laptop',
 73: 'mouse',
 74: 'remote',
 75: 'keyboard',
 76: 'cell',
 77: 'microwave',
 78: 'oven',
 79: 'toaster',
 80: 'sink',
 81: 'refrigerator',
 82: '???',
 83: 'book',
 84: 'clock',
 85: 'vase',
 86: 'scissors',
 87: 'teddy',
 88: 'hair',
 89: 'toothbrush'}

TFLITE_FILE_PATH ="../model.tflite"

def download_image(url:str):
>>>>>>> Stashed changes
    filename = url.split("/")[-1]
    # Open the url image, set stream to True, this will return the stream content.
    r = requests.get(url, stream=True)

    # Check if the image was retrieved successfully
    if r.status_code == 200:
        # Set decode_content value to True, otherwise the downloaded image file's size will be zero.
        r.raw.decode_content = True

        # Open a local file with wb ( write binary ) permission.
        with open(filename, 'wb') as f:
            shutil.copyfileobj(r.raw, f)
        print('Image sucessfully Downloaded: ')
        return filename
    else:
        print('Image Couldn\'t be retreived')
        # !!!exception handeling


def inference(filename):
    interpreter = tf.lite.Interpreter(TFLITE_FILE_PATH)
    interpreter.allocate_tensors()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    input_shape = input_details[0]['shape']
    im = cv2.imread(filename)
    im_rgb = cv2.cvtColor(im, cv2.COLOR_BGR2RGB)
    im_rgb = cv2.resize(im_rgb, (input_shape[1], input_shape[2]))
    input_data = np.expand_dims(im_rgb, axis=0)
    interpreter.set_tensor(input_details[0]['index'], input_data)
    interpreter.invoke()
    output_data = interpreter.get_tensor(output_details[0]['index'])
    detection_boxes = interpreter.get_tensor(output_details[0]['index'])
    detection_classes = interpreter.get_tensor(output_details[1]['index'])
    detection_scores = interpreter.get_tensor(output_details[2]['index'])
    num_boxes = interpreter.get_tensor(output_details[3]['index'])
    object_number = 1
    objects = []
    print("Finding objects in image....")
    for i in range(int(num_boxes[0])):
        if detection_scores[0, i] > .5:
            class_id = detection_classes[0, i]
            object = LABELS_DICT.get(class_id)
            print("Object " + str(object_number) + " is detected as " + object)
            objects.append(object)
            object_number = object_number + 1
    os.remove(filename)
    return objects


def unit_test():
    url1 = "https://static.toiimg.com/photo/msid-72295960/72295960.jpg?545889"
    url2 = "https://www.dmarge.com/wp-content/uploads/2021/01/dwayne-the-rock-.jpg"
    url3 = "https://cdn.shopify.com/s/files/1/1245/1481/products/2_DIAMOND_BLACK_1_1024x1024.jpg?v=1597774901"
    print("\n")
    print("Unit test 1 running...")
    inference(url1)
    print("\n")
    print("unit test 2 running...")
    inference(url2)
    print("\n")
    print("unit test 3 running...")
    inference(url3)
    print("\n")


def main():
    parser = argparse.ArgumentParser(
        formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument('--url', help='Image URL', required=False)
    args = parser.parse_args()
    if args.url is not None:
        inference(args.url)
    else:
        unit_test()

    # loading model
    #if(len(vars(args)) == 1):
    #    print("running unit tests")
    #    unit_test()
    #else:
    #


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
