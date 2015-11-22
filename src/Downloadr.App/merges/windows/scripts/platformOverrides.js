(function () {

    var systemNavigation = Windows.UI.Core.SystemNavigationManager.getForCurrentView();
    systemNavigation.appViewBackButtonVisibility = Windows.UI.Core.AppViewBackButtonVisibility.visible;
    //systemNavigation.appViewBackButtonVisibility = Windows.UI.Core.AppViewBackButtonVisibility.collapsed;

    // function to handle the system Navigation Event 
    function handleSystemNavigationEvent(args) {

        args.handled = true;
    };

     //var systemNavigationManager = Windows.UI.Core.SystemNavigationManager.getForCurrentView();
     //systemNavigationManager.addEventListener("backrequested", this.handleSystemNavigationEvent.bind(this));



    /*
        This function expects two hexStrings and relies on hexStrToRGBA to convert
        to a JSON object that represents RGBA for the underlying Windows API to 
        understand.
    
        Examples of valid values: 
        setAppBarColors('#FFFFFF','#000000');
        setAppBarColors('#FFF','#000');
        setAppBarColors('FFFFFF','000000');
        setAppBarColors('FFF','000');
    
    */

     function setAppBarColors() {
         // Detect if the Windows namespace exists in the global object
         if (typeof Windows !== 'undefined' &&
                  typeof Windows.UI !== 'undefined' &&
                  typeof Windows.UI.ViewManagement !== 'undefined') {


             //var black = hexStrToRGBA('#171717');
             var foreground = hexStrToRGBA('#FFF');
             var background = hexStrToRGBA('#171717');
             var hover = hexStrToRGBA('#2e2e2e');
             var pressed = hexStrToRGBA('#454545');
             var inactive = hexStrToRGBA('#767676');
             //var brandColorInactive = hexStrToRGBA('#171717');

             // Get a reference to the App Title Bar
             var appTitleBar = Windows.UI.ViewManagement.ApplicationView.getForCurrentView().titleBar;

             appTitleBar.foregroundColor = foreground;
             appTitleBar.backgroundColor = background;

             appTitleBar.buttonForegroundColor = foreground;
             appTitleBar.buttonBackgroundColor = background;

             appTitleBar.buttonHoverForegroundColor = foreground;
             appTitleBar.buttonHoverBackgroundColor = hover;

             appTitleBar.buttonPressedForegroundColor = foreground;
             appTitleBar.buttonPressedBackgroundColor = pressed;

             appTitleBar.inactiveForegroundColor = inactive;
             appTitleBar.inactiveBackgroundColor = background;

             appTitleBar.buttonInactiveForegroundColor = inactive;
             appTitleBar.buttonInactiveBackgroundColor = background;

             appTitleBar.buttonInactiveHoverForegroundColor = foreground;
             appTitleBar.buttonInactiveHoverBackgroundColor = hover;

             //appTitleBar.buttonPressedForegroundColor = brandColor;
             //appTitleBar.buttonPressedBackgroundColor = brandColorInactive;
         }
     }
    // Helper function to support HTML hexColor Strings
     function hexStrToRGBA(hexStr) {
         // RGBA color object
         var colorObject = { r: 255, g: 255, b: 255, a: 255 };

         // remove hash if it exists
         hexStr = hexStr.replace('#', '');

         if (hexStr.length === 6) {
             // No Alpha
             colorObject.r = parseInt(hexStr.slice(0, 2), 16);
             colorObject.g = parseInt(hexStr.slice(2, 4), 16);
             colorObject.b = parseInt(hexStr.slice(4, 6), 16);
             colorObject.a = parseInt('0xFF', 16);
         } else if (hexStr.length === 8) {
             // Alpha
             colorObject.r = parseInt(hexStr.slice(0, 2), 16);
             colorObject.g = parseInt(hexStr.slice(2, 4), 16);
             colorObject.b = parseInt(hexStr.slice(4, 6), 16);
             colorObject.a = parseInt(hexStr.slice(6, 8), 16);
         } else if (hexStr.length === 3) {
             // Shorthand hex color
             var rVal = hexStr.slice(0, 1);
             var gVal = hexStr.slice(1, 2);
             var bVal = hexStr.slice(2, 3);
             colorObject.r = parseInt(rVal + rVal, 16);
             colorObject.g = parseInt(gVal + gVal, 16);
             colorObject.b = parseInt(bVal + bVal, 16);
         } else {
             throw new Error('Invalid HexString length. Expected either 8, 6, or 3. The actual length was ' + hexStr.length);
         }
         return colorObject;
     }

    // Initialize when the Window loads
     addEventListener('load', function () {
         setAppBarColors();
     });

    //var systemNavigationManager = Windows.UI.Core.SystemNavigationManager;

    //var appViewBackButtonVisibility = systemNavigationManager.appViewBackButtonVisibility;
    //systemNavigationManager.appViewBackButtonVisibility = appViewBackButtonVisibility;

    //var value = Windows.UI.Core.AppViewBackButtonVisibility.visible;

    //console.log(appViewBackButtonVisibility);

    //systemNavigationManager.appViewBackButtonVisibility = value;

    //console.log(systemNavigationManager.appViewBackButtonVisibility);

    // Append the safeHTML polyfill
    var scriptElem = document.createElement('script');
    scriptElem.setAttribute('src', 'scripts/winstore-jscompat.js');
    if (document.body) {
        document.body.appendChild(scriptElem);
    } else {
        document.head.appendChild(scriptElem);
    }
}());