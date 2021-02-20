#!/bin/bash

set -x

exec > >(tee /var/log/user-data.log|logger -t user-data ) 2>&1

# Letting iptables see bridged traffic
cat <<EOF | tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
sysctl --system


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

# Installing kubeadm, kubelet and kubectl 
apt-get update && apt-get install -y apt-transport-https curl
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
cat <<EOF | tee /etc/apt/sources.list.d/kubernetes.list
deb https://apt.kubernetes.io/ kubernetes-xenial main
EOF
apt-get update
apt-get install -y kubelet=1.19.8-00 kubeadm=1.19.8-00 kubectl=1.19.8-00
apt-mark hold kubelet kubeadm kubectl

# Waiting for Kubernetes API Server to become available
STATUS_CODE="999"
until [[  "$STATUS_CODE" == "403" ]]; do
    STATUS_CODE=$(curl --insecure -s -o /dev/null -w "%%{http_code}" https://${controlplane_ip}:6443)
    sleep 15
done

kubeadm join --token ${kubeadm_token} ${controlplane_ip}:6443 --discovery-token-unsafe-skip-ca-verification