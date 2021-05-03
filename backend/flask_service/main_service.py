from flask import Flask, request
from flask_mysqldb import MySQL
from google.cloud import storage
import jwt
import hashlib
import datetime
from flask import jsonify, json
import os
import time
import requests

app = Flask(__name__)

app.config['MYSQL_USER'] = os.environ.get('MYSQL_USER', 'platform')
app.config['MYSQL_PASSWORD'] = os.environ.get('MYSQL_PASSWORD',
                                              'EdgePlatform#Pass_999')
app.config['MYSQL_HOST'] = os.environ.get('MYSQL_HOST', '35.236.202.116')
app.config['MYSQL_DB'] = os.environ.get('MYSQL_DB', 'final_project_db')
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

# os.environ['MODEL_MANAGER_SERVICE_HOST'] = '35.235.110.141'
# os.environ['MODEL_MANAGER_SERVICE_PORT'] = '32000'

mysql = MySQL(app)


@app.route("/")
def index():
    return "Home"


@app.after_request
def after_request(response):
    addr = "http://"
    addr += str(os.environ.get('MODEL_MANAGER_SERVICE_HOST', 'localhost'))
    addr += ":3001"
    response.headers.add('Access-Control-Allow-Origin', addr)
    response.headers.add('Access-Control-Allow-Headers',
                         'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods',
                         'GET,PUT,POST,DELETE,OPTIONS,HEAD')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response


@app.route("/newUser", methods=['POST'])
def newUser():
    reqData = request.json
    # print(reqData)
    name = reqData['name']
    email = reqData['email']
    phone = reqData['phone']
    cur = mysql.connection.cursor()
    # Checking if the user already exists
    userExists = cur.execute("SELECT name FROM user WHERE email_id=%s",
                             (email, ))
    if (userExists == 0):
        URL = "http://"
        URL += str(os.environ.get('MODEL_MANAGER_SERVICE_HOST', ''))
        URL += ":32000"
        # URL += str(os.environ.get('MODEL_MANAGER_PORT', '32000'))
        URL += "/createUser"
        print(URL)

        PARAMS = {'email': email}
        try:
            r = requests.post(url=URL, params=PARAMS)
        except requests.exceptions.RequestException as e:
            return "Could not connect to the model manager", 401

        if r.status_code == 200:
            cur.execute("INSERT INTO user VALUES (%s,%s,%s,'user')",
                        (name, email, phone))
            mysql.connection.commit()
            return "Created", 201
        else:
            return "Could not create user on the model manager", 401

    else:
        return "User Already Exists", 409


@app.route("/login", methods=['POST'])
def login():
    reqData = request.json
    user_email = reqData['email']
    cur = mysql.connection.cursor()

    # Checking if the user exists
    userExists = cur.execute("SELECT name FROM user WHERE email_id=%s",
                             (user_email, ))
    if (userExists == 0):

        #return "User Doesn't Exist", 401
        token = jwt.encode({
            'userExists': False,
            'email': user_email
        }, 'top-secret-phrase')
        return jsonify({'token': token}), 201

    else:
        token = jwt.encode({
            'userExists': True,
            'email': user_email
        }, 'top-secret-phrase')
        return jsonify({'token': token}), 201


@app.route("/newProject", methods=['POST'])
def newProject():
    reqData = request.json
    proj_name = reqData['project_name']
    proj_desc = reqData['project_desc']
    user_email = reqData['user_email']
    proj_id = hashlib.md5(proj_name.encode('utf-8')).hexdigest()
    cur = mysql.connection.cursor()

    # Checking if the user exists
    userExists = cur.execute("SELECT name FROM user WHERE email_id=%s",
                             (user_email, ))
    if (userExists == 0):
        return "User Doesn't Exist", 401

    # Checking if the project name already exists
    projExists = cur.execute(
        "SELECT project_name FROM projects WHERE project_id=%s", (proj_id, ))
    if (projExists == 0):
        # Adding a new project to the project table
        cur.execute("INSERT INTO projects VALUES (%s,%s,%s,%s)",
                    (proj_name, proj_id, proj_desc, user_email))

        # Allocating project to the current user
        cur.execute("INSERT INTO user_projects VALUES (%s,%s)",
                    (user_email, proj_id))

        mysql.connection.commit()
        return jsonify({'ID': proj_id}), 201

    else:
        return "Project Name Already Exists", 409


@app.route("/projects")
def listProjects():
    user_email = request.args.get('email')
    cur = mysql.connection.cursor()

    num_projects = cur.execute(
        "SELECT project_id FROM user_projects WHERE email_id=%s",
        (user_email, ))

    if (num_projects == 0):
        return json.loads('{}'), 200  #No Projects exist

    project_IDs = []
    for project in cur.fetchall():
        project_IDs.append(project['project_id'])

    sql = 'SELECT project_name, project_id, project_desc, owner_email FROM projects WHERE project_id IN (%s)'
    in_p = ', '.join(list(map(lambda x: '%s', project_IDs)))
    sql = sql % in_p
    cur.execute(sql, project_IDs)
    project_list = []
    
    for row in cur.fetchall():
        temp = {}
        temp["project_id"] = row['project_id']
        temp["project_name"] = row['project_name']
        temp["project_desc"] = row['project_desc']
        temp["owner_email"] = row['owner_email']
        project_list.append(temp)
    return json.dumps(project_list), 200


@app.route("/addProjectUser", methods=['POST'])
def addProjectUser():
    reqData = request.json
    user_email = reqData['user_email']
    project_id = reqData['project_id']

    cur = mysql.connection.cursor()

    # Checking if the user exists
    userExists = cur.execute("SELECT name FROM user WHERE email_id=%s",
                             (user_email, ))
    if (userExists == 0):
        return "User Doesn't Exist", 401

    # Checking if the project exists
    projExists = cur.execute(
        "SELECT project_name FROM projects WHERE project_id=%s",
        (project_id, ))
    if (projExists > 0):

        #checking if allocation already exists
        num_rows = cur.execute(
            "SELECT project_id FROM user_projects WHERE email_id=%s AND project_id=%s",
            (
                user_email,
                project_id,
            ))
        if (num_rows == 0):
            # Allocating project to the user
            cur.execute("INSERT INTO user_projects VALUES (%s,%s)",
                        (user_email, project_id))
            mysql.connection.commit()

        else:
            return "User is Already Allocated to this project", 409
        return "Done", 201

    else:
        return "Project Does not exist", 403


@app.route("/projectUsers")
def projectUsers():
    project_id = request.args.get('project_id')
    cur = mysql.connection.cursor()

    num_users = cur.execute(
        "SELECT email_id FROM user_projects WHERE project_id=%s",
        (project_id, ))

    if (num_users == 0):
        return json.loads('{}'), 200  #No Users for this project

    user_emails = []
    for row in cur.fetchall():
        user_emails.append(row['email_id'])

    sql = 'SELECT * FROM user WHERE email_id IN (%s)'
    in_p = ', '.join(list(map(lambda x: '%s', user_emails)))
    sql = sql % in_p
    cur.execute(sql, user_emails)

    user_list = {}
    for user in cur.fetchall():
        user_list[user['email_id']] = user['name']

    return json.dumps(user_list), 200


@app.route("/project", methods=['GET', 'DELETE'])
def getOrDeleteProject():
    project_id = request.args.get('project_id')
    cur = mysql.connection.cursor()
    projExists = cur.execute("SELECT * FROM projects WHERE project_id=%s",
                             (project_id, ))
    if (projExists == 0):
        return "Project Does not exist", 403

    if request.method == 'GET':
        project_details = {}
        for row in cur.fetchall():
            project_details['project_name'] = row['project_name']
            project_details['project_id'] = row['project_id']
            project_details['project_desc'] = row['project_desc']
            project_details['owner_email'] = row['owner_email']
        return json.dumps(project_details), 201

    elif request.method == 'DELETE':
        cur.execute("DELETE FROM projects WHERE project_id=%s", (project_id, ))

        cur.execute("DELETE FROM user_projects WHERE project_id=%s",
                    (project_id, ))

        mysql.connection.commit()
        return 'Deleted', 204


@app.route("/project/uploadModel", methods=['POST'])
def uploadModel():
    os.environ[
        'GOOGLE_APPLICATION_CREDENTIALS'] = 'credentials/credentials.json'
    username = request.form["username"]
    projectname = request.form["projectname"]
    source_file_name = request.files["modelfile"].filename
    request.files["modelfile"].save("models/" + source_file_name)
    storage_client = storage.Client()
    #bucket_name = os.environ.get('TF_BUCKET_NAME', 'edgecomputing-310003-tf-saved-models')
    bucket_name = os.environ.get('TF_BUCKET_NAME',
                                 'sjsu295b-tf-saved-models')
    bucket = storage_client.bucket(bucket_name)
    destination_blob_name = projectname + "/modelfile/" + source_file_name
    blobs = bucket.list_blobs(prefix=projectname + "/modelfile/")
    for blob in blobs:
        blob.delete()
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_filename("models/" + source_file_name)
    print("File {} uploaded to {}.".format(source_file_name,
                                           destination_blob_name))
    os.remove("models/" + source_file_name)
    time.sleep(5)
    return "Model uploaded", 201


@app.route("/project/uploadInference", methods=['POST'])
def uploadInference():
    os.environ[
        'GOOGLE_APPLICATION_CREDENTIALS'] = 'credentials/credentials.json'
    username = request.form["username"]
    projectname = request.form["projectname"]
    source_file_name = request.files["inferencefile"].filename
    request.files["inferencefile"].save("inferencefiles/" + source_file_name)
    storage_client = storage.Client()
    #bucket_name = os.environ.get('TF_BUCKET_NAME', 'edgecomputing-310003-tf-saved-models')
    bucket_name = os.environ.get('TF_BUCKET_NAME',
                                 'sjsu295b-tf-saved-models')
    bucket = storage_client.bucket(bucket_name)
    destination_blob_name = projectname + "/inferencefile/" + source_file_name
    blobs = bucket.list_blobs(prefix=projectname + "/inferencefile/")
    for blob in blobs:
        blob.delete()
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_filename("inferencefiles/" + source_file_name)
    print("File {} uploaded to {}.".format(source_file_name,
                                           destination_blob_name))
    os.remove("inferencefiles/" + source_file_name)
    time.sleep(5)
    return "Inference uploaded", 201

@app.route("/user/getConfig")
def getConfig():
    username = request.form["username"]
    gcp_config_file_path = '/'+username+'/config'
    config_dir_name = '/config_files/'+username
    destination_file_name = config_dir_name+'/config'
    if not os.path.exists(config_dir_name):
        os.mkdirs(config_dir_name)
    storage_client = storage.Client()
    #bucket_name = os.environ.get('TF_BUCKET_NAME', 'edgecomputing-310003-tf-saved-models')
    bucket_name = os.environ.get('TF_BUCKET_NAME','sjsu295b-tf-saved-models')
    blob = bucket.blob()
    blob.download_to_filename(destination_file_name)
    try:
		return send_file(destination_file_name, attachment_filename=destination_file_name)
	except Exception as e:
		return str(e)
    return "convertModel", 201

@app.route("/project/<id>/convertModel", methods=['POST'])
def convertModel(id):
    return "convertModel", 201


@app.route("/project/<id>/deployModel", methods=['POST'])
def deployModel(id):
    return "deployModel", 201


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
