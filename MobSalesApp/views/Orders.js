MobileSales.Orders = function (params) {
    var app = MobileSales,
        
        self = this;

    var vm = {
        customerID: params.item,
        orders: ko.observableArray([]),
        viewShowing: viewShowing,
    };
    function viewShowing() {
        vm.orders(app.dataservice.getOrders(vm.customerID));
    }
    return vm;
};

