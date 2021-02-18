cluster-init:
	terraform -chdir=infra/terraform init

cluster-plan: cluster-init
	terraform -chdir=infra/terraform plan

cluster-deploy: cluster-init
	terraform -chdir=infra/terraform apply --auto-approve

cluster-destroy: delete-services
	terraform -chdir=infra/terraform destroy --auto-approve
	rm -f backend/model_manager/deploy/configmap.yaml

test-converter-function:
	$(eval BUCKET_URL := $(shell terraform -chdir=infra/terraform output tf_saved_models_bucket))
	gsutil cp -r example/tf_model/sample_tf_model ${BUCKET_URL}

deploy-services: cluster-deploy
	$(eval REGION := $(shell terraform -chdir=infra/terraform output function_region))
	$(eval PROJECT_ID := $(shell terraform -chdir=infra/terraform output project_id))
	$(eval FUNCTION_NAME := $(shell terraform -chdir=infra/terraform output function_name))
	kubectl create configmap model-manager-env --from-literal=CONVERTER_FUNCTION_REGION=${REGION} --from-literal=PROJECT_ID=${PROJECT_ID} --from-literal=CONVERTER_FUNCTION_NAME=${FUNCTION_NAME} --kubeconfig=infra/terraform/modules/kubernetes/config --dry-run -o yaml > backend/model_manager/deploy/configmap.yaml
	kubectl apply -f backend/model_manager/deploy --kubeconfig=infra/terraform/modules/kubernetes/config

delete-services:
	kubectl delete -f backend/model_manager/deploy --kubeconfig=infra/terraform/modules/kubernetes/config