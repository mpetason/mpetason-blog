## Using Fuel Devops on Ubuntu 16.04

The setup guides can be found in two locations. I recommend starting with the 
guide from the OpenStack docs.

[Fuel Devops OpenStack Guides](http://docs.openstack.org/developer/fuel-docs/devdocs/devops.html)  
[Fuel Devops Github](https://github.com/openstack/fuel-devops)

To start out we will need an ISO to use. Depending on the version we need we can find each here:

[Mirantis OpenStack Releases](https://www.mirantis.com/software/openstack/releases/)

In our example we'll be using release 8.0 (Liberty.)

## Configuration

We can make things easier by creating a file to source, so that we don't have to remember which values
to export for envrionment variables.

```bash
# Start out by exporting the env name. This needs to be different than the env name used for other environments.
export ENV_NAME=F8

# Path to the ISO
export ISO_PATH=/home/USER_NAME/working_dir/ISO/MirantisOpenStack-8.0.iso

# Node count will be the Slave Nodes  + 1(Fuel Master.) Using 6 will give us 1 Fuel Master + 3 Controller Nodes + 2 Computes. 
export NODES_COUNT=6

# The VENV_PATH is located where you originally setup the Virtual Environment
export VENV_PATH=/home/USER_NAME/working_dir/fuel-devops-venv

# There are more variables we can modify using ENV variables. The values can be found in fuelweb_test/settings.py. 
```
