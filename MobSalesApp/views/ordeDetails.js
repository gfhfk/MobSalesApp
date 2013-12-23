MobileSales.OrderDetails = function (params) {
    var app = MobileSales,
        
        self = this;

    var vm = {
        orderID: params.item,
        orders: ko.observableArray([]),
        viewShowing: viewShowing,
    };
    function viewShowing() {
        vm.orders(app.dataservice.getOrderDetails(vm.orderID));
    }
    return vm;
};

