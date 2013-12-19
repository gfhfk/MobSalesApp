﻿/// <reference path="../Scripts/_references.js" />
MobileSales.dataservice =function ($, DX, app, undefined) {
    var DATA_VERSION_KEY = "mobilesales-version",
    DATA_KEY = "mobilesales-data",
    logger = app.logger;
    serviceName = "http://mobsalessrv.azurewebsites.net/odata/";
    //serviceName = "http://localhost:1541/odata/";
   // serviceName = "http://localhost:23888/odata/";
    breeze.config.initializeAdapterInstances({ dataService: "OData" });
    var manager = new breeze.EntityManager(serviceName);
    var store = manager.metadataStore;

    var Customer = function () {
        this.isBeingEdited = ko.observable(false);
    };

    var queries = {
       Routes: {
            name: "Routes",
            query: breeze.EntityQuery.from("Routes").orderBy("RouteID"),
        },
       Customers: {
            name: "Customers",
            query: breeze.EntityQuery.from("Customers").orderBy("CustomerName"),
         },
       ProductTypes: {
           name: "ProductTypes",
           query: breeze.EntityQuery.from("ProductTypes").orderBy("ProductTypeName"),
       },
       Products: {
           name: "Products",
           query: breeze.EntityQuery.from("Products").orderBy("ProductName"),
       },
       Orders: {
           name: "Orders",
           query: breeze.EntityQuery.from("Orders").orderBy("Date"),
       },
       OrderDetails: {
           name: "OrderDetails",
           query: breeze.EntityQuery.from("OrderDetails"),
       },
    };
    
    function initUserData() {
        var dataFromStorage = localStorage.getItem(DATA_KEY);
        if (dataFromStorage) {
            manager.importEntities(dataFromStorage);
            return true;
        } else {
            return false;
        }
    }

    
    function loadData(query) {
        return manager.executeQuery(query);
    }
    function  getRoutes(){
        return manager.executeQueryLocally(queries.Routes.query);
    };
    function getCustomers() {
        return manager.executeQueryLocally(queries.Customers.query);
    };
    function getOrders(customerID) {
        var query = queries.Orders.query;
    
        if (typeof customerID != "undefined" && customerID > 0)
            query= query.where("CustomerID", "==", customerID);
        return manager.executeQueryLocally(query);
    };
    
    function saveDataLocally() {
        var exportData = manager.exportEntities();
        localStorage.setItem(DATA_KEY, exportData);
    }
    var dataservice =  {
        manager: manager,
        metadataStore: manager.metadataStore,
        initUserData: initUserData,
        queries: queries,
        loadData: loadData,
        getRoutes: getRoutes,
        getCustomers: getCustomers,
        saveDataLocally: saveDataLocally,
        getOrders: getOrders,
    };
    return dataservice;
}(jQuery, DevExpress, MobileSales);