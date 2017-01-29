#Basic Single Sign On Example

This source code provides the starting point for learning how to add the Single Sign On service for IBM Bluemix to an application.

Follow along in this article: http://www.ibm.com/developerworks/library/wa-scale-sso-for-node-apps-trs-bluemix to see how to take into a working application using the Single Sign On service for Bluemix

To learn more about the IBM Single Sign On service, see the online documentation: https://console.ng.bluemix.net/docs/services/SingleSignOn/index.html#sso_gettingstarted

# Privacy Notice

Sample web applications that include this package may be configured to track deployments to [IBM Bluemix](https://www.bluemix.net/) and other Cloud Foundry platforms. The following information is sent to a [Deployment Tracker](https://github.com/IBM-Bluemix/cf-deployment-tracker-service) service on each deployment:

* Node.js package version
* Node.js repository URL
* Application Name (`application_name`)
* Space ID (`space_id`)
* Application Version (`application_version`)
* Application URIs (`application_uris`)
* Labels of bound services
* Number of instances for each bound service and associated plan information

This data is collected from the `package.json` file in the sample application and the `VCAP_APPLICATION` and `VCAP_SERVICES` environment variables in IBM Bluemix and other Cloud Foundry platforms. This data is used by IBM to track metrics around deployments of sample applications to IBM Bluemix to measure the usefulness of our examples, so that we can continuously improve the content we offer to you. Only deployments of sample applications that include code to ping the Deployment Tracker service will be tracked.

## Disabling Deployment Tracking

To disable deployment tracking, edit the app.js file and comment the line near the end containing:
   ```
   require("cf-deployment-tracker-client").track();
   ```
