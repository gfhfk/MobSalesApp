!function ($, DX, app, undefined) {
    var DATA_VERSION_KEY = "mobilesales-version",
    DATA_KEY = "mobilesales-data",
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
        var query = breeze.EntityQuery.from("Routes").orderBy("RouteID");
        manager.executeQuery(query).then(function (data) {
            console.log(data.results);
        }).fail(function (error) {
            //logger.error("Load data error. Try later.");
            //logger.log(error);
            console.log(error);
        });

        var query = breeze.EntityQuery.from("Customers")
            .orderBy("CustomerName");
        manager.executeQuery(query).then(function (data) {
            console.log(data.results);
        }).fail(function (error) {
            
            console.log(error);
        });
    }

    $.extend(app, {
        manager: manager,
        metadataStore: manager.metadataStore,
        initUserData: initUserData,
        //clearUserData: clearUserData,

    });

}(jQuery, DevExpress, MobileSales);