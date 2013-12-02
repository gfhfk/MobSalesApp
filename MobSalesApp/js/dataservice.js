/// <reference path="../Scripts/_references.js" />
MobileSales.dataservice =function ($, DX, app, undefined) {
    var DATA_VERSION_KEY = "mobilesales-version",
    DATA_KEY = "mobilesales-data",
    logger = app.logger;
    serviceName = "http://mobsalessrv.azurewebsites.net/odata/";
    //serviceName = "http://localhost:1541/odata/";
   // serviceName = "http://localhost:23888/odata/";
    breeze.config.initializeAdapterInstances({ dataService: "OData" });
    var manager = new breeze.EntityManager(serviceName);
    var queries = [
        {
            name: "Routes",
            query: breeze.EntityQuery.from("Routes").orderBy("RouteID"),
        },
        {
            name: "Customers",
            query: breeze.EntityQuery.from("Customers").orderBy("CustomerName"),
         },
    ];
    
    function initUserData() {
        var dataFromStorage = localStorage.getItem(DATA_KEY);
        if (dataFromStorage) {
            manager.importEntities(dataFromStorage);
            return true;
        } else {
            return false;
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

    //function loadData(query) {
    //    manager.executeQuery(query).then(function (data) {
    //        logger.log("Loaded data: " + query.resourceName);
    //    }).fail(function (error) {
    //        logger.error("Load data error. Try later.");
    //        logger.log(error);
    //    });
    //};

    function loadData(query) {
        return manager.executeQuery(query);
    }
    function  getRoutes(){
        return manager.executeQueryLocally(queryRoutes());
    };

    var dataservice =  {
        manager: manager,
        metadataStore: manager.metadataStore,
        initUserData: initUserData,
        queries: queries,
        loadData: loadData,
        //clearUserData: clearUserData,

    };
    return dataservice;
}(jQuery, DevExpress, MobileSales);