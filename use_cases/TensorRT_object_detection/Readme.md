# NVIDIA TensorRT

TensorRT provides an SDK for high-performance deep learning inference. TensorRT helps in achieving high throughput and low latency for deep learning applications by providing deep learning inference optimizer and runtime.

## Pre-requisites

For running TensorRT hardware should be equipped with NVIDIA GPU. Along with NVIDIA GPU hardware/VM should have appropriate drivers installed on the machine so that applications running on the machine should be able to access them. 

For this project, we are using azure ubuntu 18.04 VM equipped with NVIDIA Tesla K80.

### Installing NVIDIA drivers 
```
sudo apt-get install linux-headers-$(uname -r)

distribution=$(. /etc/os-release;echo $ID$VERSION_ID | sed -e 's/\.//g')
wget https://developer.download.nvidia.com/compute/cuda/repos/$distribution/x86_64/cuda-$distribution.pin
sudo mv cuda-$distribution.pin /etc/apt/preferences.d/cuda-repository-pin-600
sudo apt-key adv --fetch-keys https://developer.download.nvidia.com/compute/cuda/repos/$distribution/x86_64/7fa2af80.pub

echo "deb http://developer.download.nvidia.com/compute/cuda/repos/$distribution/x86_64 /" | sudo tee /etc/apt/sources.list.d/cuda.list
sudo apt-get update
sudo apt-get -y install cuda-drivers
```
Post installation steps
```
export PATH=/usr/local/cuda-11.3/bin${PATH:+:${PATH}}
export LD_LIBRARY_PATH=/usr/local/cuda-11.3/lib64\${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}}
```
Check if NVIDIA Persistence Daemon is active  
```systemctl status nvidia-persistenced```

If it's not activated run
```sudo systemctl enable nvidia-persistenced```

### NVIDIA container toolkit installation 
For this project, we used NVIDIA TensorRT docker image but for making GPU accessible for docker images NVIDIA Container Toolkit is needed to be installed. 
Setting up Docker on Ubuntu 
```
curl https://get.docker.com | sh \
  && sudo systemctl --now enable docker
```
Setting up NVIDIA Container Toolkit
```
distribution=$(. /etc/os-release;echo $ID$VERSION_ID) \
   && curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add - \
   && curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list

curl -s -L https://nvidia.github.io/nvidia-container-runtime/experimental/$distribution/nvidia-container-runtime.list | sudo tee /etc/apt/sources.list.d/nvidia-container-runtime.list

sudo apt-get update
sudo apt-get install -y nvidia-docker2
sudo systemctl restart docker
```

Validate installation using ```sudo docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi```

Similar output should be shown. In our case NVIDIA Tesla K80 is detected 
```
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 465.19.01    Driver Version: 465.19.01    CUDA Version: 11.3     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|                               |                      |               MIG M. |
|===============================+======================+======================|
|   0  NVIDIA Tesla K80    On   | 00000001:00:00.0 Off |                    0 |
| N/A   36C    P8    33W / 149W |      0MiB / 11441MiB |      0%      Default |
|                               |                      |                  N/A |
+-------------------------------+----------------------+----------------------+
                                                                               
+-----------------------------------------------------------------------------+
| Processes:                                                                  |
|  GPU   GI   CI        PID   Type   Process name                  GPU Memory |
|        ID   ID                                                   Usage      |
|=============================================================================|
|  No running processes found                                                 |
+-----------------------------------------------------------------------------+
```

## Use case and benchmarking 

For bentching and use case purposes starter code is used from NIVIDIA repository [https://github.com/NVIDIA/TensorRT/tree/master/samples/python/uff_ssd](https://github.com/NVIDIA/TensorRT/tree/master/samples/python/uff_ssd)
