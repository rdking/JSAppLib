import * as CFProtected from "./node_modules/cfprotected/index.mjs";
import Base from "./src/jsBase.mjs";
import ManagerBase from "./src/jsManagerBase.mjs";
import Management from "./src/jsManagement.mjs";
import ActionManager from "./src/jsActionManager.mjs";
import Action from "./src/jsAction.mjs";
import Theme from "./src/jsTheme.mjs";
import ThemeManager from "./src/jsThemeManager.mjs";
import DataFormatManager from "./src/jsDataFormatManager.mjs";
import DataFormat from "./src/jsDataFormat.mjs";
import From from "./src/jsFrom.mjs";
import To from "./src/jsTo.mjs";
// import DialogManager from "./src/jsDialogManager.mjs";
// import Dialog from "./src/jsDialog.mjs";
import ActivityIndicator from "./src/jsActivityIndicator.mjs";
import ActionButton from "./src/jsActionButton.mjs";
import SCSPanel from "./src/jsSCSPanel.mjs";
import Surface from "./src/jsSurface.mjs";
import Menu from "./src/jsMenu.mjs";
import MenuItem from "./src/jsMenuItem.mjs";
import PopupMenu from "./src/jsPopupMenu.mjs";
import StatusBar from "./src/jsStatusBar.mjs";
import SplitPanel from "./src/jsSplitPanel.mjs";
import HSplitPanel from "./src/jsHSplitPanel.mjs";
import VSplitPanel from "./src/jsVSplitPanel.mjs";
import MDIPanel from "./src/jsMDIPanel.mjs";
import MDIWindow from "./src/jsMDIWindow.mjs";
import Tab from "./src/jsTab.mjs";
import TabStrip from "./src/jsTabStrip.mjs";
import TabBook from "./src/jsTabBook.mjs";
import TabPage from "./src/jsTabPage.mjs";
import ToolBar from "./src/jsToolBar.mjs";
import ListView from "./src/jsListView.mjs";
import ListItem from "./src/jsListItem.mjs";
import CollapsePanel from "./src/jsCollapsePanel.mjs";
import TreeView from "./src/jsTreeView.mjs";
import TreeBranch from "./src/jsTreeBranch.mjs";
import TreeLeaf from "./src/jsTreeLeaf.mjs";
import App from "./src/jsApp.mjs";

// @ts-ignore
if (!globalThis.JSAppLib) {
    Object.defineProperty(globalThis, "JSAppLib", {
        enumerable: false,
        configurable: false,
        writable: false,
        value: {}
    });
}

Object.assign(globalThis.JSAppLib, { 
    CFProtected, Base, App, ManagerBase, Management, ActionManager, Action,
    ActivityIndicator, ThemeManager, Theme, DataFormatManager, DataFormat,
    From, To, /*DialogManager, Dialog,*/ ActionButton, Surface, Menu,
    MenuItem, PopupMenu, SCSPanel, StatusBar, SplitPanel, HSplitPanel, 
    VSplitPanel, MDIPanel, MDIWindow, Tab, TabStrip, TabBook, TabPage, 
    ToolBar, ListView, ListItem, CollapsePanel, TreeView, TreeBranch, TreeLeaf
});

JSAppLib.App.ready();
JSAppLib.app.classList.remove("hidden");
