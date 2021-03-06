﻿/// <reference path="../Scripts/_references.js" />
MobileSales.Settings = function (params) {
    var app = MobileSales,
        needToSynchonize = params.item==="1",
        self = this;

    var vm = {
        entityList: ko.observableArray([]),
        loading: ko.observableArray(),
        viewShowing: function () {
            if (needToSynchonize)
                getEntities();
        },
        viewShown: function () {
            $(".dx-active-view .dx-scrollable").data("dxScrollView").scrollTo(0);
        },
        synchData: getEntities,

    };

    vm.message = ko.computed(function () {
        return "Loading ...(left:" + this.loading().length + ")"
    }, vm);

    function getEntities() {
        var mapped = $.map(app.dataservice.queries, function (item) {
            item.status = ko.observable("Loading");
            vm.loading.push(true);
            app.dataservice.loadData(item.query).then(function (data) {
                app.logger.log("Loaded data: " + item.query.resourceName);
                item.status("Succeded");
                app.logger.log(app.dataservice.getRoutes());
                vm.loading.pop();
                if (vm.loading().length === 0)
                    app.dataservice.saveDataLocally();
            }).fail(function (error) {
                item.status("Error");
                app.logger.error("Error Loading data");
                app.logger.log(error);
                vm.loading.pop();
            });
            return item;
        });
        vm.entityList(mapped);
    };
    return vm;
};
