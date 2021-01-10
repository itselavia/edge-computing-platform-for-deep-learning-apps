package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

//IndexHandler for / path
func IndexHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Alive\n"))
}

func ConvertModelHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Alive\n"))
}

func main() {
	r := mux.NewRouter()
	// Routes consist of a path and a handler function.
	r.HandleFunc("/", IndexHandler)
	r.HandleFunc("/convertModel", ConvertModelHandler).Methods("POST")

	// Bind to a port and pass our router in
	log.Fatal(http.ListenAndServe(":8000", r))
}
