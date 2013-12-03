(function($, DX, undefined) {
    var INITED = "__inited";
    var HAS_TOOLBAR_BOTTOM_CLASS = "has-toolbar-bottom",
        SEMI_HIDDEN_CLASS = "semi-hidden",
        TOOLBAR_BOTTOM_SELECTOR = ".layout-toolbar-bottom.win8";
    DX.framework.html.SimpleLayoutController = DX.framework.html.OneFrameLayoutController.inherit({
        _getLayoutTemplateName: function() {
            return "simple"
        },
        _showViewImpl: function(viewInfo) {
            var self = this,
                result = self.callBase.apply(self, arguments),
                $frame = self._getViewFrame(),
                $appbar = $frame.find(TOOLBAR_BOTTOM_SELECTOR);
            $appbar.each(function(i, element) {
                var $element = $(element);
                appbar = $element.dxToolbar("instance");
                self._initAppbar($element);
                if (appbar) {
                    self._refreshAppbarVisibility(appbar, $frame);
                    appbar.optionChanged.add(function(optionName, optionValue) {
                        if (optionName === "items")
                            self._refreshAppbarVisibility(appbar, $frame)
                    })
                }
            });
            return result
        },
        _refreshAppbarVisibility: function(appbar, $content) {
            var isAppbarNotEmpty = false;
            $.each(appbar.option("items"), function(index, item) {
                if (item.visible) {
                    isAppbarNotEmpty = true;
                    return false
                }
            });
            $content.toggleClass(HAS_TOOLBAR_BOTTOM_CLASS, isAppbarNotEmpty);
            appbar.option("visible", isAppbarNotEmpty)
        },
        _initAppbar: function($appbar) {
            if ($appbar.data(INITED))
                return;
            $appbar.data(INITED, true);
            $appbar.click(function() {
                if ($appbar.children().get(0) === event.srcElement)
                    $(this).toggleClass(SEMI_HIDDEN_CLASS)
            })
        },
        _onRenderComplete: function(viewInfo) {
            var $toolbarBottom = this._getViewFrame().find(".layout-toolbar-bottom");
            window.setTimeout(function() {
                $toolbarBottom.addClass("with-transition")
            })
        }
    });
    DX.framework.html.layoutControllers.push({
        name: "navbar",
        root: false,
        platform: "win8",
        controller: new DX.framework.html.SimpleLayoutController
    });
    DX.framework.html.layoutControllers.push({
        name: "navbar",
        root: false,
        platform: "android",
        controller: new DX.framework.html.SimpleLayoutController
    });
    DX.framework.html.layoutControllers.push({
        name: "simple",
        controller: new DX.framework.html.SimpleLayoutController
    })
})(jQuery, DevExpress);