!function ($, DX, app, undefined) {
    app.productTypes=[
        {
            "ProductTypeID": 1, "ProductTypeName": "Proudct type 1"
        }, {
            "ProductTypeID": 2, "ProductTypeName": "Proudct type 2"
        }, {
            "ProductTypeID": 3, "ProductTypeName": "Proudct type 3"
        }, {
            "ProductTypeID": 4, "ProductTypeName": "Proudct type 4"
        }, {
            "ProductTypeID": 5, "ProductTypeName": "Proudct type 5"
        }
    ];
    app.products = [
           {
               "ProductID": 1, "ProductName": "Product name 1_0", "Price": "9.99", "ProductTypeID": 1
           }, {
               "ProductID": 2, "ProductName": "Product name 1_1", "Price": "9.99", "ProductTypeID": 1
           }, {
               "ProductID": 11, "ProductName": "Product name 1_10", "Price": "9.99", "ProductTypeID": 1
           }, {
               "ProductID": 12, "ProductName": "Product name 1_11", "Price": "9.99", "ProductTypeID": 1
           }, {
               "ProductID": 13, "ProductName": "Product name 1_12", "Price": "9.99", "ProductTypeID": 1
           }, {
               "ProductID": 14, "ProductName": "Product name 1_13", "Price": "9.99", "ProductTypeID": 1
           }, {
               "ProductID": 15, "ProductName": "Product name 1_14", "Price": "9.99", "ProductTypeID": 1
           }, {
               "ProductID": 16, "ProductName": "Product name 1_15", "Price": "9.99", "ProductTypeID": 1
           }, {
               "ProductID": 17, "ProductName": "Product name 1_16", "Price": "9.99", "ProductTypeID": 1
           }, {
               "ProductID": 18, "ProductName": "Product name 1_17", "Price": "9.99", "ProductTypeID": 1
           }, {
               "ProductID": 19, "ProductName": "Product name 1_18", "Price": "9.99", "ProductTypeID": 1
           }, {
               "ProductID": 20, "ProductName": "Product name 1_19", "Price": "9.99", "ProductTypeID": 1
           }, {
               "ProductID": 3, "ProductName": "Product name 1_2", "Price": "9.99", "ProductTypeID": 1
           }, {
               "ProductID": 21, "ProductName": "Product name 1_20", "Price": "9.99", "ProductTypeID": 1
           }, {
               "ProductID": 22, "ProductName": "Product name 1_21", "Price": "9.99", "ProductTypeID": 1
           }, {
               "ProductID": 4, "ProductName": "Product name 1_3", "Price": "9.99", "ProductTypeID": 1
           }, {
               "ProductID": 5, "ProductName": "Product name 1_4", "Price": "9.99", "ProductTypeID": 1
           }, {
               "ProductID": 6, "ProductName": "Product name 1_5", "Price": "9.99", "ProductTypeID": 1
           }, {
               "ProductID": 7, "ProductName": "Product name 1_6", "Price": "9.99", "ProductTypeID": 1
           }, {
               "ProductID": 8, "ProductName": "Product name 1_7", "Price": "9.99", "ProductTypeID": 1
           }, {
               "ProductID": 9, "ProductName": "Product name 1_8", "Price": "9.99", "ProductTypeID": 1
           }, {
               "ProductID": 10, "ProductName": "Product name 1_9", "Price": "9.99", "ProductTypeID": 1
           }, {
               "ProductID": 23, "ProductName": "Product name 2_0", "Price": "9.99", "ProductTypeID": 2
           }, {
               "ProductID": 24, "ProductName": "Product name 2_1", "Price": "9.99", "ProductTypeID": 2
           }, {
               "ProductID": 33, "ProductName": "Product name 2_10", "Price": "9.99", "ProductTypeID": 2
           }, {
               "ProductID": 34, "ProductName": "Product name 2_11", "Price": "9.99", "ProductTypeID": 2
           }, {
               "ProductID": 35, "ProductName": "Product name 2_12", "Price": "9.99", "ProductTypeID": 2
           }, {
               "ProductID": 36, "ProductName": "Product name 2_13", "Price": "9.99", "ProductTypeID": 2
           }, {
               "ProductID": 37, "ProductName": "Product name 2_14", "Price": "9.99", "ProductTypeID": 2
           }, {
               "ProductID": 38, "ProductName": "Product name 2_15", "Price": "9.99", "ProductTypeID": 2
           }, {
               "ProductID": 39, "ProductName": "Product name 2_16", "Price": "9.99", "ProductTypeID": 2
           }, {
               "ProductID": 40, "ProductName": "Product name 2_17", "Price": "9.99", "ProductTypeID": 2
           }, {
               "ProductID": 41, "ProductName": "Product name 2_18", "Price": "9.99", "ProductTypeID": 2
           }, {
               "ProductID": 42, "ProductName": "Product name 2_19", "Price": "9.99", "ProductTypeID": 2
           }, {
               "ProductID": 25, "ProductName": "Product name 2_2", "Price": "9.99", "ProductTypeID": 2
           }, {
               "ProductID": 43, "ProductName": "Product name 2_20", "Price": "9.99", "ProductTypeID": 2
           }, {
               "ProductID": 44, "ProductName": "Product name 2_21", "Price": "9.99", "ProductTypeID": 2
           }, {
               "ProductID": 45, "ProductName": "Product name 2_22", "Price": "9.99", "ProductTypeID": 2
           }, {
               "ProductID": 46, "ProductName": "Product name 2_23", "Price": "9.99", "ProductTypeID": 2
           }, {
               "ProductID": 26, "ProductName": "Product name 2_3", "Price": "9.99", "ProductTypeID": 2
           }, {
               "ProductID": 27, "ProductName": "Product name 2_4", "Price": "9.99", "ProductTypeID": 2
           }, {
               "ProductID": 28, "ProductName": "Product name 2_5", "Price": "9.99", "ProductTypeID": 2
           }, {
               "ProductID": 29, "ProductName": "Product name 2_6", "Price": "9.99", "ProductTypeID": 2
           }, {
               "ProductID": 30, "ProductName": "Product name 2_7", "Price": "9.99", "ProductTypeID": 2
           }, {
               "ProductID": 31, "ProductName": "Product name 2_8", "Price": "9.99", "ProductTypeID": 2
           }, {
               "ProductID": 32, "ProductName": "Product name 2_9", "Price": "9.99", "ProductTypeID": 2
           }, {
               "ProductID": 47, "ProductName": "Product name 3_0", "Price": "9.99", "ProductTypeID": 3
           }, {
               "ProductID": 48, "ProductName": "Product name 3_1", "Price": "9.99", "ProductTypeID": 3
           }, {
               "ProductID": 57, "ProductName": "Product name 3_10", "Price": "9.99", "ProductTypeID": 3
           }, {
               "ProductID": 58, "ProductName": "Product name 3_11", "Price": "9.99", "ProductTypeID": 3
           }, {
               "ProductID": 59, "ProductName": "Product name 3_12", "Price": "9.99", "ProductTypeID": 3
           }, {
               "ProductID": 60, "ProductName": "Product name 3_13", "Price": "9.99", "ProductTypeID": 3
           }, {
               "ProductID": 61, "ProductName": "Product name 3_14", "Price": "9.99", "ProductTypeID": 3
           }, {
               "ProductID": 62, "ProductName": "Product name 3_15", "Price": "9.99", "ProductTypeID": 3
           }, {
               "ProductID": 63, "ProductName": "Product name 3_16", "Price": "9.99", "ProductTypeID": 3
           }, {
               "ProductID": 64, "ProductName": "Product name 3_17", "Price": "9.99", "ProductTypeID": 3
           }, {
               "ProductID": 65, "ProductName": "Product name 3_18", "Price": "9.99", "ProductTypeID": 3
           }, {
               "ProductID": 66, "ProductName": "Product name 3_19", "Price": "9.99", "ProductTypeID": 3
           }, {
               "ProductID": 49, "ProductName": "Product name 3_2", "Price": "9.99", "ProductTypeID": 3
           }, {
               "ProductID": 67, "ProductName": "Product name 3_20", "Price": "9.99", "ProductTypeID": 3
           }, {
               "ProductID": 68, "ProductName": "Product name 3_21", "Price": "9.99", "ProductTypeID": 3
           }, {
               "ProductID": 69, "ProductName": "Product name 3_22", "Price": "9.99", "ProductTypeID": 3
           }, {
               "ProductID": 70, "ProductName": "Product name 3_23", "Price": "9.99", "ProductTypeID": 3
           }, {
               "ProductID": 71, "ProductName": "Product name 3_24", "Price": "9.99", "ProductTypeID": 3
           }, {
               "ProductID": 72, "ProductName": "Product name 3_25", "Price": "9.99", "ProductTypeID": 3
           }, {
               "ProductID": 50, "ProductName": "Product name 3_3", "Price": "9.99", "ProductTypeID": 3
           }, {
               "ProductID": 51, "ProductName": "Product name 3_4", "Price": "9.99", "ProductTypeID": 3
           }, {
               "ProductID": 52, "ProductName": "Product name 3_5", "Price": "9.99", "ProductTypeID": 3
           }, {
               "ProductID": 53, "ProductName": "Product name 3_6", "Price": "9.99", "ProductTypeID": 3
           }, {
               "ProductID": 54, "ProductName": "Product name 3_7", "Price": "9.99", "ProductTypeID": 3
           }, {
               "ProductID": 55, "ProductName": "Product name 3_8", "Price": "9.99", "ProductTypeID": 3
           }, {
               "ProductID": 56, "ProductName": "Product name 3_9", "Price": "9.99", "ProductTypeID": 3
           }, {
               "ProductID": 73, "ProductName": "Product name 4_0", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 74, "ProductName": "Product name 4_1", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 83, "ProductName": "Product name 4_10", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 84, "ProductName": "Product name 4_11", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 85, "ProductName": "Product name 4_12", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 86, "ProductName": "Product name 4_13", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 87, "ProductName": "Product name 4_14", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 88, "ProductName": "Product name 4_15", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 89, "ProductName": "Product name 4_16", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 90, "ProductName": "Product name 4_17", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 91, "ProductName": "Product name 4_18", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 92, "ProductName": "Product name 4_19", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 75, "ProductName": "Product name 4_2", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 93, "ProductName": "Product name 4_20", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 94, "ProductName": "Product name 4_21", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 95, "ProductName": "Product name 4_22", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 96, "ProductName": "Product name 4_23", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 97, "ProductName": "Product name 4_24", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 98, "ProductName": "Product name 4_25", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 99, "ProductName": "Product name 4_26", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 100, "ProductName": "Product name 4_27", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 76, "ProductName": "Product name 4_3", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 77, "ProductName": "Product name 4_4", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 78, "ProductName": "Product name 4_5", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 79, "ProductName": "Product name 4_6", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 80, "ProductName": "Product name 4_7", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 81, "ProductName": "Product name 4_8", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 82, "ProductName": "Product name 4_9", "Price": "9.99", "ProductTypeID": 4
           }, {
               "ProductID": 101, "ProductName": "Product name 5_0", "Price": "9.99", "ProductTypeID": 5
           }, {
               "ProductID": 102, "ProductName": "Product name 5_1", "Price": "9.99", "ProductTypeID": 5
           }, {
               "ProductID": 111, "ProductName": "Product name 5_10", "Price": "9.99", "ProductTypeID": 5
           }, {
               "ProductID": 112, "ProductName": "Product name 5_11", "Price": "9.99", "ProductTypeID": 5
           }, {
               "ProductID": 113, "ProductName": "Product name 5_12", "Price": "9.99", "ProductTypeID": 5
           }, {
               "ProductID": 114, "ProductName": "Product name 5_13", "Price": "9.99", "ProductTypeID": 5
           }, {
               "ProductID": 115, "ProductName": "Product name 5_14", "Price": "9.99", "ProductTypeID": 5
           }, {
               "ProductID": 116, "ProductName": "Product name 5_15", "Price": "9.99", "ProductTypeID": 5
           }, {
               "ProductID": 117, "ProductName": "Product name 5_16", "Price": "9.99", "ProductTypeID": 5
           }, {
               "ProductID": 118, "ProductName": "Product name 5_17", "Price": "9.99", "ProductTypeID": 5
           }, {
               "ProductID": 119, "ProductName": "Product name 5_18", "Price": "9.99", "ProductTypeID": 5
           }, {
               "ProductID": 120, "ProductName": "Product name 5_19", "Price": "9.99", "ProductTypeID": 5
           }, {
               "ProductID": 103, "ProductName": "Product name 5_2", "Price": "9.99", "ProductTypeID": 5
           }, {
               "ProductID": 104, "ProductName": "Product name 5_3", "Price": "9.99", "ProductTypeID": 5
           }, {
               "ProductID": 105, "ProductName": "Product name 5_4", "Price": "9.99", "ProductTypeID": 5
           }, {
               "ProductID": 106, "ProductName": "Product name 5_5", "Price": "9.99", "ProductTypeID": 5
           }, {
               "ProductID": 107, "ProductName": "Product name 5_6", "Price": "9.99", "ProductTypeID": 5
           }, {
               "ProductID": 108, "ProductName": "Product name 5_7", "Price": "9.99", "ProductTypeID": 5
           }, {
               "ProductID": 109, "ProductName": "Product name 5_8", "Price": "9.99", "ProductTypeID": 5
           }, {
               "ProductID": 110, "ProductName": "Product name 5_9", "Price": "9.99", "ProductTypeID": 5
           }
    ];

}(jQuery, DevExpress, MyApp);