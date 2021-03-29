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
	"time"

	"github.com/gorilla/mux"
	appsv1 "k8s.io/api/apps/v1"
	apiv1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

// Pair holds key value pairs
type Pair map[string]string

// TFModelFolderInput holds the structure for input to /convertModel
type TFModelFolderInput struct {
	FolderName  string `json:"model_folder_name"`
	ProjectName string `json:"project_name"`
}

// DeployModelInput holds the structure for input to /deployModel
type DeployModelInput struct {
	DeploymentName string `json:"deployment_name"`
	CustomImage    string `json:"custom_image"`
	NumReplicas    int32  `json:"num_replicas"`
	ProjectName    string `json:"project_name"`
	GPUSupport     bool   `json:"gpu_support"`
	NodeName       string `json:"node_name"`
	NodeSelectors  []Pair `json:"node_selectors"`
	Labels         []Pair `json:"labels"`
}

// NewUserInput holds the structure for input to /createUser
type NewUserInput struct {
	Email string `json:"email"`
}

// PodInfo holds the strcuture for information about pods. output json for /getAllPods
type PodInfo struct {
	PodName     string    `json:"pod_name"`
	ProjectName string    `json:"project_name"`
	NodeName    string    `json:"node_name"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
}

//IndexHandler for / path
func IndexHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Alive\n"))
}

//GetAllPodsHandler for /getAllPods path. It returns the list of all pods in the user's namespace
func GetAllPodsHandler(w http.ResponseWriter, r *http.Request) {

	clientset, err := getKubeClientSet()
	if err != nil {
		w.Write([]byte("Unable to create clienset for Kubernetes: " + err.Error() + "\n"))
	}

	userNamespace := "default"
	pods, err := clientset.CoreV1().Pods(userNamespace).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		w.Write([]byte("Unable to fetch pod list from " + userNamespace + " namespace: " + err.Error() + "\n"))
	}

	var result []PodInfo

	for _, pod := range pods.Items {

		podInfo := &PodInfo{
			PodName:     pod.Name,
			NodeName:    pod.Spec.NodeName,
			Status:      string(pod.Status.Phase),
			ProjectName: pod.Labels["project"],
			CreatedAt:   pod.CreationTimestamp.Time,
		}

		result = append(result, *podInfo)

	}

	podsInfoJSON, err := json.Marshal(result)
	if err != nil {
		w.Write([]byte("Unable to convert pods info to JSON: " + err.Error() + "\n"))
	}

	w.Write([]byte(string(podsInfoJSON)))

}

// ConvertModelHandler invokes the Cloud Function to convert the TensorFlow model to TFLite model
func ConvertModelHandler(w http.ResponseWriter, r *http.Request) {

	keys, ok := r.URL.Query()["email"]

	if !ok || len(keys[0]) < 1 {
		w.Write([]byte("Url Param 'email' is missing" + "\n"))
	}

	email := string(keys[0])

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
		"project_name":        input.ProjectName,
		"email":               email,
	})
	responseBody := bytes.NewBuffer(postBody)

	resp, err := http.Post(invokerURL, "application/json", responseBody)

	if err != nil {
		w.Write([]byte("Unable to send POST request to Cloud Functions: " + err.Error() + "\n"))
	}

	defer resp.Body.Close()

	response, err := ioutil.ReadAll(resp.Body)

	if err != nil {
		w.Write([]byte("Unable to read response body from Cloud Functions: " + err.Error() + "\n"))
	}

	w.Write([]byte(string(response)))
}

// DeployModelHandler deploys the model's K8S manifests onto the edge nodes
func DeployModelHandler(w http.ResponseWriter, r *http.Request) {

	keys, ok := r.URL.Query()["email"]

	if !ok || len(keys[0]) < 1 {
		w.Write([]byte("Url Param 'email' is missing" + "\n"))
	}

	email := string(keys[0])

	decoder := json.NewDecoder(r.Body)

	var input DeployModelInput
	err := decoder.Decode(&input)

	if err != nil {
		w.Write([]byte("JSON Input incorrect: " + err.Error() + "\n"))
	}

	clientset, err := getKubeClientSet()
	if err != nil {
		w.Write([]byte("Unable to create clienset for Kubernetes: " + err.Error() + "\n"))
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
									Name:  "USER_NAME",
									Value: email,
								},
								{
									Name:  "PROJECT_NAME",
									Value: input.ProjectName,
								},
							},
							VolumeMounts: []apiv1.VolumeMount{
								{
									Name:      "cloudsql-oauth-credentials",
									ReadOnly:  true,
									MountPath: "/etc/credentials",
								},
							},
							ImagePullPolicy: apiv1.PullAlways,
						},
					},
					NodeSelector: map[string]string{
						"type": "worker",
					},
					DNSPolicy: apiv1.DNSDefault,
					Volumes: []apiv1.Volume{
						{
							Name: "cloudsql-oauth-credentials",
							VolumeSource: apiv1.VolumeSource{
								Secret: &apiv1.SecretVolumeSource{
									SecretName: "cloudsql-oauth-credentials",
									Items: []apiv1.KeyToPath{
										{
											Key:  "creds",
											Path: "cloudsql-oauth-credentials.json",
										},
									},
								},
							},
						},
					},
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

//CreateUserHandler for /createUser path. It creates namespaces and service accounts for new users
func CreateUserHandler(w http.ResponseWriter, r *http.Request) {

	keys, ok := r.URL.Query()["email"]

	if !ok || len(keys[0]) < 1 {
		w.Write([]byte("Url Param 'email' is missing" + "\n"))
	}

	email := string(keys[0])

	clientset, err := getKubeClientSet()
	if err != nil {
		w.Write([]byte("Unable to create clienset for Kubernetes: " + err.Error() + "\n"))
	}

	namespacesClient := clientset.CoreV1().Namespaces()

	userNamespace := strings.Replace(email, ".", "-", -1)[:strings.Index(email, "@")]

	namespace := &apiv1.Namespace{
		ObjectMeta: metav1.ObjectMeta{
			Name: userNamespace,
		},
	}

	result, err := namespacesClient.Create(context.TODO(), namespace, metav1.CreateOptions{})

	if err != nil {
		w.Write([]byte("Unable to create Namespace for the user: " + email + " : " + err.Error() + "\n"))
	}

	w.Write([]byte("Created Namespace successfully: " + result.GetObjectMeta().GetName() + "\n"))

}

func getKubeClientSet() (*kubernetes.Clientset, error) {

	config, err := getClusterConfig()
	if err != nil {
		return nil, err
	}

	// creates the clientset
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		return nil, err

	}

	return clientset, nil
}

func getClusterConfig() (*rest.Config, error) {
	// creates the in-cluster config
	config, err := rest.InClusterConfig()
	if err != nil {
		return nil, err
	}
	return config, nil
}

func int32Ptr(i int32) *int32 { return &i }

func main() {
	r := mux.NewRouter()
	// Routes consist of a path and a handler function.
	r.HandleFunc("/", IndexHandler)
	r.HandleFunc("/convertModel", ConvertModelHandler).Methods("POST")
	r.HandleFunc("/deployModel", DeployModelHandler).Methods("POST")
	r.HandleFunc("/createUser", CreateUserHandler).Methods("POST")
	r.HandleFunc("/getAllPods", GetAllPodsHandler).Methods("GET")

	// Bind to a port and pass our router in
	log.Fatal(http.ListenAndServe(":8000", r))
}
