MobileSales.Home = function (params) {
    var app = MobileSales,
        
        self = this;
    
    var vm = {
        routes:[]

    };
    return vm;
};

//MyApp.home = function (params) {
//    var app = MyApp,
//        self = this;
//    var vm = {
//        showSearch: ko.observable(false),
//        overlayVisible: ko.observable(false),
//        productTypeId: ko.observable(0),
//        productTypes: app.productTypes,
//        currentElemet: ko.observableArray(),  
//        display: ko.observable("0"),
//        orderDetails: ko.observableArray(),
//        find: function () {
//            vm.showSearch(!vm.showSearch());
//            vm.productTypeId(0); 
//        },
//         showOverlay: showOverlay,
//        hideOverlay: hideOverlay,
//        numberClick: numberClick,
//        backspaceClick: backspaceClick,
//        clearClick: clearClick
//    };
//    vm.productList = ko.observableArray($.map(app.products, function (item) {
//          item.Quantity = ko.observable(0);
//        item.filtered = ko.computed(function () {
//            var ret = true;
//            if (vm.productTypeId() > 0 && vm.productTypeId() != item.ProductTypeID)
//                ret = false;
//            return ret;
//        });
//        item.sum = ko.computed(function () {
//            return Math.round(item.Price * item.Quantity() * 100) / 100;
//        });
//        return item;

//    }));
//    function showOverlay(data) {
//        vm.display(String(data.Quantity()));
//        vm.overlayVisible(true);
//        vm.currentElemet = data;
//    };
//    function hideOverlay(data) {
//        vm.currentElemet.Quantity(vm.display());
//        vm.overlayVisible(false);
//    };
//    function numberClick(number) {
//        var button = number.element.text();
//        var newValue = (vm.display() === "0") ? button : vm.display() + button;
//        this.display(newValue);
//    };
//    function clearClick(number) {
//        vm.display("0");
//    }
//    function backspaceClick(number) {
//        var self = vm;
//        if (this.display().length > 1) {
//            self.display(self.display().substr(0, self.display().length - 1));
//        } else {
//            self.display("0");
//        }
//    };

//    return vm;
//};