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

Contents of `8-0.sh`

```bash
# Start out by exporting the env name. This needs to be different than the 
# env name used for other environments.
export ENV_NAME=F8

# Path to the ISO
export ISO_PATH=$WORKING_DIR/ISO/MirantisOpenStack-8.0.iso

# Node count will be the Slave Nodes  + 1(Fuel Master.) Using 6 will give us 
# 1 Fuel Master + 3 Controller Nodes + 2 Computes. 
export NODES_COUNT=6

# The VENV_PATH is located where you originally setup the Virtual Environment
export VENV_PATH=$WORKING_DIR/fuel-devops-venv

# There are more variables we can modify using ENV variables. The values can 
# be found in fuelweb_test/settings.py. 
```

After that we can source the file to export environment variables, then run our tests
which actually starts building the environment. 

```bash
source 8-0.sh
./utils/jenkins/system_tests.sh -t test -w $(pwd) -j fuelweb_test -i $ISO_PATH -o --group=setup
```

After the build has finished we can use the tool that comes along with fuel-devops, dos.py. To
use this tool we will need to activate the virtual environment. 

```bash
dos.py list
NAME
------
F8
```

`Dos.py` can be used to gather information about our nodes, such as the network ranges we'll need
to configure in Fuel.

```bash
dos.py net-list F8
NETWORK NAME    IP NET
--------------  -------------
private         10.109.4.0/24
public          10.109.3.0/24
storage         10.109.2.0/24
management      10.109.1.0/24
admin           10.109.0.0/24
```

After the deployment has finished, our fuel master and slave nodes will be shut off. We can start them back up by
using: 

`dos.py start F8`

Once they have started we should be able to get to the Fuel Master (the IP should be returned after running the system_tests.sh
when we were building our lab). In my case it's 10.109.0.2. 
