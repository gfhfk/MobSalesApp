/// <reference path="../Scripts/_references.js" />
!function ($, DX, app, undefined) {
    var DATA_VERSION_KEY = "mobilesales-version",
    DATA_KEY = "mobilesales-data",
    logger = app.logger;
    serviceName = "http://mobsalessrv.azurewebsites.net/odata/";
    //serviceName = "http://localhost:1541/odata/";
   // serviceName = "http://localhost:23888/odata/";
    breeze.config.initializeAdapterInstances({ dataService: "OData" });
    var manager = new breeze.EntityManager(serviceName);
  
    
    function initUserData() {
        var dataFromStorage = localStorage.getItem(DATA_KEY);
        if (dataFromStorage) {
            manager.importEntities(dataFromStorage);
        } else {
            synchronizeData();
        }
    }
    
    function synchronizeData() {
        loadData(queryRoutes());
        loadData(queryCustomers());
    }
    function queryRoutes() {
        return breeze.EntityQuery.from("Routes").orderBy("RouteID");
    };
    function queryCustomers() {
        return breeze.EntityQuery.from("Customers")
            .orderBy("CustomerName");
    };

    function loadData(query) {
        manager.executeQuery(query).then(function (data) {
            logger.log("Loaded data: " + query.resourceName);
        }).fail(function (error) {
            logger.error("Load data error. Try later.");
            logger.log(error);
        });
    };

    $.extend(app, {
        manager: manager,
        metadataStore: manager.metadataStore,
        initUserData: initUserData,
        //clearUserData: clearUserData,

    });

}(jQuery, DevExpress, MobileSales);