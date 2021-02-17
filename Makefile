cluster-init:
	terraform -chdir=infra/terraform init

cluster-plan: cluster-init
	terraform -chdir=infra/terraform plan

cluster-apply: cluster-init
	terraform -chdir=infra/terraform apply --auto-approve

cluster-destroy:
	terraform -chdir=infra/terraform destroy --auto-approve