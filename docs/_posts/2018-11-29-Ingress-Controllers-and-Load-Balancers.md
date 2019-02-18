## Ingress Controllers and Load Balancers

In this article I will be working with the default Ingress Controller provided by the IKS service on IBMCloud. 

# Kubernetes Service : Load Balancer

A Load Balancer in Kubernetes is a service that provides a public endpoint. 


# Ingress Controller and Resource Overview

An Ingress Congroller usually sits behind a Load Balancer and allows for resource based control over HTTP endpoint configurations. Commonly this will help configure Nginx without having to edit it by hand. The resources are defined in an Ingress Resource. 


# Where is this stuff? 

In the default deployment resources are located in the kube-system namespace. The LoadBalancer is configured as a Service in the Kube-System namespace while the Ingress Controller is configured as a Deployment in Kube-System. 

To access the kube-system namespace use the -n option and specify kube-system. 

```bash
$ k -n kube-system get service
```

# Putting it all together

# Events and Logging