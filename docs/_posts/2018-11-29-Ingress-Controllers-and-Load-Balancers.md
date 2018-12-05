## Ingress Controllers and Load Balancers

In this article I will be working with the default Ingress Controller provided by the IKS service on IBMCloud. 

# Kubernetes Service : Load Balancer


# Ingress Controller and Resource Overview


# Where is this stuff? 

In the default deployment resources are located in the kube-system namespace. The LoadBalancer is configured as a Service in the Kube-System namespace while the Ingress Controller is configured as a Deployment in Kube-System. 

To access the kube-system namespace use the -n option and specify kube-system. 

```bash
$ k -n kube-system get service
```

# Putting it all together

# Events and Logging