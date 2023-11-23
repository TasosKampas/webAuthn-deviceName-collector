/**
 * Takes the nodeState webauthnDeviceData object, prompts the user for a user-friendly name of the device, 
 * updates the transientState. If users skips it, then it does nothing.
 */

/**
 * Node imports
 */
var javaImports = JavaImporter(
    org.forgerock.openam.auth.node.api.Action,
    javax.security.auth.callback.ConfirmationCallback,
    org.forgerock.openam.authentication.callbacks.StringAttributeInputCallback,
    java.lang.String
);

/**
 * Node outcomes
 */

var nodeOutcomes = {
    SAVE: "save",
    SKIP: "skip"
};

/**
 * Node config
 */

var nodeConfig = {
  	nodeName: "***SecurityKeyNameCollector",
    BUTTONS: ["SAVE", "SKIP"],
    SAVE_ACTION_PRESSED: 0,
    SKIP_ACTION_PRESSED: 1,
  	PAGE_HEADER: "New Passkey!",
    PAGE_DESCRIPTION: "Please provide a device name. If you skip, the default name will be Default Security Key.",
    deviceDataSharedStatePropertyName: "webauthnDeviceData",
    callbackDisplayTextDeviceNameInput: "Device name",
    name: "device"
};


/**
 * Node logger
 */

var nodeLogger = {
    debug: function(message) {
        logger.message("***" + nodeConfig.nodeName + " " + message);
    },
    warning: function(message) {
        logger.warning("***" + nodeConfig.nodeName + " " + message);
    },
    error: function(message) {
        logger.error("***" + nodeConfig.nodeName + " " + message);
    }
};

/**
 * Main
 */

(function() {
    nodeLogger.debug("node executing");
    if (callbacks.isEmpty()) {
        var deviceNameCallback = new javaImports.StringAttributeInputCallback(
            nodeConfig.name,
            nodeConfig.callbackDisplayTextDeviceNameInput,
            "",
            false
        );
        var confirmCallback = new javaImports.ConfirmationCallback(javaImports.ConfirmationCallback.INFORMATION, nodeConfig.BUTTONS, 0);
        action = javaImports.Action.send(deviceNameCallback, confirmCallback).withHeader(nodeConfig.PAGE_HEADER).withDescription(nodeConfig.PAGE_DESCRIPTION).build();
        return;
    } else {
        var userSelection = callbacks[1].getSelectedIndex();
        nodeLogger.debug("User selected: " + userSelection);
        if (userSelection === nodeConfig.SAVE_ACTION_PRESSED) {
            var deviceInputName = javaImports.String(callbacks.get(0).getValue());
            nodeLogger.debug("Setting new device name: " + deviceInputName);
            var webauthnDeviceData = nodeState.get(nodeConfig.deviceDataSharedStatePropertyName);
            webauthnDeviceData.put("deviceName", deviceInputName);
            transientState.put("webauthnDeviceData", webauthnDeviceData);
            action = javaImports.Action.goTo(nodeOutcomes.SAVE).build();
        } else {
            nodeLogger.debug("Device name skipped");
            action = javaImports.Action.goTo(nodeOutcomes.SKIP).build();
        }
    }
})();