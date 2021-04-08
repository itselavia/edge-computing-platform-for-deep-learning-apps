# Flask Backend Service

Python service to provide user and project management functionalities and upload Tensorflow model and inference files to the GCP bucket.

## Installing dependencies

Use the package manager [pip](https://pip.pypa.io/en/stable/) to install libraries from pipfile.

```bash
pipenv install
```

## Starting Development Server
Once all dependencies in pipfile are successfully installed, export the environment variables FLASK_APP and FLASK_ENV before running the application.
```bash
export FLASK_APP=main_service
export FLASK_ENV=development

flask run
```

## List of APIs supported

**POST: /newUser**  
Request body (JSON)
```json
{"name": "Vanditt",
"email": "vanditt.sama@sjsu.edu",
"phone": "4082294499"}
```

**POST: /login**  
Request body (JSON):
```json
{"email": "vanditt.sama@sjsu.edu"}
```

**GET,DELETE: /project**  
Request Parameters
```json
project_id = ABC123
```

**POST: /newProject**  
Request body (JSON)
```json
{"project_name": "Sample Project",
"project_desc": "sample description",
"user_email": "vanditt.sama@sjsu.edu"}
```

**GET: /projects**  
Request Parameters
```json
email = vanditt.sama@sjsu.edu
```

**POST: /addProjectUser**  
Request body (JSON)
```json
{"project_id": "89272b2f7bf82560d873814cafed9ee7",
"user_email": "mukesh@gmail.com"}
```

**GET: /projectUsers**  
Request Parameters
```json
project_id = ABC123
```

**POST: /uploadModel**  
Request body (Form Data)
```json
username = Vanditt
projectname = sample project
modelfile = (Attached file)
```


**POST: /uploadInference**  
Request body (Form Data)
```json
username = Vanditt
projectname = sample project
inferencefile = (Attached file)
```
