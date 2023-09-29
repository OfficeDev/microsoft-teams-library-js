# M365 Test App

## Sideloading the test app in a host

1. Follow the instructions [here](../README.md) to build the test app and run it locally.
2. Open the [manifest.json](./manifest.json) file and replace all instances of "https://<REPLACE WITH URL OF THE APP>" with the url the test app is running at.
3. Zip all of the files in this directory _except this README file_ into a `manifest.zip` file
4. Follow the sideloading instructions of the host of your choice and upload your new `manifest.zip` file when asked for an app manifest.
