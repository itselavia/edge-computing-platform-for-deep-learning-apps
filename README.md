# edge-computing-platform-for-deep-learning-apps
This is the code repository for CMPE295 Masters Project. Part of the curriculum for Masters in Software Engineering at San Jose State University.

# Prerequisites:
- Enable the GCP APIs: Cloud Functions, Cloud Build, Storage, Virtual Machine, VPC, IAM 
- If you're enabling the APIs for the first time, wait ~20-30 minutes before applying Terraform. The GCP API activation does not take immediate effect
- Install helm v3
- Install gsutil
- Login to DockerHub account
- Install realpath (Command for MacOS - brew install coreutils)

- export KUBECONFIG=`pwd`/infra/terraform/modules/kubernetes/config

# Notes:
- GCP doesn't handle renaming resources well enough. For example, if you're deleting and recreating a service account, it's better to give a new name to the new service account.

### Miscelleanous commands
- kubectl label node k8s-worker-0 type=worker
- curl -X POST "https://us-west2-edge-platform-cmpe-295b.cloudfunctions.net/tf-to-tflite-converter-function" -H "Content-Type:application/json" --data '{"saved_model_dir_gcs":"sample_tf_model"}'
- curl -X POST "http://10.244.1.3:8000/convertModel" --data '{"saved_model_dir_gcs":"sample_tf_model"}'
- curl -X POST "http://10.244.1.5:8000/deployModel" --data '{"deployment_name":"edge-test-dep", "num_replicas": 1, "tflite_model_folder_name": "sample_tf_model"}'