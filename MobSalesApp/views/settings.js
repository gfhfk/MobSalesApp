/// <reference path="../Scripts/_references.js" />
MobileSales.Settings = function (params) {
    var app = MobileSales,
        self = this;

    var vm = {
        entityList: ko.observableArray([]),
        loading: ko.observableArray(),
        viewShowing: getEntities,

    };
    function getEntities() {
        var mapped = $.map(app.dataservice.queries, function (item) {
            item.status = ko.observable("Loading");
            vm.loading.push(true);
            app.dataservice.loadData(item.query).then(function (data) {
                logger.log("Loaded data: " + query.resourceName);
                item.status("Succeded");
                vm.loading.pop();
            }).fail(function (error) {
                item.status("Succeded");
                vm.loading.pop();
                logger.log(error);
            });
            return item;
        });
        vm.entityList(mapped);
    };
    return vm;
};
