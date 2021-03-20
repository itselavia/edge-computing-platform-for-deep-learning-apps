#!/bin/bash

set -x

exec > >(tee /var/log/user-data.log|logger -t user-data ) 2>&1

# Installing Docker
apt-get update

apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -

add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"

apt-get update 
apt-get install -y docker-ce=5:19.03.14~3-0~ubuntu-bionic docker-ce-cli=5:19.03.14~3-0~ubuntu-bionic containerd.io

# Download keadm
KEADM_VERSION=keadm-v1.5.0-linux-amd64
wget  --quiet https://github.com/kubeedge/kubeedge/releases/download/v1.5.0/$KEADM_VERSION.tar.gz
tar -xvzf $KEADM_VERSION.tar.gz
mv $KEADM_VERSION/keadm/keadm /usr/local/bin/
rm -rf $KEADM_VERSION $KEADM_VERSION.tar.gz

# Waiting for keadm token file to be available on GCS
until gsutil -q stat ${config_bucket_url}/keadm_token
do
    sleep 15
done

# Download the keadm token from the config bucket
gsutil cp ${config_bucket_url}/keadm_token ./keadm_token

KEADM_TOKEN=$(cat ./keadm_token)

# Running the join command twice. this is a workaround for a bug in KubeEdge
keadm join --cloudcore-ipport=${cloudcore_ip}:10000 --token=$KEADM_TOKEN
keadm join --cloudcore-ipport=${cloudcore_ip}:10000 --token=$KEADM_TOKEN

cp /etc/kubeedge/edgecore /usr/local/bin/