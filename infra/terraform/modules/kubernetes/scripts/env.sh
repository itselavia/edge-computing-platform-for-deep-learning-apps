#!/bin/sh

set -x

exec &> $1/env_output.log

FULL_PATH=`realpath $1/config`
export KUBECONFIG=$FULL_PATH