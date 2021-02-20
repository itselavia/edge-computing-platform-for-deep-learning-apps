package main

import (
	"bytes"
	"context"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/mux"
	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

// TFModelFolderInput holds the structure for input to /convertModel
type TFModelFolderInput struct {
	FolderName string `json:"saved_model_dir_gcs"`
}

// DeployModelInput holds the structure for input to /deployModel
type DeployModelInput struct {
	DeploymentName string `json:"deployment_name"`
	NumReplicas    int32  `json:"num_replicas"`
	FolderName     string `json:"tflite_model_folder_name"`
}

//IndexHandler for / path
func IndexHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Alive\n"))
}

// ConvertModelHandler invokes the Cloud Function to convert the TensorFlow model to TFLite model
func ConvertModelHandler(w http.ResponseWriter, r *http.Request) {

	decoder := json.NewDecoder(r.Body)

	var input TFModelFolderInput
	err := decoder.Decode(&input)

	if err != nil {
		w.Write([]byte("JSON Input incorrect" + err.Error() + "\n"))
	}

	region := os.Getenv("CONVERTER_FUNCTION_REGION")
	projectID := os.Getenv("PROJECT_ID")
	functionName := os.Getenv("CONVERTER_FUNCTION_NAME")

	lastIndex := strings.LastIndex(functionName, "/")
	finalFunctionName := functionName[lastIndex+1:]

	invokerURL := "https://" + region + "-" + projectID + ".cloudfunctions.net/" + finalFunctionName

	// Payload
	postBody, _ := json.Marshal(map[string]string{
		"saved_model_dir_gcs": input.FolderName,
	})
	responseBody := bytes.NewBuffer(postBody)

	resp, err := http.Post(invokerURL, "application/json", responseBody)

	if err != nil {
		w.Write([]byte("Unable to send POST request to Cloud Functions" + err.Error() + "\n"))
	}

	defer resp.Body.Close()

	response, err := ioutil.ReadAll(resp.Body)

	if err != nil {
		w.Write([]byte("Unable to read response body from Cloud Functions" + err.Error() + "\n"))
	}

	w.Write([]byte(string(response)))
}

// DeployModelHandler deploys the model's K8S manifests onto the edge nodes
func DeployModelHandler(w http.ResponseWriter, r *http.Request) {

	decoder := json.NewDecoder(r.Body)

	var input DeployModelInput
	err := decoder.Decode(&input)

	if err != nil {
		w.Write([]byte("JSON Input incorrect" + err.Error() + "\n"))
	}

	// creates the in-cluster config
	config, err := rest.InClusterConfig()
	if err != nil {
		w.Write([]byte("Unable to create in-cluster config for Kubernetes" + err.Error() + "\n"))
	}
	// creates the clientset
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		w.Write([]byte("Unable to create clienset for Kubernetes" + err.Error() + "\n"))
	}

	deploymentsClient := clientset.AppsV1().Deployments(apiv1.NamespaceDefault)

	deployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name: input.DeploymentName,
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: int32Ptr(input.NumReplicas),
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{
					"app": "edge",
				},
			},
			Template: apiv1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{
						"app": "edge",
					},
				},
				Spec: apiv1.PodSpec{
					Containers: []apiv1.Container{
						{
							Name:  "tflite",
							Image: "itselavia/tflite-base-image",
							Env: []apiv1.EnvVar{
								{
									Name:  "TFLITE_BUCKET",
									Value: os.Getenv("TFLITE_BUCKET"),
								},
								{
									Name:  "FOLDER_NAME",
									Value: input.FolderName,
								},
							},
						},
					},
					NodeSelector: map[string]string{
						"type": "edge",
					},
					DNSPolicy: apiv1.DNSDefault,
				},
			},
		},
	}

	result, err := deploymentsClient.Create(context.TODO(), deployment, metav1.CreateOptions{})
	if err != nil {
		w.Write([]byte("Unable to create Deployment: " + err.Error() + "\n"))
	}
	w.Write([]byte("Created Deployment successfully: " + result.GetObjectMeta().GetName() + "\n"))
}

func int32Ptr(i int32) *int32 { return &i }

func main() {
	r := mux.NewRouter()
	// Routes consist of a path and a handler function.
	r.HandleFunc("/", IndexHandler)
	r.HandleFunc("/convertModel", ConvertModelHandler).Methods("POST")
	r.HandleFunc("/deployModel", DeployModelHandler).Methods("POST")

	// Bind to a port and pass our router in
	log.Fatal(http.ListenAndServe(":8000", r))
}
