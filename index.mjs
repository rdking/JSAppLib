import * as CFProtected from "/node_modules/cfprotected/index.mjs";
import TagBase from "/node_modules/jsapplib/src/jsTagBase.mjs";
import Management from "/node_modules/jsapplib/src/jsManagement.mjs";
import ActionManager from "/node_modules/jsapplib/src/jsActionManager.mjs";
import Action from "/node_modules/jsapplib/src/jsAction.mjs";
import ThemeManager from "/node_modules/jsapplib/src/jsThemeManager.mjs";
import Theme from "/node_modules/jsapplib/src/jsTheme.mjs";
import DataTranslator from "/node_modules/jsapplib/src/jsDataTranslator.mjs";
import DialogManager from "/node_modules/jsapplib/src/jsDialogManager.mjs";
import Dialog from "/node_modules/jsapplib/src/jsDialog.mjs";
import ActivityIndicator from "/node_modules/jsapplib/src/jsActivityIndicator.mjs";
import Label from "/node_modules/jsapplib/src/jsLabel.mjs";
import Editor from "/node_modules/jsapplib/src/jsEditor.mjs";
import Menu from "/node_modules/jsapplib/src/jsMenu.mjs";
import MenuItem from "/node_modules/jsapplib/src/jsMenuItem.mjs";
import MenuSeparator from "/node_modules/jsapplib/src/jsMenuSeparator.mjs";
import PopupMenu from "/node_modules/jsapplib/src/jsPopupMenu.mjs";
import StatusBar from "/node_modules/jsapplib/src/jsStatusBar.mjs";
import HorizontalPanel from "/node_modules/jsapplib/src/jsHorizontalPanel.mjs";
import VerticalPanel from "/node_modules/jsapplib/src/jsVerticalPanel.mjs";
import TabSet from "/node_modules/jsapplib/src/jsTabSet.mjs";
import Tab from "/node_modules/jsapplib/src/jsTab.mjs";
import ToolBar from "/node_modules/jsapplib/src/jsToolBar.mjs";
import ToolButton from "/node_modules/jsapplib/src/jsToolButton.mjs";
import ListView from "/node_modules/jsapplib/src/jsListView.mjs";
import ListItem from "/node_modules/jsapplib/src/jsListItem.mjs";
import CollapsePanel from "/node_modules/jsapplib/src/jsCollapsePanel.mjs";
import TreeView from "/node_modules/jsapplib/src/jsTreeView.mjs";
import TreeBranch from "/node_modules/jsapplib/src/jsTreeBranch.mjs";
import TreeLeaf from "/node_modules/jsapplib/src/jsTreeLeaf.mjs";
import App from "/node_modules/jsapplib/src/jsAppLib.mjs";

window.JSAppLib = { 
    CFProtected, TagBase, Management, ActionManager, Action, ThemeManager,
    Theme, DataTranslator, DialogManager, Dialog, ActivityIndicator, Label,
    Editor, Menu, MenuItem, MenuSeparator, PopupMenu, StatusBar,
    HorizontalPanel, VerticalPanel, TabSet, Tab, ToolBar, ToolButton, ListView,
    ListItem, CollapsePanel, TreeView, TreeBranch, TreeLeaf, App
};

window.dispatchEvent(new CustomEvent("ready", { detail: App }));
