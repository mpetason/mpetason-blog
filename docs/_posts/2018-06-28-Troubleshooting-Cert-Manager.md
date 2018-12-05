## Troubleshooting Cert Manager


## What is Cert-Manager?

Before we can start troubleshooting issues we need to discuss the software we are using. Cert-manager is the next step in the kube-lego project, which handles provisioning of TLS certficiates for Kubernetes. Basically it takes away the manual work of requesting a cert, configuring the cert, and installing the cert. Instead of working directly with Nginx we can describe what we want configured then the rest is taken care of automatically with ingress resources and the ingress controller. Cert-Manager configures new Kubernetes resource types that can be used to configure cerficiates - Certs and Issuers. There are two kinds of issuers, ClusterIssuer and Issuer, which have different scopes. A ClusterIssuer will manage certificates for the entire cluster, however in our example we are using an Issuer which only controls a single namespace.

For a more detailed overview of Cert-Manager check out their github project page:

https://github.com/jetstack/cert-manager

## Where are the examples running?

For this Blog/Troubleshooting Demo I'm using IBM Cloud Kubernetes Service or "IKS".

https://www.ibm.com/cloud/container-service

IKS is IBM's Kubernetes offering. It provides a farily vanilla version of K8s, which makes it great for testing deployments and new features or projects that extend K8s.

The new Cert-Manager project supports more Ingress Controllers. Kube-Lego was limited in supporting different Ingress Controllers. The biggest difference I can see between Kube-Lego and Cert-Manager is how the ingress resources are configured. In Kube-Lego there would be at least 2 ingress resources per domain, which would break certain ingress controllers as they were not expecting nmore than one resource per dns record.

## Setup

The application was deployed using HTTP validation. Troubleshooting assumes the steps in the documentation below have been followed. 

http://docs.cert-manager.io/en/latest/tutorials/acme/http-validation.html

## Troubleshooting

Most of the common issues seem to come from slow DNS resolution. If you are configuring an A record for your domain around the same time as deployment then you will probably run into issues when letsencrypt attempts to verify the domain. If the domain is not resolving yet, then we can assume that the challenge file is not reachable.

Great, but what does that mean and why do I care? So we need resolution to work because LetsEncrypt is going to issue a challenge to make sure that the domain actually exists and that it wants to be configured by LetsEncrypt. Basically there's a challenge file that needs to exist in a specific location and is being served on port 80. If it exists then LetsEncrypt will progress. If DNS is not configured correctly, or it hasn't resolved, then LetsEncrypt will be unable to resolve the domain and will also fail at finding the challenge file.

Since we are using IKS we'll be setup with an ingress contorller + ingress resource by default. When settting up DNS we'll want to use the IP address associated with the ingress controller and loadbalancer service that has been configured. Where can we find this valuable information? It's going to be in the kube-system namespace.

```bash
kubectl get svc -n kube-system |grep -i "public"
```

We'll see output similar to:

```bash
public-crf3df42c3c8a142c8a3e0ee73ed4e58e2-alb1   LoadBalancer   172.21.39.18     169.61.23.142   80:31337/TCP,443:31615/TCP   106d
```

We need to pull out the public IP, which in this case is 169.61.23.142 and use that to setup an A record for the hostname we are using. The great part about having an ingress controller already configured on the cluster is that we can manage multiple domains. In this demo I setup multiple domains to point to the same IP address and then used ingress resources + cert-manager + the ingress controller to manage traffic resolution based on the hostname. When the DNS record finally resolves you can move along and attempt a deployment. 

```bash
lp.mpetason.com has address 169.61.23.142
```

First we need to see which ingress resources were created. We can do so with the command below. If we are checking in a different namespace then we need to append -n NAMESPACE_NAME

```bash
kubectl get ingress
```

Find the name of the resource that was recently created and then describe it.

```bash
kubectl describe ingress INGRESS_NAME
```

Check for valuable information in Events. Normally we'll see something like "failed to apply ingress resource" in the message field, and if we check the "Reason" field we'll actually get a useful error message. This is great for sysadmins and developers since it means they get useful information without having to look at log files on an actual server.

```bash
Events:
  Type     Reason             Age   From                                                             Message
  ----     ------             ----  ----                                                             -------
  Warning  TLSSecretNotFound  3s    public-cr0ba8157fd1a6454ca7ba3125b9b44ff6-alb1-5895555f68-bl976  Failed to apply ingress resource.
  Warning  TLSSecretNotFound  3s    public-cr0ba8157fd1a6454ca7ba3125b9b44ff6-alb1-5895555f68-25nhq  Failed to apply ingress resource.
```

After figuring out that the TLS Secret may be missing we'll need to see what the expected resource is named. We name the secret in our ingress resource, so we'll check there first.

```bash
kubectl get ingress INGRESS_NAME -o yaml
```

We use the output option to specify yaml so we can read the configuration file. You can also use describe instead of using "get" with "-o yaml", we'll just see the output in a different format. In our case our secret name is lp-mpetason-com-tls1.

```yaml
  tls:
  - hosts:
    - lp.mpetason.com
    secretName: lp-mpetason-com-tls1
```

Check for configured secrets to see if the secret is configured, or if it has a different name for some reason. If we are having trouble with our deployment then it may not have been created. In order to get the file created we would need for the Issuer and the Cert to finish out getting configured.

```bash
kubectl get issuer
kubectl describe issuer ISSUER_NAME
```

We should be able to find error message in Events. Most of the error messages about the Issuer have been related to the acme endpoint. There may be other issues that can come up, however I haven't seen them enough to help troubleshoot - yet. For the most part you can try to resolve the issues you see in the Event info or Status.

If our issuer is working without issues we should see something like:

```bash
Status:
  Acme:
    Uri:  https://acme-v01.api.letsencrypt.org/acme/reg/<NUMBERS>
  Conditions:
    Last Transition Time:  2018-06-14T18:12:24Z
    Message:               The ACME account was registered with the ACME server
    Reason:                ACMEAccountRegistered
    Status:                True
    Type:                  Ready
Events:                    <none>
```

As of this post we should probably be using acme-v02 instead. If you run into errors about the version, go ahead and change it.

Next up we need to take a look at the cert and see what the status is.

```bash
kubectl get cert
kubectl describe cert CERT_NAME
```

Here we can run into a few other issues - such as rate limiting if we've tried to register a ton in a short period.

Normally if the issuer is working, and DNS is resolving, we should be able to get a cert. After we confirm that we have a cert via the Describe on the cert, we'll need to take a look at secrets to verify it was created.

```bash
kubectl get secret
```

If the secret exists we can go back over to the ingress resource to see if the ingress controller was able to load our cert.

```bash
  Warning  TLSSecretNotFound  26m   public-cr0ba8157fd1a6454ca7ba3125b9b44ff6-alb1-5895555f68-bl976  Failed to apply ingress resource.
  Warning  TLSSecretNotFound  26m   public-cr0ba8157fd1a6454ca7ba3125b9b44ff6-alb1-5895555f68-25nhq  Failed to apply ingress resource.
  Normal   Success            11s   public-cr0ba8157fd1a6454ca7ba3125b9b44ff6-alb1-5895555f68-25nhq  Successfully applied ingress resource.
  Normal   Success            11s   public-cr0ba8157fd1a6454ca7ba3125b9b44ff6-alb1-5895555f68-bl976  Successfully applied ingress resource.
```

Success! Now we can hit the site and see if the cert worked properly.
