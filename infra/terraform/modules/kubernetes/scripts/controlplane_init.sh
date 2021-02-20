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
apt-get update &&  apt-get install -y apt-transport-https curl
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg |  apt-key add -
cat <<EOF | tee /etc/apt/sources.list.d/kubernetes.list
deb https://apt.kubernetes.io/ kubernetes-xenial main
EOF
apt-get update
apt-get install -y kubelet=1.19.8-00 kubeadm=1.19.8-00 kubectl=1.19.8-00
apt-mark hold kubelet kubeadm kubectl

PUBLIC_IP=$(curl -H "Metadata-Flavor: Google" "http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip")

# Initialize the Kubernetes control plane
kubeadm init --token ${kubeadm_token} --pod-network-cidr=10.244.0.0/16 --control-plane-endpoint $PUBLIC_IP

# Copy the kube config to default location and GCS
mkdir -p /root/.kube
cp -i /etc/kubernetes/admin.conf /root/.kube/config

# Installing Flannel pod network add-on
#kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml --kubeconfig=/etc/kubernetes/admin.conf

kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/2140ac876ef134e0ed5af15c65e414cf26827915/Documentation/kube-flannel.yml --kubeconfig=/etc/kubernetes/admin.conf

# Upload the kube config to config bucket
gsutil cp /root/.kube/config ${config_bucket_url}