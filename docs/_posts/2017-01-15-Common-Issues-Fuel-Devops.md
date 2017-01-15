## Issues I ran into with Fuel-Devops

There are a few different branches to pick when cloning fuel-qa, as well as fuel-devops. Depending
on the versioning you may run into requirement installment issues. The easiest way I found to get 
around the issue was to upgrade fuel-devops to a newer version. I've had a few different issues with
packages not being installed, or even included in the requirements. 

A few example tracebacks when running system_tests.sh:

```bash
Traceback (most recent call last):
  File "fuelweb_test/run_tests.py", line 19, in <module>
    from nose.plugins import Plugin
ImportError: No module named nose.plugins
```

```bash
Traceback (most recent call last):
  File "fuelweb_test/run_tests.py", line 195, in <module>
    import_tests()
  File "fuelweb_test/run_tests.py", line 73, in import_tests
    from tests import test_admin_node  # noqa
  File "/home/mpetason/working_dir/fuel-qa/fuelweb_test/tests/test_admin_node.py", line 27, in <module>
    from fuelweb_test.helpers.decorators import log_snapshot_after_test
  File "/home/mpetason/working_dir/fuel-qa/fuelweb_test/helpers/decorators.py", line 26, in <module>
    from fuelweb_test.helpers.checkers import check_action_logs
  File "/home/mpetason/working_dir/fuel-qa/fuelweb_test/helpers/checkers.py", line 23, in <module>
    from devops.helpers.helpers import wait_pass
ImportError: cannot import name wait_pass
```

When searching for the import errors you will usually find a bug report. On the last error I saw a bug 
report that recommended using version 2.9.23. The installation steps include 2.9.11. To resolve this issue
you can re-enter the virtual env and install the newer version:


```bash
. fuel-devops-venv/bin/activate
pip install git+https://github.com/openstack/fuel-devops.git@2.9.23 --upgrade
```

I usually verify that all of the requirements are installed again:

```bash
pip install -r ./fuelweb_test/requirements.txt --upgrade
```

Afterwards we should be able to run the installation again without getting the same traceback messages.

```bash
./utils/jenkins/system_tests.sh -t test -w $(pwd) -j fuelweb_test -i $ISO_PATH -o --group=setup
Option 'TASK_NAME' deprecated.
/home/mpetason/working_dir/fuel-qa
Create environment and set up master node ... 2017-01-15 20:37:18,516 - INFO decorators.py:81 -- 
<<<<<##############################[ setup_master ]##############################>>>>>
Create environment and set up master node

        Snapshot: empty

        
2017-01-15 20:37:53,140 - INFO environment.py:454 -- Waiting for admin node to start up
2017-01-15 20:37:53,140 - INFO environment.py:456 -- Proceed with installation
```
