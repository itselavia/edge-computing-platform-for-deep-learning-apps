package main

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/mux"
)

// TFModelFolderInput holds the structure for input to /convertModel
type TFModelFolderInput struct {
	FolderName string `json:"saved_model_dir_gcs"`
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

// DeployModelHandler deploys the model's Helm Chart onto the edge nodes
func DeployModelHandler(w http.ResponseWriter, r *http.Request) {

}

func main() {
	r := mux.NewRouter()
	// Routes consist of a path and a handler function.
	r.HandleFunc("/", IndexHandler)
	r.HandleFunc("/convertModel", ConvertModelHandler).Methods("POST")
	r.HandleFunc("/deployModel", DeployModelHandler).Methods("POST")

	// Bind to a port and pass our router in
	log.Fatal(http.ListenAndServe(":8000", r))
}
