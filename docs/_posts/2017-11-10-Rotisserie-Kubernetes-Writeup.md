## Node.js Application running in Kubernetes with Kube-Lego

Kubernetes makes it easy to deploy containerized applications in the cloud. In our use case we created an application that would require three containers, each running in their own pod. The deployment is split up into an application pod, ocr pod, and a static pod. On top of the base deployment we have setup Kube-Lego to manage TLS certificates.


### Secrets

We setup secrets before the deployment so that we can store sensitive information in Kubernetes that can later be referenced by a variable. In our case we will need a token and clientID to authenticate against the Twitch API. 

``bash
---
apiVersion: v1
kind: Secret
metadata:
  name: twitch-auth
type: Opaque
data:
  token: YOUR_OAUTH_TOKEN_IN_BASE64
  clientID: YOUR_CLIENT_ID_IN_BASE64
---
``

### Application Pod

The application pod consists of a single container running our Node.js app. The application polls the Twitch API for Player Unknown Battlegrounds streams. We record part of the stream and pull out a screenshot that can be sent to the OCR pod for processing.

Since we are using secrets, the images are built without sensitive information. In the example below we reference the secret twitch-auth and pull the token needed to authenticate. We also store the clientID, which is required with newer versions of the Twitch API.

``bash
---
       - name: token
            valueFrom:
              secretKeyRef:
                name: twitch-auth
                key: token
          - name: clientID
            valueFrom:
              secretKeyRef:
                name: twitch-auth
                key: clientID
---
``

To simplify deployment we are using environment variables for a few values. APP_HOSTNAME is used throughout the deployment to specify the URL for the application. In our production environment the value is set to rotisserie.tv. Since the OCR_HOST is running behind the same URL we set the value to equal the hostname.

``bash
---
          - name: OCR_HOST
            value: $APP_HOSTNAME
          ports:
            - containerPort: 3000
---
``

We setup a ClusterIP service for the pod since we aren't worried about getting to it from the outside. A Load Balancer is configured to allow traffic in from the internet. More information is provided on the Load Balancer in the Kube-Lego section.

``bash
---
apiVersion: v1
kind: Service
metadata:
  name: rotisserie-app
spec:
  ports:
  - port: 3000
    protocol: TCP
    name: rotisserie-app
  selector:
    app: rotisserie-app
---
``

### OCR Pod

The ocr pod has a single container running an optical character recognition service. Images from the stream are sent over to the OCR service where they are processed. We are looking for the amount of players alive, which is denoted by a number in the top right of the stream. OCR provides the amount of players alive back to the application container where they are processed again to find the person with the lowest count.

The deployment is basic. We're pulling the OCR image and setting the port to 3001, which we'll use later when we setup our Ingress resources.

``bash
---
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: rotisserie-ocr
spec:
  template:
    metadata:
      labels:
        app: rotisserie-ocr
    spec:
      containers:
        - name: rotisserie-ocr
          image: $docker_username/rotisserie-ocr:$IMAGE_TAG
          ports:
            - containerPort: 3001
---
``

We are using a ClusterIP for the OCR container. External traffic is managed by the Load Balancer that we setup in Kube-Lego.

``bash
---
apiVersion: v1
kind: Service
metadata:
  name: rotisserie-ocr
spec:
  ports:
  - port: 3001
    protocol: TCP
    name: rotisserie-ocr
  selector:
    app: rotisserie-ocr
---
``

### Static Pod

The static pod consists of a single container with Nginx and the static data used for the site. We create an image based on nginx alpine and then copy the static data over from the public folder in our repository. The deployment sets the pod up to listen on port 8082 and sets Nginx environment variables to configure the Nginx service.


``bash
---
apiVersion: v1
kind: Service
metadata:
  name: rotisserie-static
spec:
  ports:
  - port: 8082
    protocol: TCP
    name: rotisserie-static
  selector:
    app: rotisserie-static
---
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: rotisserie-static
spec:
  replicas: 1
  template:
    metadata:
      labels:
        app: rotisserie-static
    spec:
      containers:
      - name: rotisserie-static
        image: $docker_username/rotisserie-static:$IMAGE_TAG
        imagePullPolicy: Always
        env:
        - name: NGINX_LISTEN
          value: "*:8082"
        ports:
        - containerPort: 8082
---
``


Kube-Lego

With Kube-Lego we can generate a certificate, as well as renew it, in an automated way.`
