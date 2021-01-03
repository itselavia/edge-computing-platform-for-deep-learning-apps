#!/bin/bash

set -x

exec > >(tee /var/log/user-data.log|logger -t user-data ) 2>&1

apt-get update

# Waiting for kube config file to be available on GCS
until gsutil -q stat ${config_bucket_url}/config
do
    sleep 15
done

# Download the kube config file
gsutil cp ${config_bucket_url}/config /root/.kube/config

# Download keadm
KEADM_VERSION=keadm-v1.4.0-linux-amd64
wget https://github.com/kubeedge/kubeedge/releases/download/v1.4.0/$KEADM_VERSION.tar.gz
tar -xvzf $KEADM_VERSION.tar.gz
mv $KEADM_VERSION/keadm/keadm /usr/local/bin/
rm -rf $KEADM_VERSION $KEADM_VERSION.tar.gz

# Initialize kubeedge cloudcore
PUBLIC_IP=$(curl -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip)
keadm init --advertise-address="$PUBLIC_IP"

sleep 10

# Upload the keadm join token to config bucket
keadm gettoken > keadm_token
gsutil cp keadm_token ${config_bucket_url}