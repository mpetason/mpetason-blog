## Ingress Controllers and Load Balancers

In this article I will be working with the default Ingress Controller provided by the IKS service on IBMCloud. 

# Where is this stuff? 

In the default deployment resources are located in the kube-system namespace. Important resources are configured as services and deployments. 

To access the kube-system namespace use the -n option and specify kube-system. 

```bash
$ k -n kube-system get service
NAME                                             TYPE           CLUSTER-IP       EXTERNAL-IP     PORT(S)                      AGE
heapster                                         ClusterIP      172.21.20.34     <none>          80/TCP                       125d
kube-dns                                         ClusterIP      172.21.0.10      <none>          53/UDP,53/TCP                125d
kubernetes-dashboard                             ClusterIP      172.21.176.122   <none>          443/TCP                      125d
public-crf3df42c3c8a142c8a3e0ee73ed4e58e2-alb1   LoadBalancer   172.21.39.18     169.*.*.*       80:30112/TCP,443:31207/TCP   125d
tiller-deploy                                    ClusterIP      172.21.12.225    <none>          44134/TCP                    125d
```