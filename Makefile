cluster-init:
	terraform -chdir=infra/terraform init -upgrade

cluster-plan: cluster-init
	terraform -chdir=infra/terraform plan

cluster-deploy: cluster-init
	terraform -chdir=infra/terraform apply --auto-approve
	$(eval KUBECONFIG := infra/terraform/modules/kubernetes/config)
	kubectl get nodes  --kubeconfig=${KUBECONFIG}

cluster-destroy: 
	terraform -chdir=infra/terraform destroy --auto-approve

test-converter-function:
	$(eval BUCKET_URL := $(shell terraform -chdir=infra/terraform output tf_saved_models_bucket))
	gsutil cp -r example/tf_model/sample_tf_model ${BUCKET_URL}/akshay.elavia@gmail.com/Sample_Project/

test-tflite-model-deploy:
	$(eval BUCKET_URL := $(shell terraform -chdir=infra/terraform output tf_saved_models_bucket))
	gsutil cp example/inference.py ${BUCKET_URL}/akshay.elavia@gmail.com/Sample_Project/

deploy-services:
	$(eval REGION := $(shell terraform -chdir=infra/terraform output function_region))
	$(eval PROJECT_ID := $(shell terraform -chdir=infra/terraform output project_id))
	$(eval FUNCTION_NAME := $(shell terraform -chdir=infra/terraform output function_name))
	$(eval CONTROL_PLANE_ADDRESS := $(shell terraform -chdir=infra/terraform output control_plane_address))
	$(eval TFLITE_BUCKET := $(shell terraform -chdir=infra/terraform output tf_saved_models_bucket))
	$(eval KUBECONFIG := infra/terraform/modules/kubernetes/config)
	$(eval GCP_CREDENTIALS_FILE := $(shell terraform -chdir=infra/terraform output credentials_location))
	
	kubectl get nodes  --kubeconfig=${KUBECONFIG} | grep worker | awk '{print $$1}' | while read line ; do \
            kubectl label node $$line type=worker --kubeconfig=${KUBECONFIG} --overwrite; \
        	done;

	kubectl get nodes  --kubeconfig=${KUBECONFIG} | grep gpu | awk '{print $$1}' | while read line ; do \
            kubectl label node $$line type=gpu-worker --kubeconfig=${KUBECONFIG} --overwrite; \
        	done;

	kubectl get nodes  --kubeconfig=${KUBECONFIG} | grep edge | awk '{print $$1}' | while read line ; do \
            kubectl label node $$line type=edge --kubeconfig=${KUBECONFIG} --overwrite; \
        	done;

	kubectl create secret generic cloudsql-oauth-credentials --from-file=creds=${GCP_CREDENTIALS_FILE}
	kubectl create configmap model-manager-env --from-literal=CONVERTER_FUNCTION_REGION=${REGION} --from-literal=PROJECT_ID=${PROJECT_ID} --from-literal=CONVERTER_FUNCTION_NAME=${FUNCTION_NAME} --from-literal=CONTROL_PLANE_ADDRESS=${CONTROL_PLANE_ADDRESS} --from-literal=TFLITE_BUCKET=${TFLITE_BUCKET} --from-literal=WORKER_IP=${WORKER_IP} --kubeconfig=${KUBECONFIG} --dry-run -o yaml > backend/model_manager/deploy/configmap.yaml
	kubectl apply -f backend/model_manager/deploy --kubeconfig=${KUBECONFIG}

	gcloud config set project ${PROJECT_ID}
	$(eval WORKER_IP := $(shell gcloud compute instances list | grep worker | awk '{print $$5}' | head -n 1))
	echo "Model Manager IP Address: " ${WORKER_IP}:32000


	kubectl create configmap edge-frontend-env --from-literal=CHOKIDAR_USEPOLLING=true --from-literal=REACT_APP_DOMAIN=${WORKER_IP} --kubeconfig=${KUBECONFIG} --dry-run -o yaml > frontend/deploy/1-configmap.yaml
	kubectl apply -f frontend/deploy

	kubectl create secret generic mainservicekey --from-file=.dockerconfigjson=/Users/akshay/Desktop/docker_creds --type=kubernetes.io/dockerconfigjson --kubeconfig=${KUBECONFIG}
	kubectl create configmap main-service-env --from-literal=MODEL_MANAGER_SERVICE_HOST=${WORKER_IP} --kubeconfig=${KUBECONFIG} --dry-run -o yaml > backend/flask_service/deploy/1-configmap.yaml
	kubectl apply -f backend/flask_service/deploy
delete-services:
	kubectl delete -f backend/model_manager/deploy --kubeconfig=${KUBECONFIG}
	kubectl delete -f backend/flask_service/deploy --kubeconfig=${KUBECONFIG}
	kubectl delete -f frontend/deploy --kubeconfig=${KUBECONFIG}



	rm -f frontend/deploy/1-configmap.yaml
	rm -f backend/flask_service/deploy/1-configmap.yaml
	rm -f backend/model_manager/deploy/configmap.yaml


	kubectl delete secret cloudsql-oauth-credentials
	kubectl delete secret mainservicekey