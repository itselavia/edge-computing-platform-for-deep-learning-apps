#!/bin/sh

set -x

exec &> $2/output.log

# Waiting for kube config file to be available on GCS
until gsutil -q stat $1/config
do
    sleep 15
done

# Download the kube config file
gsutil cp $1/config $2/config

source $2/scripts/env.sh $2

kubectl config set-context kubernetes-admin@kubernetes