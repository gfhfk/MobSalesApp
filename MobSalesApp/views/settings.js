/// <reference path="../Scripts/_references.js" />
MobileSales.Settings = function (params) {
    var app = MobileSales,
        
        self = this;

    var vm = {
        entityList: ko.observableArray([]),
        loading: ko.observableArray(),
        viewShowing: getEntities,
      

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
            }).fail(function (error) {
                item.status("Error");
                vm.loading.pop();
                app.logger.log(error);
            });
            return item;
        });
        vm.entityList(mapped);
    };
    return vm;
};
