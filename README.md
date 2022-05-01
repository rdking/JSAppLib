# JSAppLib

JSAppLib is an HTML Custom Elements based component library designed to make it as simple and straight forward as possible for someone to create a fully featured desktop-like application in a web browser. This library is designed in such a way that nearly everything that affects the UI is controlled through the provided HTML tags and CSS stylesheets. The entire library is event driven following the same model as is used by the native HTML tags, making it that much easier to understand and write application UIs using this library.

## Features
* ### **Full support for private fields**
* ### **Support for protected fields via CFProtected**
* ### **Full support for standard HTML tags**
* ### **Full support for CSS**
* ### **Configurable support for custom layered & selectable theming**
* ### **Configurable support for data binding**
* ### **Configurable suport for actions**
* ### **Mostly unopinionated design**
* ### **Non-rendering management tags**

    * **\<js-management\>** - The management container. All non-rendering management tags belong in here
    * **\<js-thememanager\>** - Loads and provides layered, swapable theming support to all tags
    * **\<js-actionmanager\>** - Maintains centralized action definitions for any control designed to use them. Also ensures that updates to an action immediately affect the controls using it.
    * **\<js-datatranslator\>** - Maintains and provides translators for data embedded in the HTML.
    * &dagger; **\<js-bindingmanager\>** - Maintains and provides mappings for 2-way data bindings.
    * &dagger; **\<js-datamanager\>** - Maintains and provides data sources usable by the binding manager.

* ### **UI tags**
    * **\<js-label\>** - 
    * **\<js-editor\>** - 
    * **\<js-menu\>** - 
    * **\<js-menuitem\>** - 
    * **\<js-menuseparator\>** - 
    * **\<js-popupMenu\>** - 
    * **\<js-statusBar\>** - 
    * **\<js-hpanel\>** - 
    * **\<js-vpanel\>** - 
    * **\<js-tabset\>** - 
    * **\<js-tab\>** - 
    * **\<js-toolbar\>** - 
    * **\<js-toolbutton\>** - 
    * **\<js-listview\>** - 
    * **\<js-listitem\>** - 
    * **\<js-collapsepanel\>** - 
    * **\<js-treeview\>** - 
    * **\<js-treebranch\>** - 
    * **\<js-treeleaf\>** - 
    * **\<js-app\>** - Provides a flexible framework for all other UI tags

##### &dagger; Comming soon.