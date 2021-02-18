cluster-init:
	terraform -chdir=infra/terraform init

cluster-plan: cluster-init
	terraform -chdir=infra/terraform plan

cluster-deploy: cluster-init
	terraform -chdir=infra/terraform apply --auto-approve

cluster-destroy:
	terraform -chdir=infra/terraform destroy --auto-approve

test-converter-function:
	$(eval BUCKET_URL := $(shell terraform -chdir=infra/terraform output tf_saved_models_bucket))
	gsutil cp -r example/tf_model/sample_tf_model ${BUCKET_URL}