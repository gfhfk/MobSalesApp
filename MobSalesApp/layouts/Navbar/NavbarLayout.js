(function($, DX, undefined) {
    var HAS_NAVBAR_CLASS = "has-navbar",
        HAS_TOOLBAR_CLASS = "has-toolbar",
        HAS_TOOLBAR_BOTTOM_CLASS = "has-toolbar-bottom",
        TOOLBAR_BOTTOM_ACTIVE_CLASS = "dx-appbar-active",
        SEMI_HIDDEN_CLASS = "semi-hidden",
        TOOLBAR_BOTTOM_SELECTOR = ".layout-toolbar-bottom.win8",
        ACTIVE_PIVOT_ITEM_SELECTOR = ".dx-pivot-item:not(.dx-pivot-item-hidden)",
        LAYOUT_FOOTER_SELECTOR = ".layout-footer",
        ACTIVE_TOOLBAR_SELECTOR = ".dx-toolbar.dx-active-view";
    DX.framework.html.PivotController = DX.framework.html.DefaultLayoutController.inherit({
        init: function(options) {
            this.callBase(options)
        },
        _getLayoutTemplateName: function() {
            return "navbar"
        },
        _createNavigation: function(navigationCommands) {
            var self = this;
            this.$pivot = $("<div/>").appendTo(this._$hiddenBag).dxPivot({itemRender: function(itemData, itemIndex, itemElement) {
                    self._createEmptyLayout().appendTo(itemElement)
                }}).dxCommandContainer({id: 'global-navigation'});
            var container = this.$pivot.dxCommandContainer("instance");
            this._commandManager._arrangeCommandsToContainers(navigationCommands, [container])
        },
        _getRootElement: function() {
            return this.$pivot
        },
        _getViewFrame: function(viewInfo) {
            return this.$pivot.find(ACTIVE_PIVOT_ITEM_SELECTOR)
        },
        _showViewImpl: function(viewInfo, direction) {
            this._notifyViewRendered(viewInfo);
            this._showViewElements(viewInfo.renderResult.$transitionContentElements);
            this._$frame = this._getViewFrame(viewInfo);
            this._changeAppbar(this._$frame);
            this._changeView(viewInfo);
            return $.Deferred().resolve().promise()
        },
        _changeAppbar: function($prevFrame) {
            this._$appbar = $prevFrame.find(TOOLBAR_BOTTOM_SELECTOR + ".dx-active-view").insertAfter(this.$pivot).addClass(TOOLBAR_BOTTOM_ACTIVE_CLASS);
            this._initToolbar(this._$appbar);
            var appbar = this._$appbar.data("dxToolbar"),
                self = this;
            if (appbar) {
                self._refreshAppbarVisibility(appbar, self.$pivot);
                appbar.optionChanged.add(function(optionName, optionValue) {
                    if (optionName === "items")
                        self._refreshAppbarVisibility(appbar, self.$pivot)
                })
            }
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
        _initToolbar: function($layoutFooter) {
            if (!$layoutFooter.data("__inited")) {
                $layoutFooter.data("__inited", true);
                $layoutFooter.click(function() {
                    if ($layoutFooter.children().get(0) === event.srcElement)
                        $(this).toggleClass(SEMI_HIDDEN_CLASS)
                })
            }
        },
        _hideView: function(viewInfo) {
            this._$appbar.appendTo($(LAYOUT_FOOTER_SELECTOR, this._$frame)).removeClass(TOOLBAR_BOTTOM_ACTIVE_CLASS);
            this.callBase.apply(this, arguments)
        }
    });
    DX.framework.html.NavBarController = DX.framework.html.OneFrameLayoutController.inherit({
        _getLayoutTemplateName: function() {
            return "navbar"
        },
        _createNavigation: function(navigationCommands) {
            this.callBase(navigationCommands);
            var $navbar = this._$mainLayout.find(".navbar-container");
            if ($navbar.length && navigationCommands) {
                $navbar.dxNavBar().dxCommandContainer({id: 'global-navigation'});
                var container = $navbar.dxCommandContainer("instance");
                this._commandManager._arrangeCommandsToContainers(navigationCommands, [container]);
                this._$mainLayout.addClass(HAS_NAVBAR_CLASS)
            }
        },
        _showViewImpl: function(viewInfo) {
            var self = this;
            return self.callBase.apply(self, arguments).done(function() {
                    var $toolbar = self._$mainLayout.find(LAYOUT_FOOTER_SELECTOR).find(ACTIVE_TOOLBAR_SELECTOR),
                        isToolbarEmpty = !$toolbar.length || !$toolbar.dxToolbar("instance").option("visible");
                    self._$mainLayout.toggleClass(HAS_TOOLBAR_CLASS, !isToolbarEmpty)
                })
        }
    });
    DX.framework.html.layoutControllers.push({
        name: "navbar",
        platform: "ios",
        controller: new DX.framework.html.NavBarController
    });
    DX.framework.html.layoutControllers.push({
        name: "navbar",
        platform: "android",
        controller: new DX.framework.html.NavBarController
    });
    DX.framework.html.layoutControllers.push({
        name: "navbar",
        platform: "tizen",
        controller: new DX.framework.html.NavBarController
    });
    DX.framework.html.layoutControllers.push({
        name: "navbar",
        platform: "win8",
        phone: true,
        root: true,
        controller: new DX.framework.html.PivotController
    });
    DX.framework.html.layoutControllers.push({
        name: "split",
        platform: "win8",
        phone: false,
        root: true,
        controller: new DX.framework.html.NavBarController
    });
    DX.framework.html.layoutControllers.push({
        name: "navbar",
        platform: "generic",
        controller: new DX.framework.html.NavBarController
    })
})(jQuery, DevExpress);