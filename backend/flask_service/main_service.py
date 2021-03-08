from flask import Flask, request
app = Flask(__name__)


@app.route("/")
def root():
    return "Home"


@app.route("/newProject", methods=['POST'])
def newProject():
    return "Created, Project ID = xxx", 201


@app.route("/projects")
def listProjects():
    return "Project List (json)"


@app.route("/project/<id>", methods=['GET', 'DELETE'])
def getOrDeleteProject(id):
    if request.method == 'GET':
        return "json of project details"
    elif request.method == 'DELETE':
        return '', 204


@app.route("/project/<id>/convertModel", methods=['POST'])
def convertModel(id):
    return "convertModel", 201


@app.route("/project/<id>/deployModel", methods=['POST'])
def deployModel(id):
    return "deployModel", 201