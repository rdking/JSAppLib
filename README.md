# JSAppLib

JSAppLib is an HTML Custom Elements based component library designed to make it as simple and straight forward as possible for someone to create a fully featured desktop-like application in a web browser. This library is designed in such a way that nearly everything that affects the UI is controlled through the provided HTML tags and CSS stylesheets. The entire library is event driven following the same model as is used by the native HTML tags, making it that much easier to understand and write application UIs using this library.

Since JSAppLib is a **library** and not a _framework_, and it follows the same general conventions as native HTML tags, then this library is compatible with nearly every one of your favorite frameworks. Whether it's Angular, React, Svelt, Vue, or any of a number of other frameworks that depend directly on HTML tags, JSAppLib tags can be used whereever an HTML tag is used. At the same time, you can also opt to completely skip the frameworks altogether and just use JSAppLib directly and on its own.

## Features
* ### **Full support for standard HTML tags**
* ### **Full support for CSS**
* ### **Full support for JS private fields**
* ### **Support for sharing private fields via [CFProtected](https://github.com/rdking/cfprotected)**
* ### **Configurable support for custom layered & selectable theming**
* ### **Configurable support for data binding**
* ### **Configurable support for actions**
* ### **NO VDOM!**
* ### **Client Side Rendering**
* ### **Mostly unopinionated design**

## Some Brief Explanations
This is a mostly unopinionated library. What this means is that unlike most framworks, which lock you into a particular way of structuring your files and designing your code, JSAppLib is just a library. The only opinions it contains are in how the various provided components should function. In as much as it's reasonably possible, those opinions shouldn't too greatly affect how you structure your files and code.

The library works by using the HTML Custom Elements specification to create custom HTML tags that can be recognized by the browser and rendered by user-supplied logic. This means that instead of being blank slates that have to be completely populated by the client, the entire page can be described on the server side but include JSAppLib tags. It's also possible that JSAppLib tags can be added by logic on the client side. This is what allows this library to work with both CSR and SSR frameworks. From their point of view, JSAppLib is just another collection of HTML tags!

With the inclusion of private fields in JavaScript, there is now a simple and straight forward way of completely encapsulating data in a Javascript class. However, for various reasons, the ability to share that data with descendant classes was not provided. To remedy this, the CFProtected library is used. It is a non-intrusive library that provides a small set of helper functions to share the elements in a single private field with any and all descendants of that class. This among the helper functions are a few that help to work around some of the footguns that are inherent in the use of private fields (like the incompatibility with Proxy to name one). For more details, look at the README.md file in the [CFProtected library](https://github.com/rdking/cfprotected).

## Provided Tags
* ### **Management Tags**
    * **\<js-management>** - The management container. All non-rendering management tags belong in here
    * **\<js-actionmanager>** - Maintains centralized action definitions for any control designed to use them. Also ensures that updates to an action immediately affect the controls using it.
    * **\<js-action>** - A single action definition to be reused by menus and JS logic
    * &dagger; **\<js-databindingmanager>** - Maintains and provides mappings for 2-way data bindings.
    * &dagger; **\<js-binding>** - A single binding definition to map between actions or datasource m s and bindable components.
    * &dagger; **\<js-datasourcemanager>** - Maintains and provides data sources usable by the binding manager.
    * &dagger; **\<js-datasource>** - A single definition specifying a data source location and the means of retrieval.
    * **\<js-dataformatmanager>** - Maintains and provides translators for data embedded in the HTML.
    * &dagger; **\<js-dataformat>** - A single data format definition providing translators to and from native JS objects.
    * **\<js-dialogmanager>** - Provides a way to create reusable dialog boxes.
    * **\<js-dialog>** - A single dialog box.
    * **\<js-thememanager>** - Loads and provides layered, swapable theming support to all tags
    * **\<js-theme>** - A single theme definition.

    ##### &dagger; Comming soon.

* ### **UI Tags**
    * **\<js-app>** - Provides a flexible framework for all other UI tags
    * **\<js-label>** - A bindable, read-only text area
    * **\<js-editor>** - A bindable, editable text area
    * **\<js-menu>** - A horizontal bar menu control with hotkey support
    * **\<js-menuitem>** - A single item control for use in a menu
    * **\<js-menuseparator>** - A single non-selectable item control for use in a menu
    * **\<js-popupMenu>** - A single, positionable, floating, vertical menu control
    * **\<js-statusBar>** - A partitionable horizontal message bar
    * **\<js-tabset>** - A blank container that organizes children into tabs
    * **\<js-tab>** - A blank container representing a single tab in a tabset
    * **\<js-toolbar>** - A horizontally or vertically aligned control bar
    * **\<js-toolbutton>** - A bindablebutton control for a toolbar
    * **\<js-listview>** - A bindable vertical list container with multi-selection capability
    * **\<js-listitem>** - A bindable single item in a list view
    * **\<js-collapsepanel>** - A bindable 2-segment, vertically split container where the bottom portion can be collapsed away
    * **\<js-treeview>** - A bindable list view variant allowing items to be nestable, collapsible sub-lists
    * **\<js-treebranch>** - A bindable sub-list element of a treeview
    * **\<js-treeleaf>** - A bindable single item in a treeview
    * **\<js-mdipanel>** - A blank container that organizes children into movable child windows
    * **\<js-mdiwindow>** - A titled, movable, minimizable, container window with its own HTML context.

