jQuery.sap.declare("hcm.fab.myleaverequest.HCMFAB_LEAV_MANExtension.Component");

// use the load function for getting the optimized preload file if present
sap.ui.component.load({
	name: "hcm.fab.myleaverequest",
	// Use the below URL to run the extended application when SAP-delivered application is deployed on SAPUI5 ABAP Repository
	url: "/sap/bc/ui5_ui5/sap/HCMFAB_LEAV_MAN"
		// we use a URL relative to our own component
		// extension application is deployed with customer namespace
});

this.hcm.fab.myleaverequest.Component.extend("hcm.fab.myleaverequest.HCMFAB_LEAV_MANExtension.Component", {
	metadata: {
		manifest: "json"
	}
});